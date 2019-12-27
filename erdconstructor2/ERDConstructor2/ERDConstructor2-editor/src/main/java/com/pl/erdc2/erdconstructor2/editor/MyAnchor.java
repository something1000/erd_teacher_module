package com.pl.erdc2.erdconstructor2.editor;

import java.awt.Insets;
import java.awt.Point;
import java.awt.Rectangle;
import java.util.List;
import org.netbeans.api.visual.anchor.Anchor;
import org.netbeans.api.visual.widget.Widget;

/**
 *
 * @author Piotrek
 */
public class MyAnchor extends Anchor {

    private final boolean includeBorders;

    public MyAnchor(Widget widget, boolean includeBorders) {
        super(widget);
        this.includeBorders = includeBorders;
    }

    @Override
    public Result compute(Entry entry) {
        RelationshipWidget fcw = (RelationshipWidget)entry.getAttachedConnectionWidget ();
        assert fcw != null;
        
        Point relatedLocation = getRelatedSceneLocation();
        EntityWidget widget = (EntityWidget)getRelatedWidget();
        List<Point> fcwControlPoints = fcw.getControlPoints ();

        Rectangle bounds = widget.getBounds();
        if (! includeBorders) {
            Insets insets = widget.getBorder().getInsets();
            bounds.x += insets.left;
            bounds.y += insets.top;
            bounds.width -= insets.left + insets.right;
            bounds.height -= insets.top + insets.bottom;
        }
        bounds = widget.convertLocalToScene(bounds);
        
        
        if (bounds.isEmpty() || fcw.getPoint()==null || fcw.getPoint().getBounds()==null)
            return new Anchor.Result(relatedLocation, Anchor.DIRECTION_ANY);
        
        Point controlPoint;
        controlPoint = center(fcw.getPoint().convertLocalToScene(fcw.getPoint().getBounds()));
        
        float left,right,top,bottom;
        top = Math.abs(controlPoint.y - bounds.y);
        bottom = Math.abs(controlPoint.y - (bounds.y+bounds.height));
        left=Math.abs(controlPoint.x - bounds.x);
        right=Math.abs(controlPoint.x - (bounds.x+bounds.width));
        
        if(fcw.isSelfRelationship()){
            int fix=60;
            if(between(controlPoint.x, bounds.x, bounds.x+bounds.width)){
                fix/=3;
                controlPoint.x+=fcw.getSourceAnchor().equals(this)?fix:-fix;
                if(controlPoint.x<bounds.x)
                    controlPoint.x=bounds.x;
                if(controlPoint.x>bounds.x+bounds.width)
                    controlPoint.x=bounds.x+bounds.width;
            }
            else if(between(controlPoint.y, bounds.y, bounds.y+bounds.height)){
                fix/=3;
                controlPoint.y+=fcw.getSourceAnchor().equals(this)?fix:-fix;
                if(controlPoint.y<bounds.y)
                    controlPoint.y=bounds.y;
                if(controlPoint.y>bounds.y+bounds.height)
                    controlPoint.y=bounds.y+bounds.height;
            }
            else if(left<=right && top <=bottom){
                if(fcw.getSourceAnchor().equals(this))
                    controlPoint.x+=fix;
                else
                    controlPoint.y+=fix;
            }
            else if(left<=right && bottom<=top){
               if(fcw.getSourceAnchor().equals(this))
                    controlPoint.y-=fix;
                else
                    controlPoint.x+=fix;
            }
            else if(right<=left && top <=bottom){
                if(fcw.getSourceAnchor().equals(this))
                    controlPoint.x-=fix;
                else
                    controlPoint.y+=fix;
            }
            else if(right<=left && bottom<=top){
               if(fcw.getSourceAnchor().equals(this))
                    controlPoint.y-=fix;
                else
                    controlPoint.x-=fix;
            }
        }
        
        if(between(controlPoint.x, bounds.x, bounds.x+bounds.width)){
            if(top < bottom){
                return new Anchor.Result(new Point(controlPoint.x, bounds.y), Direction.TOP);
            }
            else{
                return new Anchor.Result(new Point(controlPoint.x, bounds.y+bounds.height), Direction.BOTTOM);
            }
        }      
        if(between(controlPoint.y, bounds.y, bounds.y+bounds.height)){
            if(left < right){
                return new Anchor.Result(new Point(bounds.x, controlPoint.y), Direction.LEFT);
            }
            else{
                return new Anchor.Result(new Point(bounds.x + bounds.width, controlPoint.y), Direction.RIGHT);
            }
        }   
        
        if(left<=top && left<=right && left <=bottom){
             return new Anchor.Result(new Point(bounds.x, bounds.y + bounds.height/2), Direction.LEFT);
        }
        else if(top<=left && top<=right && top <=bottom){
            return new Anchor.Result(new Point(bounds.x + bounds.width/2, bounds.y), Direction.TOP);
        }
        else if(right<=left && right<=top && right <=bottom){
            return new Anchor.Result(new Point(bounds.x + bounds.width, bounds.y + bounds.height/2), Direction.RIGHT);
        }
        else if(bottom<=left && bottom<=right && bottom <=top){
            return new Anchor.Result(new Point(bounds.x + bounds.width/2, bounds.y + bounds.height), Direction.BOTTOM);
        }
        
        return new Anchor.Result(relatedLocation, Anchor.DIRECTION_ANY);
    }
    public static Point center (Rectangle rectangle) {
        return new Point (rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2);
    }
    private static boolean between(float x, float a, float b){
        if(a>b){
            float temp=b;
            b=a;
            a=temp;
        }
        return (x>=a && x<=b);
    }
}
