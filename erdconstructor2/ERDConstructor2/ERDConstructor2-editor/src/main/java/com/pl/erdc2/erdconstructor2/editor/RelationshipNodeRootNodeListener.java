package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import org.netbeans.api.visual.widget.Widget;
     

import org.openide.nodes.Node;
import org.openide.nodes.NodeAdapter;
import org.openide.nodes.NodeMemberEvent;

/**
 *
 * @author Kuba
 * @author Piotrek
 */
public class RelationshipNodeRootNodeListener extends NodeAdapter{
    private final GraphSceneImpl gs;

    public RelationshipNodeRootNodeListener(GraphSceneImpl gs) {
        this.gs = gs;
    }
    
    @Override
     public void childrenRemoved(NodeMemberEvent ev) {
         Widget toRemove = null;
         for(Node n : ev.getDelta()){
            if(n instanceof RelationshipNode){
                for(Widget w : gs.getConnectionLayer().getChildren()){
                    if(w instanceof RelationshipWidget){
                        RelationshipWidget rw = (RelationshipWidget)w;
                        if(rw.getBean().equals(n)){
                            toRemove=w;
                            break;
                        }
                    }
                }
                if(gs.getConnectionLayer().getChildren().contains(toRemove))
                    gs.getConnectionLayer().removeChild(toRemove);
                gs.validate();
            }
        }
        FileChangesManager.change();
     }
    
    @Override
    public void childrenAdded(NodeMemberEvent ev) {
        for(Node n : ev.getDelta()){
            if(n instanceof RelationshipNode){
                gs.addNode(n);
                gs.validate();
            }
        }
        FileChangesManager.change();
    }
}
