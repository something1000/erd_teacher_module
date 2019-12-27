package com.pl.erdc2.erdconstructor2.actions;

import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.editor.DatabaseTopComponent;
import com.pl.erdc2.erdconstructor2.editor.DescriptionTopComponent;
import com.pl.erdc2.erdconstructor2.editor.EditorTopComponent;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileNameExtensionFilter;
import org.openide.DialogDisplayer;
import org.openide.NotifyDescriptor;
import org.openide.awt.ActionID;
import org.openide.awt.ActionReference;
import org.openide.awt.ActionRegistration;
import org.openide.filesystems.FileChooserBuilder;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;
import org.openide.util.NbBundle.Messages;
import org.openide.windows.WindowManager;

/**
 *
 * @author Piotrek
 */
@ActionID(category = "File", id = "com.pl.erdc2.SaveFileAction")
@ActionRegistration(displayName = "#CTL_SaveFileAction")
@ActionReference(path = "Menu/File", position = 9)
@Messages({"CTL_SaveFileAction=Save File",
        "CTL_SaveFileActionButton=Save",
        "Save_Error=An error occurred while attempting to save to your hard drive",
        "Confirm_Replace_File=Are you sure you want to override existing file?",
        "Confirm=Confirm",
        "Yes_Option=Yes",
        "No_Option=No"
})
public final class SaveFileAction implements ActionListener {
    @Override
    public void actionPerformed(ActionEvent e) {
        File home = new File(System.getProperty("user.home"));
        FileNameExtensionFilter filter1 = new FileNameExtensionFilter("ERDC files", "erdc");
        File toAdd;
        while(true){
            toAdd = new FileChooserBuilder("user-dir").setTitle(Bundle.CTL_SaveFileAction()).
                setDefaultWorkingDirectory(home).setApproveText(Bundle.CTL_SaveFileActionButton()).setFileFilter(filter1).showSaveDialog();            
            if(toAdd == null){
                return;
            }
            if(!toAdd.getAbsolutePath().endsWith(".erdc"))
                   toAdd = new File(toAdd.getAbsolutePath()+".erdc");
            if(toAdd.exists()){
                int response = JOptionPane.showOptionDialog(null,
                        (Object) Bundle.Confirm_Replace_File(), 
                        Bundle.Confirm(), JOptionPane.YES_NO_OPTION, 
                        JOptionPane.INFORMATION_MESSAGE, null, 
                        new String[]{Bundle.Yes_Option(), Bundle.No_Option()}, "default");
                if (response == JOptionPane.YES_OPTION) {                    
                    break;
                } 
            } else {
                break;
            }
        }        
       
        if (toAdd != null) {                                    
             saveFile(toAdd);
        }
    }
    
    public void saveFile(File toAdd){
        try {
            if(toAdd==null)
                throw new IOException("File is null");
            
            if(!toAdd.getAbsolutePath().endsWith(".erdc"))
                toAdd = new File(toAdd.getAbsolutePath()+".erdc");

            if(!toAdd.exists())
                toAdd.createNewFile();

            FileOutputStream fout = new FileOutputStream(toAdd);
            ObjectOutputStream oos = new ObjectOutputStream(fout);

            EditorTopComponent etc;
            etc = (EditorTopComponent) WindowManager.getDefault().findTopComponent("editorTopComponent");
            etc.getScene().prepareToSerialize();

            SaveWrapper wrap = new SaveWrapper();
            ArrayList<Entity> entities = new ArrayList<>();
            for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()){
                Entity ent = n.getLookup().lookup(Entity.class);
                if(ent!=null)
                    entities.add(ent);
            }
            wrap.entities = entities.toArray(new Entity[entities.size()]);

            ArrayList<Relationship> relations = new ArrayList<>();
            for(Node n : EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().getNodes()){
                Relationship rel = n.getLookup().lookup(Relationship.class);
                if(rel!=null)
                    relations.add(rel);
            }
            wrap.relations = relations.toArray(new Relationship[relations.size()]);
            
            DescriptionTopComponent dtc;
            dtc = (DescriptionTopComponent) WindowManager.getDefault().findTopComponent("descriptionTopComponent");
            wrap.subject = dtc.getSubject();
            wrap.description = dtc.getDescription();
            wrap.detailDescription = dtc.getDetailDescription();
            
            DatabaseTopComponent dbtc;
            dbtc = (DatabaseTopComponent) WindowManager.getDefault().findTopComponent("databaseTopComponent");
            wrap.databaseSchema = dbtc.getDatabaseSchema();
            
            oos.writeObject(wrap);
            oos.close();
            fout.close();
            FileChangesManager.saveFile(toAdd.getName(), toAdd);
        } catch (IOException ex) {
            NotifyDescriptor.Message message = new NotifyDescriptor.Message(Bundle.Save_Error());
            message.setMessageType(NotifyDescriptor.Message.ERROR_MESSAGE);
            Object result = DialogDisplayer.getDefault().notify(message);
            Exceptions.printStackTrace(ex);
        }
    }
    
    public static class SaveWrapper implements Serializable{
        public Entity[] entities;
        public Relationship[] relations;
        public String subject;
        public String description;
        public String detailDescription;
        public String databaseSchema;
    }
}
