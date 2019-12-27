package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import java.beans.PropertyVetoException;
import org.netbeans.api.visual.action.WidgetAction;
import org.netbeans.api.visual.widget.LabelWidget;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;


public class MySelectWidgetAction extends WidgetAction.Adapter {
    @Override
    public WidgetAction.State mousePressed(Widget widget, WidgetAction.WidgetMouseEvent event) {
        if(widget instanceof LabelWidget)
                widget = widget.getParentWidget();
        if(widget instanceof ConnectionPoint)
                widget = ((ConnectionPoint)widget).getRelationshipWidget();
        
        widget.getScene().setFocusedWidget(widget);
        widget.getScene().repaint();
        Node[] n = {};
        try {
            EntityExplorerManagerProvider.getExplorerManager().setSelectedNodes(n);
        } catch (PropertyVetoException ex) {
            Exceptions.printStackTrace(ex);
        }
        if(widget instanceof EntityWidget){
            Node[] list = {((EntityWidget)widget).getBean()};
            try {
                EntityExplorerManagerProvider.getExplorerManager().setSelectedNodes(list);
            } catch (PropertyVetoException ex) {
                Exceptions.printStackTrace(ex);
            }
        }
        if(widget instanceof RelationshipWidget){
            Node[] list = {((RelationshipWidget)widget).getBean()};
            try {
                EntityExplorerManagerProvider.getExplorerManager().setSelectedNodes(list);
            } catch (PropertyVetoException ex) {
                Exceptions.printStackTrace(ex);
            }
        }
        return WidgetAction.State.CHAIN_ONLY;
    }  
}