package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.EntityNode;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import org.openide.nodes.Node;
import org.openide.nodes.NodeAdapter;
import org.openide.nodes.NodeMemberEvent;

/**
 *
 * @author Piotrek
 */
public class EntityNodeRootNodeListener extends NodeAdapter{
    private final GraphSceneImpl gs;

    public EntityNodeRootNodeListener(GraphSceneImpl gs) {
        this.gs = gs;
    }
    
    @Override
    public void childrenAdded(NodeMemberEvent ev) {
        for(Node n : ev.getDelta()){
            if(n instanceof EntityNode){
                gs.addNode(n);
                gs.validate();
            }
        }
        FileChangesManager.change();
    }
    
    @Override
    public void childrenRemoved(NodeMemberEvent ev) {
        for(Node n : ev.getDelta()){
            if(n instanceof EntityNode){
                gs.removeNode(n);
                gs.validate();
            }
        }
        FileChangesManager.change();
    }
}
