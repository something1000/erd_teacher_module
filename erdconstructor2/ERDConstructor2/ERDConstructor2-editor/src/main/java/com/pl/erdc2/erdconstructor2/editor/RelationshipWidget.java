package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.Relationship;
import org.netbeans.api.visual.widget.ConnectionWidget;
import org.netbeans.api.visual.widget.Scene;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import java.awt.Image;
import java.awt.Point;
import java.awt.Rectangle;
import java.util.Observable;
import java.util.Observer;
import org.netbeans.api.visual.action.ActionFactory;
import org.netbeans.api.visual.action.MoveProvider;
import org.netbeans.api.visual.action.MoveStrategy;
import org.netbeans.api.visual.anchor.AnchorShape;
import org.netbeans.api.visual.anchor.AnchorShapeFactory;
import org.netbeans.api.visual.layout.LayoutFactory;
import org.netbeans.api.visual.model.ObjectState;
import org.netbeans.api.visual.widget.LabelWidget;
import org.netbeans.api.visual.widget.Widget;
import org.openide.util.ImageUtilities;

public class RelationshipWidget extends ConnectionWidget implements Observer{
    private static final Image ANCHOR0 = ImageUtilities.loadImage ("com/pl/erdc2/erdconstructor2/editor/anchor0.png");
    private static final Image ANCHOR1 = ImageUtilities.loadImage ("com/pl/erdc2/erdconstructor2/editor/anchor1.png");
    private static final Image ANCHOR2 = ImageUtilities.loadImage ("com/pl/erdc2/erdconstructor2/editor/anchor2.png");
    private static final Image ANCHOR3 = ImageUtilities.loadImage ("com/pl/erdc2/erdconstructor2/editor/anchor3.png");
    private static final Image ANCHORIS_A = ImageUtilities.loadImage ("com/pl/erdc2/erdconstructor2/editor/anchorIS_A.png");
    
    private final RelationshipNode bean;
    private LabelWidget label;
    private final ConnectionPoint point;
    
    public RelationshipWidget(Scene scene, RelationshipNode node) {
        super(scene);
        this.bean = node;
        Relationship bean = node.getLookup().lookup(Relationship.class);
        bean.addObserver(this);
        
        
        point = new ConnectionPoint (this.getScene(),this);
        point.getActions().addAction(new MySelectWidgetAction());
        ((GraphSceneImpl)this.getScene()).getInteractionLayer().addChild(point);
        point.hide();
        point.getActions().addAction(ActionFactory.createMoveAction(new MoveStrategy () {
            @Override
            public Point locationSuggested (Widget widget, Point originalLocation, Point suggestedLocation) {
                RelationshipWidget rw = ((ConnectionPoint)widget).getRelationshipWidget();
                rw.reroute();
                rw.revalidate();
                return suggestedLocation;
            }
        },new MoveProvider () {
            @Override
            public void movementStarted (Widget widget) {
            }
            @Override
            public void movementFinished (Widget widget) {
                RelationshipWidget rw = ((ConnectionPoint)widget).getRelationshipWidget();
                rw.reroute();
                rw.revalidate();
                point.setMoved(true);
            }
            @Override
            public Point getOriginalLocation (Widget widget) {
                return widget.getPreferredLocation ();
            }
            @Override
            public void setNewLocation (Widget widget, Point location) {
                widget.setPreferredLocation (location);
            }
        }));
        
        label = new LabelWidget (getScene(), node.getDisplayName());
        label.setOpaque(true);
        label.getActions().addAction(new MySelectWidgetAction());
        label.getActions().addAction(ActionFactory.createMoveAction());
        this.addChild(label);
        this.setConstraint(label, LayoutFactory.ConnectionWidgetLayoutAlignment.CENTER_RIGHT, 0.5f);
        if(bean.getNameLabelLocation()!=null)
            label.setPreferredLocation(bean.getNameLabelLocation());
        
        this.setSourceAnchorShape(myAnchorShapeFactory(bean.getSourceType()));
        this.setTargetAnchorShape(myAnchorShapeFactory(bean.getDestinationType()));
        
    }
    
