package com.pl.erdc2.erdconstructor2.editor;

import java.awt.Image;
import org.netbeans.api.visual.widget.ImageWidget;
import org.netbeans.api.visual.widget.Scene;
import org.openide.util.ImageUtilities;

/**
 *
 * @author Piotrek
 */
public class ConnectionPoint extends ImageWidget{
    private final RelationshipWidget relationshipWidget;
    private static final Image showImage = ImageUtilities.loadImage("com/pl/erdc2/erdconstructor2/editor/handler.png");
    private static final Image hideImage = ImageUtilities.loadImage("com/pl/erdc2/erdconstructor2/editor/transparent.png");
    private boolean moved;
    
    public ConnectionPoint(Scene scene, RelationshipWidget relationshipWidget) {
        super(scene, showImage);
        this.relationshipWidget = relationshipWidget;
    }
    public ConnectionPoint(Scene scene, Image image, RelationshipWidget relationshipWidget) {
        super(scene, image);
        this.relationshipWidget = relationshipWidget;
    }
    
    public RelationshipWidget getRelationshipWidget() {
        return relationshipWidget;
    }
    public void show(){
        this.setImage(showImage);
    } 
    public void hide(){
        this.setImage(hideImage);
    }

    public boolean isMoved() {
        return moved;
    }

    public void setMoved(boolean moved) {
        this.moved = moved;
    }
    
}
