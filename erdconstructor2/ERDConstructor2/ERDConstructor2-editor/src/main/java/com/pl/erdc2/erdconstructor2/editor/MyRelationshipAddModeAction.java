package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import java.awt.BasicStroke;
import java.beans.IntrospectionException;
import java.beans.PropertyVetoException;
import org.netbeans.api.visual.action.WidgetAction;
import org.netbeans.api.visual.widget.Widget;
import org.netbeans.api.visual.anchor.AnchorFactory;
import org.netbeans.api.visual.router.RouterFactory;
import org.netbeans.api.visual.widget.ConnectionWidget;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;

public class MyRelationshipAddModeAction extends WidgetAction.Adapter {
    private static boolean drawingRelationship;
    private static Widget firstWidgetOfRelationship;
    private static ConnectionWidget shadow;
    private static RelationshipWidget selfShadow;
    private static boolean escapeBounds;
    
    @Override
    public WidgetAction.State mousePressed(Widget widget, WidgetAction.WidgetMouseEvent event) {
        
        GraphSceneImpl gs = (GraphSceneImpl)widget.getScene();
        
        if(event.getButton()!=1){
            gs.setAddRelationshipMode(false);
            gs.setAddEntityMode(false);
            if(shadow!=null)
                gs.getConnectionLayer().removeChild(shadow);
            shadow=null;
            return WidgetAction.State.CHAIN_ONLY;
        }
        
        if(widget instanceof EntityWidget){    
            if(gs.isAddRelationshipMode()){
                drawingRelationship = true;
                escapeBounds = false;
                firstWidgetOfRelationship = widget;
                
                shadow = new ConnectionWidget(gs);
                shadow.setRouter(RouterFactory.createDirectRouter());
                shadow.setSourceAnchor(AnchorFactory.createFreeRectangularAnchor(firstWidgetOfRelationship, true));
                shadow.setTargetAnchor(AnchorFactory.createFixedAnchor(event.getPoint()));
                shadow.setVisible(false);
                gs.getConnectionLayer().addChild(shadow);
                
                try {
                    RelationshipNode forShadow = new RelationshipNode(new Relationship());
                    forShadow.setDisplayName("");
                    selfShadow = new RelationshipWidget(gs, forShadow);
                    selfShadow.setRouter(new MyRouter());
                    selfShadow.setSourceAnchor(new MyAnchor(firstWidgetOfRelationship, false));
                    selfShadow.setTargetAnchor(new MyAnchor(firstWidgetOfRelationship, false));
                    selfShadow.updateControlPointPosition();
                    gs.getConnectionLayer().addChild(selfShadow);
                    selfShadow.setVisible(false);
                } catch (IntrospectionException ex) {
                    Exceptions.printStackTrace(ex);
                }
                
                return WidgetAction.State.CONSUMED;
            }
        }
        return WidgetAction.State.CHAIN_ONLY;
    } 
    
    @Override
    public State mouseReleased(Widget widget, WidgetMouseEvent event) {
        GraphSceneImpl gs = (GraphSceneImpl)widget.getScene();
        
        
        
        if(!gs.isAddRelationshipMode())
            return WidgetAction.State.CHAIN_ONLY;
        
        if(!drawingRelationship)
            return WidgetAction.State.CHAIN_ONLY;
        
        drawingRelationship = false;
        removeShadows(gs);
        
        if(widget instanceof EntityWidget){  
            if(widget.equals(firstWidgetOfRelationship) && !escapeBounds)
                return WidgetAction.State.CONSUMED;
            Relationship r = new Relationship();
            RelationshipNode node;
            r.setSourceEntityId(((EntityWidget)firstWidgetOfRelationship).getBean().getLookup().lookup(Entity.class).getId());
            r.setDestinationEntityId(((EntityWidget)widget).getBean().getLookup().lookup(Entity.class).getId());
            try {
                node = new RelationshipNode(r);
                Node[] toAdd = {node};
                EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().add(toAdd);
                
                RelationshipWidget rw = gs.getRelationshipWidgetById(node.getLookup().lookup(Relationship.class).getId());
                gs.setFocusedWidget(rw);
                gs.repaint();
                Node[] list = {node};
                EntityExplorerManagerProvider.getExplorerManager().setSelectedNodes(list);
                gs.setAddRelationshipMode(false);
            } catch (IntrospectionException|PropertyVetoException ex) {
                Exceptions.printStackTrace(ex);
            }
            
            return WidgetAction.State.CONSUMED;
        }
        
        return WidgetAction.State.CHAIN_ONLY;
    }

    @Override
    public State mouseDragged(Widget widget, WidgetMouseEvent event) {
        if(drawingRelationship && shadow!=null){
            shadow.setVisible(true);
            selfShadow.setVisible(false);
            
            if(widget instanceof GraphSceneImpl){
                escapeBounds=true;
                shadow.setTargetAnchor(AnchorFactory.createFixedAnchor(event.getPoint()));
                shadow.repaint();
            }
            else if(widget instanceof EntityWidget && !widget.equals(firstWidgetOfRelationship)){
                shadow.setTargetAnchor(AnchorFactory.createFreeRectangularAnchor (widget, true));
                shadow.repaint();
            }else if(widget instanceof EntityWidget && widget.equals(firstWidgetOfRelationship)){
                if(escapeBounds){
                    selfShadow.setVisible(true);
                    selfShadow.repaint();
                }
                shadow.setVisible(false);
                shadow.repaint();
            }else{
                shadow.setVisible(false);
                shadow.repaint();
            }
        }
        return WidgetAction.State.CHAIN_ONLY;
    }
    
    @Override
    public State mouseEntered(Widget widget, WidgetMouseEvent event) {
        if(drawingRelationship && shadow!=null && widget instanceof GraphSceneImpl){
            GraphSceneImpl gs = (GraphSceneImpl)widget.getScene();
            removeShadows(gs);
            drawingRelationship=false;
        }
        return WidgetAction.State.CHAIN_ONLY;
    }
    
    private void removeShadows(GraphSceneImpl gs){
        gs.getConnectionLayer().removeChild(shadow);
        shadow=null;
        gs.getInteractionLayer().removeChild(selfShadow.getPoint());
        gs.getConnectionLayer().removeChild(selfShadow);
        selfShadow=null;
    }
}