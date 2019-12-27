package AlignWithSupport;

import com.pl.erdc2.erdconstructor2.editor.EntityWidget;
import com.pl.erdc2.erdconstructor2.editor.GraphSceneImpl;
import com.pl.erdc2.erdconstructor2.editor.RelationshipWidget;
import java.awt.Insets;
import java.awt.Point;
import java.awt.Rectangle;
import org.netbeans.api.visual.action.ActionFactory;
import org.netbeans.api.visual.action.AlignWithMoveDecorator;
import org.netbeans.api.visual.action.AlignWithWidgetCollector;
import org.netbeans.api.visual.action.MoveProvider;
import org.netbeans.api.visual.action.MoveStrategy;
import org.netbeans.api.visual.action.WidgetAction;
import org.netbeans.api.visual.widget.LayerWidget;
import org.netbeans.api.visual.widget.Widget;

/**
 *
 * @author Piotrek
 * Class copied from org.netbeans.modules.visual.action.AlignWithMoveStrategyProvider
 */
public class AlignWithMoveStrategyProvider extends AlignWithSupport implements MoveStrategy, MoveProvider {
    private final boolean outerBounds;
    private Point originalLoc;
    private Point suggestedLoc;
    private boolean moved=false;
    private static final int MOVE_POINTERS_AFTER_DISTANCE=300;
    
    public AlignWithMoveStrategyProvider (AlignWithWidgetCollector collector, LayerWidget interractionLayer, AlignWithMoveDecorator decorator, boolean outerBounds) {
        super (collector, interractionLayer, decorator);
        this.outerBounds = outerBounds;
    }

    @Override
    public Point locationSuggested (Widget widget, Point originalLocation, Point suggestedLocation) {
        moved=true;
        originalLoc=originalLocation;
        suggestedLoc=suggestedLocation;
        Point widgetLocation = widget.getLocation ();
        Rectangle widgetBounds = outerBounds ? widget.getBounds () : widget.getClientArea ();
        Rectangle bounds = widget.convertLocalToScene (widgetBounds);
        bounds.translate (suggestedLocation.x - widgetLocation.x, suggestedLocation.y - widgetLocation.y);
        Insets insets = widget.getBorder ().getInsets ();
        if (! outerBounds) {
            suggestedLocation.x += insets.left;
            suggestedLocation.y += insets.top;
        }
        Point point = super.locationSuggested (widget, bounds, widget.getParentWidget().convertLocalToScene(suggestedLocation), true, true, true, true);
        if (! outerBounds) {
            point.x -= insets.left;
            point.y -= insets.top;
        }
        
        reloadConnectionPointPositons(widget);
        
        return widget.getParentWidget ().convertSceneToLocal (point);
    }

    @Override
    public void movementStarted (Widget widget) {
        show ();
        moved=false;
    }

    @Override
    public void movementFinished (Widget widget) {
        hide ();
        reloadConnectionPointPositons(widget);
    }

    @Override
    public Point getOriginalLocation (Widget widget) {
        return ActionFactory.createDefaultMoveProvider ().getOriginalLocation (widget);
    }

    @Override
    public void setNewLocation (Widget widget, Point location) {
        ActionFactory.createDefaultMoveProvider ().setNewLocation (widget, location);
    }
    
    private void reloadConnectionPointPositons(Widget widget){
        if(!moved)
            return;
        boolean longDistanceMovement = (Math.sqrt(Math.abs(originalLoc.x-suggestedLoc.x)*Math.abs(originalLoc.x-suggestedLoc.x) +
                Math.abs(originalLoc.y-suggestedLoc.y)*Math.abs(originalLoc.y-suggestedLoc.y))>MOVE_POINTERS_AFTER_DISTANCE);
        
        if(widget instanceof EntityWidget){
            GraphSceneImpl gs = (GraphSceneImpl)widget.getScene();
            for(Widget w : gs.getConnectionLayer().getChildren()){
                if(!(w instanceof RelationshipWidget))
                    continue;
                RelationshipWidget rw = (RelationshipWidget)w;
                if(rw.getSourceAnchor().getRelatedWidget()==widget || rw.getTargetAnchor().getRelatedWidget()==widget){
                    if(!rw.getPoint().isMoved() || longDistanceMovement)
                        rw.updateControlPointPosition();
                }
                for(WidgetAction wa : w.getActions().getActions()){
                    wa.getClass();
                }
            }
        }
    }
}
