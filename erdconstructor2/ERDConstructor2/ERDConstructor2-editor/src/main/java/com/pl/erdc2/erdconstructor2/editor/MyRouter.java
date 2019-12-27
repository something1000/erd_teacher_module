package com.pl.erdc2.erdconstructor2.editor;

import java.awt.Point;
import java.awt.Rectangle;
import java.util.ArrayList;
import java.util.List;
import org.netbeans.api.visual.anchor.Anchor;
import org.netbeans.api.visual.anchor.Anchor.Direction;
import org.netbeans.api.visual.router.Router;
import org.netbeans.api.visual.widget.ConnectionWidget;

/**
 *
 * @author Piotrek
 */
public class MyRouter implements Router{
    
    @Override
    public List<Point> routeConnection (ConnectionWidget widget) {
        ArrayList<Point> list = new ArrayList<> ();
        
        RelationshipWidget rw = (RelationshipWidget)widget;
        Anchor sourceAnchor = widget.getSourceAnchor ();
        Anchor targetAnchor = widget.getTargetAnchor ();
        
        Anchor.Result source = sourceAnchor.compute(widget.getSourceAnchorEntry ());
        Anchor.Result target = targetAnchor.compute(widget.getSourceAnchorEntry ());
        Point sourcePoint = sourceAnchor.compute(widget.getSourceAnchorEntry ()).getAnchorSceneLocation();
        Point targetPoint = targetAnchor.compute(widget.getSourceAnchorEntry ()).getAnchorSceneLocation();
        
        if(rw.getPoint()==null || rw.getPoint().getBounds()==null){
            list.add (sourcePoint);
            list.add (targetPoint);
            return list;
        }
        
        Point controlPoint;
        controlPoint = center(rw.getPoint().convertLocalToScene(rw.getPoint().getBounds()));
        
        if(((source.getDirections().contains(Direction.LEFT) && target.getDirections().contains(Direction.RIGHT))
                || (source.getDirections().contains(Direction.RIGHT) && target.getDirections().contains(Direction.LEFT)))
                && (sourcePoint.y == controlPoint.y) && (targetPoint.y == controlPoint.y)){
            list.add (sourcePoint);
            list.add (targetPoint);
        }
        else if(((source.getDirections().contains(Direction.TOP) && target.getDirections().contains(Direction.BOTTOM))
                || (source.getDirections().contains(Direction.BOTTOM) && target.getDirections().contains(Direction.TOP)))
                && (sourcePoint.y == controlPoint.y) && (targetPoint.y == controlPoint.y)){
            list.add (sourcePoint);
            list.add (targetPoint);
        }
        else{
            list.add (sourcePoint);
            if(source.getDirections().contains(Direction.LEFT) || source.getDirections().contains(Direction.RIGHT)){
                list.add(new Point(controlPoint.x,sourcePoint.y));
            }
            else{
                list.add(new Point(sourcePoint.x,controlPoint.y));
            }
            list.add (controlPoint);
            if(target.getDirections().contains(Direction.LEFT) || target.getDirections().contains(Direction.RIGHT)){
                list.add(new Point(controlPoint.x,targetPoint.y));
            }
            else{
                list.add(new Point(targetPoint.x,controlPoint.y));
            }
            list.add (targetPoint);
        }

        return list;
    }
    private static Point center (Rectangle rectangle) {
        return new Point (rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2);
    }
}
