package com.pl.erdc2.erdconstructor2.actions;

import java.util.Collection;
import java.util.Iterator;
import org.openide.LifecycleManager;
import org.openide.util.Lookup;
import org.openide.util.lookup.ServiceProvider;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import javax.swing.JOptionPane;
import org.openide.util.NbBundle.Messages;
/**
 *
 * @author Piotrek
 */
@Messages({
    "# {0} - filename",
    "File_was_changed_message=File {0} was changed. Do you want to save file before exit?",
    "Save_file_message=Do you want to save your project before exit?",
    "Popup_header=Do you want to save file?",
    "Cancel_Option=Cancel"
})
@ServiceProvider(service=LifecycleManager.class, position=1)
public class MyLifecycleManager extends LifecycleManager {

   @Override
   public void saveAll() {
   }

   @Override
   public void exit() {     
       if(!FileChangesManager.isFileWasChanged()){
           exitApp();
           return;
       }
       
       if(FileChangesManager.getFilename().equals("")){
       
            int response = JOptionPane.showOptionDialog(null,
                (Object) Bundle.Save_file_message(),
                Bundle.Popup_header(), JOptionPane.YES_NO_CANCEL_OPTION, 
                JOptionPane.INFORMATION_MESSAGE, null, 
                new String[]{Bundle.Yes_Option(), Bundle.No_Option(), Bundle.Cancel_Option()}, "default");
            if(response == JOptionPane.YES_OPTION){
                SaveFileAction sfa = new SaveFileAction();
                sfa.actionPerformed(null);
                exitApp();
                return;
            }else if(response == JOptionPane.NO_OPTION){
                exitApp();
                return;
            }else if(response == JOptionPane.CANCEL_OPTION){
                return;
            }     
       }
       
        if(!FileChangesManager.getFilename().equals("")){
       
            int response = JOptionPane.showOptionDialog(null,
                (Object) Bundle.File_was_changed_message(FileChangesManager.getFilename()),
                Bundle.Popup_header(), JOptionPane.YES_NO_CANCEL_OPTION, 
                JOptionPane.INFORMATION_MESSAGE, null, 
                new String[]{Bundle.Yes_Option(), Bundle.No_Option(), Bundle.Cancel_Option()}, "default");
            if(response == JOptionPane.YES_OPTION){
                SaveFileAction sfa = new SaveFileAction();
                sfa.saveFile(FileChangesManager.getFile());
                exitApp();
            }else if(response == JOptionPane.NO_OPTION){
                exitApp();
            }
       }
       
       
       
   }
   
   private void exitApp(){
       Collection c = Lookup.getDefault().lookupAll(LifecycleManager.class);
       for (Iterator i = c.iterator(); i.hasNext();) {
           LifecycleManager lm = (LifecycleManager) i.next();
           if (lm != this) {
               lm.exit();
           }
       }
   }

}