    private AnchorShape myAnchorShapeFactory(String type){
        if(type==null)
            throw new NullPointerException("type");
        if(type.equals(Relationship.TYPES[1]))
            return AnchorShapeFactory.createImageAnchorShape (ANCHOR1, true);
        else if(type.equals(Relationship.TYPES[2]))
            return AnchorShapeFactory.createImageAnchorShape (ANCHOR2, true);
        else if(type.equals(Relationship.TYPES[3]))
            return AnchorShapeFactory.createImageAnchorShape (ANCHOR3, true);
        else if(type.equals(Relationship.TYPES[4]))
            return AnchorShapeFactory.createImageAnchorShape (ANCHORIS_A, true);
        return AnchorShapeFactory.createImageAnchorShape (ANCHOR0, true);
    }

    @Override
    public void notifyStateChanged (ObjectState previousState, ObjectState state) {
        setForeground (this.getLineColor() != null ? this.getLineColor() : getScene ().getLookFeel ().getLineColor (state));
        setPaintControlPoints (state.isSelected ());
        if(state.isFocused()){
            label.setBackground(getScene().getLookFeel().getLineColor(state).brighter());
            point.show();
        }
        else{
            label.setBackground(getScene().getLookFeel().getBackground());
            point.hide();
        }
    }
    
    public RelationshipNode getBean() {
        return bean;
    }

    public LabelWidget getLabel() {
        return label;
    }

    public void setLabel(LabelWidget label) {
        this.label = label;
    }

    public ConnectionPoint getPoint() {
        return point;
    }

    public void updateControlPointPosition(){
        Point p = new Point();
        if(isSelfRelationship()){
            Rectangle a = getSourceAnchor().getRelatedWidget().convertLocalToScene(this.getSourceAnchor().getRelatedWidget().getBounds());
            p.x = a.x + a.width/2;
            p.y = a.y + a.height + 30;
        }
        else{
            Rectangle a = getSourceAnchor().getRelatedWidget().convertLocalToScene(this.getSourceAnchor().getRelatedWidget().getBounds());
            Rectangle b = getTargetAnchor().getRelatedWidget().convertLocalToScene(this.getTargetAnchor().getRelatedWidget().getBounds());

            if(a.y > b.y){
                Rectangle t = b;
                b=a;
                a=t;
            }
            if(a.y+a.height>=b.y){
                if(a.y+a.height>=b.y+b.height)
                    p.y=b.y+ (b.height)/2;
                else
                    p.y = a.y+a.height - (a.y+a.height-b.y)/2;
            }
            else
                p.y = a.y+a.height + (b.y - (a.y+a.height))/2;

            if(a.x > b.x){
                Rectangle t = b;
                b=a;
                a=t;
            }
            if(a.x+a.width>=b.x){
                if(a.x+a.width>=b.x+b.width)
                    p.x=b.x + b.width/2;
                else
                    p.x = a.x+a.width - (a.x+a.width-b.x)/2;
            }
            else
                p.x = a.x+a.width +  (b.x - (a.x+a.width))/2;
        }
        point.setMoved(false);
        point.setPreferredLocation(p);
        point.revalidate();
        this.reroute();
        this.revalidate();
        this.getScene().validate();
        this.getScene().repaint();
    }

    @Override
    public void update(Observable o, Object arg) {
        String argg = (String)arg;
        if(argg.equals("name"))
            this.getLabel().setLabel(bean.getLookup().lookup(Relationship.class).getName());
        else if(argg.equals("sourceEntityId")){
            this.setSourceAnchor(new MyAnchor(((GraphSceneImpl)this.getScene()).getEntityWidgetById(bean.getRelationship().getSourceEntityId()), false));
            updateControlPointPosition();
            this.reroute();
            this.revalidate();
        }
        else if(argg.equals("destinationEntityId")){
            this.setTargetAnchor(new MyAnchor(((GraphSceneImpl)this.getScene()).getEntityWidgetById(bean.getRelationship().getDestinationEntityId()), false));
            updateControlPointPosition();
            this.reroute();
            this.revalidate();
        }
        else if(argg.equals("sourceType")){
            this.setSourceAnchorShape(myAnchorShapeFactory(bean.getRelationship().getSourceType()));
        }
        else if(argg.equals("destinationType")){
            this.setTargetAnchorShape(myAnchorShapeFactory(bean.getRelationship().getDestinationType()));

        }
        this.repaint();
        this.revalidate();
        this.getScene().validate();
        this.getScene().repaint();
        ((GraphSceneImpl)this.getScene()).getAssociatedTopComponent().repaint();
        
    }
    
    public boolean isSelfRelationship(){
        return this.getSourceAnchor().getRelatedWidget() == this.getTargetAnchor().getRelatedWidget();
    }
}
