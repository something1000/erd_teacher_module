package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.ColumnChildFactory;
import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.EntityNode;
import java.awt.Dimension;
import java.awt.Point;
import java.beans.IntrospectionException;
import java.beans.PropertyVetoException;
import org.apache.log4j.Logger;
import org.netbeans.api.visual.action.WidgetAction;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;

public class MyEntityAddModeAction extends WidgetAction.Adapter {
    private static EntityWidget shadow;
    private static final Logger logger = Logger.getLogger(MyEntityAddModeAction.class);
    private static GraphSceneImpl scene;
    
    public MyEntityAddModeAction(GraphSceneImpl gs) {
        EntityNode en;
        scene = gs;
        if(shadow==null)
            try {
                en = new EntityNode(new Entity());
                en.setDisplayName("");
                shadow = new EntityWidget(gs, en);
                shadow.setVisible(false);
                shadow.setPreferredSize(new Dimension(170, 70));
                shadow.recalculateMinSize();
                shadow.setEnabled(false);
                gs.getMainLayer().addChild(shadow);
            } catch (IntrospectionException ex) {
                Exceptions.printStackTrace(ex);
                logger.error(ex);
            }
    }

    @Override
    public State mouseReleased(Widget widget, WidgetMouseEvent event) {
        if(event.getButton()!=1){
            scene.setAddEntityMode(false);
            shadow.setVisible(false);
            return WidgetAction.State.CONSUMED;
        }
        if(scene.isAddEntityMode() && (widget instanceof GraphSceneImpl)){
            try {
                Entity en = new Entity();
                EntityNode node = new EntityNode(en, Children.create(new ColumnChildFactory(), true));
                Point p = event.getPoint();
                p.x-=90;
                p.y-=40;
                en.setLocation(p);
                Node[] toAdd = {node};
                EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().add(toAdd);
                shadow.setVisible(false);
                shadow.repaint();
                shadow.bringToFront();
                
                EntityWidget ew = scene.getEntityWidgetById(node.getLookup().lookup(Entity.class).getId());
                scene.setFocusedWidget(ew);
                scene.repaint();
                Node[] list = {node};
                try {
                    EntityExplorerManagerProvider.getExplorerManager().setSelectedNodes(list);
                } catch (PropertyVetoException ex) {
                    Exceptions.printStackTrace(ex);
                }

                scene.setAddEntityMode(false);
            } catch (IntrospectionException ex) {
                Exceptions.printStackTrace(ex);
                logger.error(ex);
            }
        }
        return WidgetAction.State.CONSUMED;
    }

    @Override
    public State mouseMoved(Widget widget, WidgetMouseEvent event) {
        if(scene.isAddEntityMode() && (widget instanceof GraphSceneImpl)){
            if(!scene.getMainLayer().getChildren().contains(shadow))
                scene.getMainLayer().addChild(shadow);
            
            shadow.setVisible(true);
            Point p = event.getPoint();
            p.x-=85;
            p.y-=35;
            shadow.setPreferredLocation(p);
            shadow.repaint();
            shadow.revalidate();
            scene.repaint();
        }
        else{
            shadow.setVisible(false);
        }
        return WidgetAction.State.CHAIN_ONLY;
    }

    @Override
    public State mouseExited(Widget widget, WidgetMouseEvent event) {
        if(shadow!=null)
            shadow.setVisible(false);
        return WidgetAction.State.CHAIN_ONLY;
    }
}