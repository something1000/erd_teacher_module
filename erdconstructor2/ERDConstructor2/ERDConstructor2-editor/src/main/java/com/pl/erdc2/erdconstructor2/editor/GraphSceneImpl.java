package com.pl.erdc2.erdconstructor2.editor;

import AlignWithSupport.AlignWithMoveStrategyProvider;
import AlignWithSupport.SingleLayerAlignWithWidgetCollector;
import com.pl.erdc2.erdconstructor2.api.Column;
import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.EntityNode;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import java.awt.BasicStroke;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Point;
import java.io.Serializable;
import java.util.Random;
import org.netbeans.api.visual.graph.GraphScene;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.Node;
import org.openide.util.Lookup;
import org.openide.util.LookupEvent;
import org.openide.util.LookupListener;
import org.openide.util.Utilities;
import org.openide.windows.TopComponent;
import org.netbeans.api.visual.action.ActionFactory;
import org.netbeans.api.visual.widget.EventProcessingType;
import org.netbeans.api.visual.widget.LayerWidget;

public class GraphSceneImpl extends GraphScene implements LookupListener, Serializable{
    private final LayerWidget mainLayer;
    private final Random random;
    private final LayerWidget connectionLayer;
    private final LayerWidget interactionLayer;
    private final Lookup.Result<EntityNode> entitesLookup;
    private final Lookup.Result<RelationshipNode> relatioshipLookup;
    private final EditorTopComponent associatedTopComponent;

    private boolean addRelationshipMode;
    private boolean addEntityMode;
    
