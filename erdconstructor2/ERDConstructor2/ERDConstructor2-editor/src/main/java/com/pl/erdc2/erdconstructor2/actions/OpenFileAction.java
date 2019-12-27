package com.pl.erdc2.erdconstructor2.actions;

import com.pl.erdc2.erdconstructor2.api.ColumnChildFactory;
import com.pl.erdc2.erdconstructor2.api.ColumnNode;
import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.EntityNode;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import com.pl.erdc2.erdconstructor2.editor.DatabaseTopComponent;
import com.pl.erdc2.erdconstructor2.editor.DescriptionTopComponent;
import com.pl.erdc2.erdconstructor2.editor.EditorTopComponent;
import com.pl.erdc2.erdconstructor2.editor.RelationshipWidget;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.beans.IntrospectionException;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import javax.swing.filechooser.FileNameExtensionFilter;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.netbeans.api.visual.widget.Widget;
import org.openide.DialogDisplayer;
import org.openide.NotifyDescriptor;
import org.openide.awt.ActionID;
import org.openide.awt.ActionReference;
import org.openide.awt.ActionRegistration;
import org.openide.cookies.OpenCookie;
import org.openide.filesystems.FileChooserBuilder;
import org.openide.filesystems.FileUtil;
import org.openide.loaders.DataObject;
import org.openide.loaders.DataObjectNotFoundException;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;
import org.openide.util.NbBundle.Messages;
import org.openide.windows.WindowManager;

/**
 *
 * @author Piotrek
 */
@ActionID(category = "File", id = "com.pl.erdc2.OpenFileAction")
@ActionRegistration(displayName = "#CTL_OpenFileAction")
@ActionReference(path = "Menu/File", position = 10)
@Messages({
    "CTL_OpenFileAction=Open File",
    "CTL_OpenFileActionButton=Open",
    "Open_Error=An error occurred while attempting to open file"
})
public final class OpenFileAction implements ActionListener {
    private static final Logger logger = Logger.getLogger(OpenFileAction.class);
    
    public OpenFileAction(){
        BasicConfigurator.configure();
    }
    @Override
    public void actionPerformed(ActionEvent e) {
        File home = new File(System.getProperty("user.home"));
        FileNameExtensionFilter filter1 = new FileNameExtensionFilter("ERDC files", "erdc");
        File toAdd = new FileChooserBuilder("user-dir").setTitle(Bundle.CTL_OpenFileAction()).
                setDefaultWorkingDirectory(home).setApproveText(Bundle.CTL_OpenFileActionButton()).setFileFilter(filter1).showOpenDialog();
        if (toAdd == null)
            return;
        if(toAdd.getAbsolutePath().endsWith(".erdc")){
            try {
                SaveFileAction.SaveWrapper wrapper;
                FileInputStream fileIn = new FileInputStream(toAdd.getAbsolutePath());
                ObjectInputStream in = new ObjectInputStream(fileIn);
                wrapper = (SaveFileAction.SaveWrapper) in.readObject();
                in.close();
                fileIn.close();
                if(wrapper!=null){
                    EditorTopComponent etc;
                    etc = (EditorTopComponent) WindowManager.getDefault().findTopComponent("editorTopComponent");
                    etc.getScene().clean();
                    EntityExplorerManagerProvider.clean();

                    for(Entity en : wrapper.entities){
                        EntityNode node = new EntityNode(en, Children.create(new ColumnChildFactory(), true));
                        if(en.getColumns().size()>0){
                            Node[] newColumns = new Node[en.getColumns().size()];
                            for(int i=0; i<en.getColumns().size(); i++){
                                ColumnNode cn = new ColumnNode(en.getColumns().get(i));
                                newColumns[i]=cn;
                            }
                            node.getChildren().add(newColumns);
                        }
                        Node[] newNode = {node};
                        EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().add(newNode);
                    }

                    for(Relationship r : wrapper.relations){
                        RelationshipNode node = new RelationshipNode(r);
                        Node[] newNode = {node};
                        EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().add(newNode);
                    }
                    
                    for(Widget w : etc.getScene().getConnectionLayer().getChildren()){
                        if(w instanceof RelationshipWidget){
                            ((RelationshipWidget)w).reroute();
                            ((RelationshipWidget)w).revalidate();
                            ((RelationshipWidget)w).repaint();
                        }
                    }
                    etc.getScene().revalidate();
                    etc.getScene().repaint();
                    
                    DescriptionTopComponent dtc;
                    dtc = (DescriptionTopComponent) WindowManager.getDefault().findTopComponent("descriptionTopComponent");
                    dtc.setSubject(wrapper.subject);
                    dtc.setDescription(wrapper.description);
                    dtc.setDetailDescription(wrapper.detailDescription);
                    
                    DatabaseTopComponent dbtc;
                    dbtc = (DatabaseTopComponent) WindowManager.getDefault().findTopComponent("databaseTopComponent");
                    dbtc.setDatabaseSchema(wrapper.databaseSchema);
                    
                    FileChangesManager.openFile(toAdd.getName(), toAdd);
                }
            }
            catch (IOException | ClassNotFoundException | IntrospectionException ex) {
                NotifyDescriptor.Message message = new NotifyDescriptor.Message(Bundle.Open_Error());
                message.setMessageType(NotifyDescriptor.Message.ERROR_MESSAGE);
                Object result = DialogDisplayer.getDefault().notify(message);
                Exceptions.printStackTrace(ex);
                logger.error(ex);
            }
        }
        else
            try {
                DataObject.find(FileUtil.toFileObject(toAdd)).getLookup().lookup(OpenCookie.class).open();
        } catch (DataObjectNotFoundException ex) {
            Exceptions.printStackTrace(ex);
            logger.error(ex);
        }
    }
}
