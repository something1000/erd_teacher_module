package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.Column;
import java.util.Observable;
import java.util.Observer;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.NodeAdapter;
import org.openide.nodes.NodeEvent;
import org.openide.nodes.NodeMemberEvent;

public class ColumnNodeListener extends NodeAdapter implements Observer{
    private final GraphSceneImpl gs;

    public ColumnNodeListener(GraphSceneImpl _gs) {
        gs = _gs;
    }
    @Override
    public void childrenAdded(NodeMemberEvent ev) {
        if(ev.getDelta().length!=1)
            return;
        for(Widget w : gs.getMainLayer().getChildren()){
            if(w instanceof EntityWidget){
                EntityWidget ew = (EntityWidget)w;
                if(ew.getBean().equals(ev.getDelta()[0].getParentNode())){
                    ew.recalculateMinSize();
                    ew.revalidate(false);
                    gs.getAssociatedTopComponent().repaint();
                }
            }
        }
        Column c = ev.getDelta()[0].getLookup().lookup(Column.class);
        if(c!=null)
            c.addObserver(this);
        gs.validate();
    }
    
    @Override
    public void childrenRemoved(NodeMemberEvent ev){
        gs.validate();
        gs.getAssociatedTopComponent().repaint();
    }

    @Override
    public void update(Observable o, Object arg) {
        if(o instanceof Column){
            gs.getAssociatedTopComponent().repaint();
        }
    }
    
}
