package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JMenuItem;
import javax.swing.JPopupMenu;
import org.netbeans.api.visual.action.PopupMenuProvider;
import org.netbeans.api.visual.widget.Widget;
import org.openide.util.NbBundle;

/**
 *
 * @author Piotrek
 */
@NbBundle.Messages({
    "Delete_entity=Delete entity",
    "Delete_relationship=Delete relationship"
})
public class WidgetMenu implements PopupMenuProvider, ActionListener {
    
    private static final String DELETE_ENTITY = "deleteEntity";
    private static final String DELETE_RELATIONSHIP = "deleteRelationship";

    private final JPopupMenu menu;
    private final Widget widget;
        
    public WidgetMenu(Widget widget){
        this.widget = widget;
        JMenuItem item;
        if(widget instanceof EntityWidget){
            menu = new JPopupMenu("Entity menu");
            item = new JMenuItem(Bundle.Delete_entity());
            item.setActionCommand(DELETE_ENTITY);
            item.addActionListener(this);
            menu.add(item);
        }
        else{
            menu = new JPopupMenu("Relationship menu");
            item = new JMenuItem(Bundle.Delete_relationship());
            item.setActionCommand(DELETE_RELATIONSHIP);
            item.addActionListener(this);
            menu.add(item);
        }
    }
    
    @Override
    public JPopupMenu getPopupMenu(Widget widget, Point point){
        return menu;
    }
    
    @Override
    public void actionPerformed(ActionEvent e){
        if(DELETE_ENTITY.equals(e.getActionCommand())){
            EntityExplorerManagerProvider.deleteEntity(((EntityWidget)widget).getBean());
        }
        else if(DELETE_RELATIONSHIP.equals(e.getActionCommand())){
            EntityExplorerManagerProvider.deleteRelationship(((RelationshipWidget)widget).getBean());
        }
    }
    
}