    public GraphSceneImpl(EditorTopComponent tc) {
        this.setLookFeel(new OurLookFeelImpl());
        associatedTopComponent = tc;
        this.random = new Random();
        mainLayer = new LayerWidget(this);
        connectionLayer = new LayerWidget(this);
        interactionLayer = new LayerWidget(this);
        
        this.setKeyEventProcessingType(EventProcessingType.ALL_WIDGETS);
        
        EntityExplorerManagerProvider.getEntityNodeRoot().addNodeListener(new EntityNodeRootNodeListener(this));
        EntityExplorerManagerProvider.getRelatioshipNodeRoot().addNodeListener(new RelationshipNodeRootNodeListener(this));
        
        entitesLookup = Utilities.actionsGlobalContext().lookupResult(EntityNode.class);
        entitesLookup.addLookupListener(this);
        relatioshipLookup = Utilities.actionsGlobalContext().lookupResult(RelationshipNode.class);
        relatioshipLookup.addLookupListener(this);
        
        getActions().addAction(new MyKeyListener(this));
        getActions().addAction(new MyRelationshipAddModeAction());
        getActions().addAction(new MyEntityAddModeAction(this));
        
        addChild(connectionLayer);
        addChild(interactionLayer);
        addChild(mainLayer);

        getActions().addAction(ActionFactory.createZoomAction());
        getActions().addAction(ActionFactory.createPanAction());
        getActions().addAction(ActionFactory.createWheelPanAction());
        getActions().addAction(new MySelectWidgetAction());
        
        for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()){
            if(n instanceof EntityNode){
                this.addNode(n);
            }
        }
    }
    
    public void prepareToSerialize(){
        for(Widget w : mainLayer.getChildren()){
            if(w instanceof EntityWidget){
                EntityWidget ew = (EntityWidget)w;
                EntityNode en = ew.getBean();
                Entity e = en.getLookup().lookup(Entity.class);
                if(e!=null){
                    e.setBounds(ew.getPreferredBounds());
                    e.setLocation(ew.getPreferredLocation());
                    e.getColumns().clear();
                    for(Node n :en.getChildren().getNodes()){
                        e.getColumns().add(n.getLookup().lookup(Column.class));
                    }
                }
            }
        }
        for(Widget w : connectionLayer.getChildren()){
            if(w instanceof RelationshipWidget){
                RelationshipWidget rw = (RelationshipWidget)w;
                RelationshipNode rn = rw.getBean();
                Relationship r = rn.getLookup().lookup(Relationship.class);
                if(r!=null){
                    r.setControlPointLocation(rw.getPoint().getPreferredLocation());
                    r.setNameLabelLocation(rw.getLabel().getPreferredLocation());
                    r.setControlPointMoved(rw.getPoint().isMoved());
                }
            }
        }
    }
    
    public void clean(){
        mainLayer.removeChildren();
        connectionLayer.removeChildren();
        interactionLayer.removeChildren();
    }
    
    @Override
    protected Widget attachNodeWidget(Object n) {
        if(n instanceof EntityNode)
            return attachEntityNodeWidget((EntityNode)n);
        else if(n instanceof RelationshipNode)
            return attachRelationshipNodeWidget((RelationshipNode)n);
        return null;
    }
    
    private RelationshipWidget attachRelationshipNodeWidget(RelationshipNode node){
        RelationshipWidget conn = new RelationshipWidget(this,node);
        Relationship bean = node.getLookup().lookup(Relationship.class);
        
        conn.setRouter(new MyRouter());
        conn.setSourceAnchor(new MyAnchor(getEntityWidgetById(bean.getSourceEntityId()), false));
        conn.setTargetAnchor(new MyAnchor(getEntityWidgetById(bean.getDestinationEntityId()), false));
        conn.setStroke(new BasicStroke(2));
        if(bean.getControlPointLocation()!=null){
            conn.getPoint().setMoved(bean.isControlPointMoved());
            conn.getPoint().setPreferredLocation(bean.getControlPointLocation());
            conn.getPoint().revalidate();
        }
        else
            conn.updateControlPointPosition();
        conn.getActions().addAction(ActionFactory.createPopupMenuAction(new WidgetMenu(conn)));
        conn.getActions().addAction(new MySelectWidgetAction());
        conn.getLabel().getActions().addAction(ActionFactory.createPopupMenuAction(new WidgetMenu(conn)));
        
        connectionLayer.addChild(conn);
        conn.getPoint().revalidate();
        conn.reroute();
        conn.revalidate();
        this.validate();
        this.repaint();
        return conn;
     }
    
    private EntityWidget attachEntityNodeWidget(EntityNode node){
        Entity entity;
        
        entity = node.getLookup().lookup(Entity.class);
        
        node.addNodeListener(new ColumnNodeListener((this)));
            
        EntityWidget widget = new EntityWidget(this, node);
        if(entity.getBounds()!=null)
            widget.setPreferredBounds(entity.getBounds());
        else
            widget.setPreferredSize(new Dimension(200, 100));
        
        if(entity.getLocation()!=null)
            widget.setPreferredLocation(entity.getLocation());
        else
            widget.setPreferredLocation(new Point(10+random.nextInt(400), 10+random.nextInt(400)));
        
        widget.getActions().addAction(ActionFactory.createPopupMenuAction(new WidgetMenu(widget)));
        widget.getActions().addAction(new MyKeyListener(this));
        widget.getActions().addAction(new MyRelationshipAddModeAction());
        widget.getActions().addAction(new MyEntityAddModeAction(this));
        widget.getActions().addAction(this.createWidgetHoverAction());
        widget.getActions().addAction(ActionFactory.createResizeAction());
        widget.getActions().addAction(new MySelectWidgetAction());
        AlignWithMoveStrategyProvider sp = new AlignWithMoveStrategyProvider (new SingleLayerAlignWithWidgetCollector (mainLayer, true), interactionLayer, ActionFactory.createDefaultAlignWithMoveDecorator(), true);
        widget.getActions().addAction(ActionFactory.createMoveAction(sp, sp));
        
        widget.recalculateMinSize();
        mainLayer.addChild(widget);
        
        return widget;
    }
    
    public EntityWidget getEntityWidgetById(int id){
        for(Widget w : mainLayer.getChildren()){
            if(w instanceof EntityWidget){
                EntityWidget ew = (EntityWidget)w;
                EntityNode en = ew.getBean();
                Entity e = en.getLookup().lookup(Entity.class);
                if(e.getId()==id)
                    return ew;
            }
        }
        return null;
    }
    
    public RelationshipWidget getRelationshipWidgetById(int id){
        for(Widget w : connectionLayer.getChildren()){
            if(w instanceof RelationshipWidget){
                RelationshipWidget rw = (RelationshipWidget)w;
                RelationshipNode en = rw.getBean();
                Relationship r = en.getLookup().lookup(Relationship.class);
                if(r.getId()==id)
                    return rw;
            }
        }
        return null;
    }
    
    @Override
    protected Widget attachEdgeWidget(Object e) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    protected void attachEdgeSourceAnchor(Object e, Object n, Object n1) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    protected void attachEdgeTargetAnchor(Object e, Object n, Object n1) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void resultChanged(LookupEvent ev) {
        if(entitesLookup.allItems().size()==1){
            EntityNode node = entitesLookup.allInstances().iterator().next();
            if(node==null)
                return;
            
            for(Widget w : mainLayer.getChildren()){
                if(w instanceof EntityWidget){
                    EntityWidget ew = (EntityWidget)w;
                    if(ew.getBean().equals(node)){
                        ew.getScene().setFocusedWidget(ew);
                        ew.getScene().repaint();
                    }
                }
            }
        }
        if(relatioshipLookup.allItems().size()==1){
            RelationshipNode node = relatioshipLookup.allInstances().iterator().next();
            if(node==null)
                return;
            
            for(Widget w : connectionLayer.getChildren()){
                if(w instanceof RelationshipWidget){
                    RelationshipWidget rw = (RelationshipWidget)w;
                    if(rw.getBean().equals(node)){
                        rw.getScene().setFocusedWidget(rw);
                        rw.repaint();
                        rw.getScene().repaint();
                    }
                }
            }
        }
    }

    public LayerWidget getMainLayer() {
        return mainLayer;
    }

    public TopComponent getAssociatedTopComponent() {
        return associatedTopComponent;
    }

    public boolean isAddRelationshipMode() {
        return addRelationshipMode;
    }

    public void setAddRelationshipMode(boolean addRelationshipMode) {
        this.addRelationshipMode = addRelationshipMode;
        this.associatedTopComponent.addRelationshipMode.setSelected(addRelationshipMode);
        if(addRelationshipMode==true || isAddEntityMode()){
            this.setCursor(new Cursor(Cursor.CROSSHAIR_CURSOR));
        }
        else{
            this.setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
        }
        this.repaint();
        this.revalidate();
        
    }
    public void toggleAddRelationshipMode(){
        this.setAddRelationshipMode(!addRelationshipMode);
    }
    
    public boolean isAddEntityMode() {
        return addEntityMode;
    }

    public void setAddEntityMode(boolean addEntityMode) {
        this.addEntityMode = addEntityMode;
        this.associatedTopComponent.addEntityButton.setSelected(addEntityMode);
        if(addEntityMode==true || isAddRelationshipMode()){
            this.setCursor(new Cursor(Cursor.CROSSHAIR_CURSOR));
        }
        else{
            this.setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
        }
        this.repaint();
    }
    public void toggleAddEntityMode(){
        this.setAddEntityMode(!addEntityMode);
    }
    
    public LayerWidget getConnectionLayer() {
        return connectionLayer;
    }

    public LayerWidget getInteractionLayer() {
        return interactionLayer;
    }
}

