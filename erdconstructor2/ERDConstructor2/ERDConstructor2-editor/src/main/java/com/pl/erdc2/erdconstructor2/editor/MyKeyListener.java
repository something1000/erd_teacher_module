package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import java.awt.event.KeyEvent;
import java.util.ArrayList;
import javax.swing.JOptionPane;
import org.apache.log4j.Logger;
import org.netbeans.api.visual.action.WidgetAction;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.Node;
import org.openide.util.NbBundle;
import com.pl.erdc2.erdconstructor2.editor.Bundle;

@NbBundle.Messages({
    "# {0} - entity",
    "Confirm_Entity_Delete=Are you sure you want to delete {0} entity?",
    "# {0} - relationship",
    "Confirm_Relationship_Delete=Are you sure you want to delete {0} relationship?",
    "Confirm=Confirm",
    "Yes_Option=Yes",
    "No_Option=No"})
public class MyKeyListener extends WidgetAction.Adapter {
    private static final Logger logger = Logger.getLogger(MyKeyListener.class);
    private static GraphSceneImpl scene;
    
    public MyKeyListener(GraphSceneImpl gs) {
        scene = gs;
    }

    @Override
    public State keyReleased(Widget widget, WidgetKeyEvent event) {
        if(event.getKeyCode()==KeyEvent.VK_DELETE){
            if(scene.getFocusedWidget() instanceof EntityWidget){
                EntityWidget ew = (EntityWidget)scene.getFocusedWidget();
                
                int response = JOptionPane.showOptionDialog(null,
                        (Object) Bundle.Confirm_Entity_Delete(ew.getBean().getDisplayName()), 
                        Bundle.Confirm(), JOptionPane.YES_NO_OPTION, 
                        JOptionPane.INFORMATION_MESSAGE, null, 
                        new String[]{Bundle.Yes_Option(), Bundle.No_Option()}, "default");
                if (response == JOptionPane.NO_OPTION)
                    return WidgetAction.State.CHAIN_ONLY;
                
                EntityExplorerManagerProvider.deleteEntity(ew.getBean());
                
            }
            else if(scene.getFocusedWidget() instanceof RelationshipWidget){
                RelationshipWidget rw = (RelationshipWidget)scene.getFocusedWidget();
                
                int response = JOptionPane.showOptionDialog(null,
                        (Object) Bundle.Confirm_Relationship_Delete(rw.getBean().getDisplayName()), 
                        Bundle.Confirm(), JOptionPane.YES_NO_OPTION, 
                        JOptionPane.INFORMATION_MESSAGE, null, 
                        new String[]{Bundle.Yes_Option(), Bundle.No_Option()}, "default");
                if (response == JOptionPane.NO_OPTION)
                    return WidgetAction.State.CHAIN_ONLY;
                
                EntityExplorerManagerProvider.deleteRelationship(rw.getBean());
            }
        }
        return WidgetAction.State.CHAIN_ONLY;
    }

    @Override
    public State mouseClicked(Widget widget, WidgetMouseEvent event) {
        scene.getView().requestFocusInWindow();
        return WidgetAction.State.CHAIN_ONLY;    
    }
    
    
}