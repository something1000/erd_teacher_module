package com.pl.erdc2.erdconstructor2.columneditor;

import com.pl.erdc2.erdconstructor2.api.EntityNode;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import java.awt.BorderLayout;
import org.netbeans.api.settings.ConvertAsProperties;
import org.openide.awt.ActionID;
import org.openide.awt.ActionReference;
import org.openide.nodes.Node;
import org.openide.util.Lookup;
import org.openide.util.LookupEvent;
import org.openide.util.LookupListener;
import org.openide.windows.TopComponent;
import org.openide.util.NbBundle.Messages;
import org.openide.util.Utilities;
import org.openide.windows.WindowManager;

/**
 * Top component which displays something.
 */
@ConvertAsProperties(
        dtd = "-//com.pl.erdc2.erdconstructor2.columneditor//ColumnEditor//EN",
        autostore = false
)
@TopComponent.Description(
        preferredID = "ColumnEditorTopComponent",
        //iconBase="SET/PATH/TO/ICON/HERE", 
        persistenceType = TopComponent.PERSISTENCE_ALWAYS
)
@TopComponent.Registration(mode = "properties", openAtStartup = true)
@ActionID(category = "Window", id = "com.pl.erdc2.erdconstructor2.columneditor.ColumnEditorTopComponent")
@ActionReference(path = "Menu/Window" /*, position = 333 */)
@TopComponent.OpenActionRegistration(
        displayName = "#CTL_ColumnEditorAction",
        preferredID = "ColumnEditorTopComponent"
)
@Messages({
    "CTL_ColumnEditorAction=Properties Editor",
    "CTL_ColumnEditorTopComponent=Properties editor window",
    "HINT_ColumnEditorTopComponent=This is a properties editor window",
    "Add_Column_Button=New column",
    "Remove_Column_Button=Remove column",
    "Relationship=Relationship",
    "Entity=Entity",
    "Name=Name",
    "Description=Description",
    "Type=Type"
})
public final class ColumnEditorTopComponent extends TopComponent  implements LookupListener{
    EntityPanel entityPanel;
    RelationshipPanel relationshipPanel;
    Lookup.Result<Node> entitesLookup;
    
    
    public ColumnEditorTopComponent() {
        initComponents();
        setName(Bundle.CTL_ColumnEditorTopComponent());
        setToolTipText(Bundle.HINT_ColumnEditorTopComponent());
        setLayout(new BorderLayout());
        
        entityPanel = new EntityPanel();
        relationshipPanel = new RelationshipPanel();
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
    
    
    
    
    
    @Override
    public void componentOpened() {
        entitesLookup = Utilities.actionsGlobalContext().lookupResult(Node.class);
        entitesLookup.addLookupListener(this);
    }

    @Override
    public void componentClosed() {
        entitesLookup.removeLookupListener(this);
    }

    void writeProperties(java.util.Properties p) {
        // better to version settings since initial version as advocated at
        // http://wiki.apidesign.org/wiki/PropertyFiles
        p.setProperty("version", "1.0");
        // TODO store your settings
    }

    void readProperties(java.util.Properties p) {
        String version = p.getProperty("version");
        // TODO read your settings according to their version
    }
    


    @Override
    public void resultChanged(LookupEvent ev) {
        if(entitesLookup.allInstances().size()!=1 && !entitesLookup.allInstances().iterator().hasNext())
            return;
        Node n = entitesLookup.allInstances().iterator().next(); 

        if(n instanceof EntityNode){
            entityPanel.selectedNode = (EntityNode)n;
            entityPanel.updateTable();
            this.add(entityPanel, BorderLayout.CENTER);
            this.remove(relationshipPanel);
        }
        else if(n instanceof RelationshipNode){
            entityPanel.endEdititng();
            relationshipPanel.selectedNode = (RelationshipNode) n;
            relationshipPanel.updatePanel();
            this.add(relationshipPanel, BorderLayout.CENTER);
            this.remove(entityPanel);
        }
        else{
        }
        this.revalidate();
        this.repaint();
    }
    
    
}
