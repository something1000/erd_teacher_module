package com.pl.erdc2.erdconstructor2.editor;

import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import java.awt.BorderLayout;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.beans.IntrospectionException;
import java.lang.annotation.Annotation;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JToggleButton;
import javax.swing.JScrollPane;
import javax.swing.JToolBar;
import org.netbeans.api.settings.ConvertAsProperties;
import org.openide.awt.ActionID;
import org.openide.awt.ActionReference;
import org.openide.explorer.ExplorerUtils;
import org.openide.util.Exceptions;
import org.openide.util.ImageUtilities;
import org.openide.util.Lookup;
import org.openide.util.LookupEvent;
import org.openide.util.LookupListener;
import org.openide.windows.TopComponent;
import org.openide.util.NbBundle.Messages;
import org.openide.util.Utilities;

/**
 * Top component which displays something.
 */
@ConvertAsProperties(
        dtd = "-//com.pl.erdc2.erdconstructor2.editor//editor//EN",
        autostore = false
)
@TopComponent.Description(
        preferredID = "editorTopComponent",
        iconBase = "com/pl/erdc2/erdconstructor2/editor/graphIcon2.png",
        persistenceType = TopComponent.PERSISTENCE_NEVER
)
@TopComponent.Registration(mode = "editor", openAtStartup = true)
@ActionID(category = "Window", id = "com.pl.erdc2.erdconstructor2.editor.EditorTopComponent")
@ActionReference(path = "Menu/Window" , position = 1)
@TopComponent.OpenActionRegistration(
        displayName = "#CTL_editorAction",
        preferredID = "editorTopComponent"
)
@Messages({
    "CTL_editorAction=Diagram editor",
    "CTL_editorTopComponent=Diagram editor",
    "HINT_editorTopComponent=This is a erd diagram editor window",
    "Entity=Entity"
})
public final class EditorTopComponent extends TopComponent implements LookupListener{
    private GraphSceneImpl scene;
    JToggleButton addRelationshipMode;
    JToggleButton addEntityButton;
    JButton pointerButton;
    JButton descriptionButton;
    JButton databaseButton;
    
    public EditorTopComponent() {
        initComponents();
        setName(Bundle.CTL_editorTopComponent());
        setToolTipText(Bundle.HINT_editorTopComponent());
        setLayout(new BorderLayout());
        
        Lookup l = ExplorerUtils.createLookup(EntityExplorerManagerProvider.getExplorerManager(), getActionMap());
        associateLookup(l);

        scene = new GraphSceneImpl(this);
        JScrollPane shapePane = new JScrollPane();
        shapePane.setViewportView(scene.createView());
        
        JToolBar toolbar = new JToolBar();
        
        Image pointerImage = ImageUtilities.loadImage("com/pl/erdc2/erdconstructor2/editor/pointerButton.png");
        pointerButton  = new JButton("", new ImageIcon(pointerImage));
        pointerButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent evt) {
                try {
                    pointerButtonActionPerformed(evt);
                } catch (IntrospectionException ex) {
                    Exceptions.printStackTrace(ex);
                }
            }
        });
        toolbar.add(pointerButton);
        toolbar.addSeparator();
        
        
        Image addEntityImage = ImageUtilities.loadImage("com/pl/erdc2/erdconstructor2/editor/addEntityIcon.png");
        addEntityButton = new JToggleButton("", new ImageIcon(addEntityImage));
        addEntityButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent evt) {
                try {
                    addEntityButtonActionPerformed(evt);
                } catch (IntrospectionException ex) {
                    Exceptions.printStackTrace(ex);
                }
            }
        });
        toolbar.add(addEntityButton);
        toolbar.addSeparator();
        
        Image addRelationshipImage = ImageUtilities.loadImage("com/pl/erdc2/erdconstructor2/editor/addRelationshipIcon.png");
        addRelationshipMode = new JToggleButton("", new ImageIcon(addRelationshipImage));
        addRelationshipMode.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent evt) {
                try {
                    addRelationshipModeButtonActionPerformed(evt);
                } catch (IntrospectionException ex) {
                    Exceptions.printStackTrace(ex);
                }
            }
        });
        toolbar.add(addRelationshipMode);
        toolbar.addSeparator();
        
        add(shapePane, BorderLayout.CENTER);
        add(toolbar, BorderLayout.NORTH);
                
    }
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 400, Short.MAX_VALUE)
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 300, Short.MAX_VALUE)
        );
    }// </editor-fold>//GEN-END:initComponents

    // Variables declaration - do not modify//GEN-BEGIN:variables
    // End of variables declaration//GEN-END:variables

    Lookup.Result<Entity> entitesLookup;
    Lookup.Result<Relationship> relatioshipLookup;
    
    @Override
    public void resultChanged(LookupEvent ev) {
        if(!entitesLookup.allInstances().isEmpty() || !relatioshipLookup.allInstances().isEmpty()){
            this.repaint();
        } 
    }
    
    @Override
    public void componentActivated() {
        scene.getView().requestFocusInWindow();
    }
    
    @Override
    public void componentOpened() {
        entitesLookup = Utilities.actionsGlobalContext().lookupResult(Entity.class);
        entitesLookup.addLookupListener(this);
        relatioshipLookup = Utilities.actionsGlobalContext().lookupResult(Relationship.class);
        relatioshipLookup.addLookupListener(this);
    }

    @Override
    public void componentClosed() {
        relatioshipLookup.removeLookupListener(this);
    }

    void writeProperties(java.util.Properties p) {
        // better to version settings since initial version as advocated at
        // http://wiki.apidesign.org/wiki/PropertyFiles
        p.setProperty("version", "1.0");
    }

    void readProperties(java.util.Properties p) {
        String version = p.getProperty("version");
        // TODO read your settings according to their version
    }
    
    private void addEntityButtonActionPerformed(ActionEvent evt) throws IntrospectionException {
        if(addRelationshipMode.isSelected()){
            addRelationshipMode.setSelected(false);
            scene.setAddRelationshipMode(false);
        }
        scene.toggleAddEntityMode();
    } 
    
    private void pointerButtonActionPerformed(ActionEvent evt) throws IntrospectionException {
        if(addRelationshipMode.isSelected()){
            addRelationshipMode.setSelected(false);
            scene.setAddRelationshipMode(false);
        }
        if(addEntityButton.isSelected()){
            addEntityButton.setSelected(false);
            scene.setAddEntityMode(false);
        }
    } 
    
    private void addRelationshipModeButtonActionPerformed(ActionEvent evt) throws IntrospectionException {
        if(addEntityButton.isSelected()){
            addEntityButton.setSelected(false);
            scene.setAddEntityMode(false);
        }
        scene.toggleAddRelationshipMode();
    } 
    
    public GraphSceneImpl getScene() {
        return scene;
    }

    public void setScene(GraphSceneImpl scene) {
        this.scene = scene;
    }
}
