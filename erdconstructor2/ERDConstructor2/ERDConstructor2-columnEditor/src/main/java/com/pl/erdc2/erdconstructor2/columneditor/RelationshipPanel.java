package com.pl.erdc2.erdconstructor2.columneditor;

import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import org.openide.nodes.Node;

/**
 *
 * @author Piotrek
 */
public class RelationshipPanel extends JPanel{
    JLabel relationshipLablel;
    JLabel nameLabel;
    JLabel descriptionLabel;
    JLabel entityLabel;
    JLabel typeLabel;
    JTextField nameField;
    JTextArea descriptionField;
    JComboBox<Entity> entity1;
    JComboBox<Entity> entity2;
    JComboBox<String> type1;
    JComboBox<String> type2;
    RelationshipNode selectedNode = null;

    Entity1Listener entity1Listener;
    Entity2Listener entity2Listener;
    Type1Listener type1Listener;
    Type2Listener type2Listener;
    
    public RelationshipPanel() {
        setName(Bundle.CTL_ColumnEditorTopComponent());
        setToolTipText(Bundle.HINT_ColumnEditorTopComponent());
                
        setLayout(new GridBagLayout());
        
        relationshipLablel = new JLabel(Bundle.Relationship());
        relationshipLablel.setFont(new Font("Calibri", Font.PLAIN, 24));
        nameLabel = new JLabel(Bundle.Name());
        nameLabel.setFont(new Font("Calibri", Font.BOLD, 17));
        descriptionLabel = new JLabel(Bundle.Description());
        descriptionLabel.setFont(new Font("Calibri", Font.BOLD, 17));
        entityLabel = new JLabel(Bundle.Entity());
        entityLabel.setFont(new Font("Calibri", Font.BOLD, 17));
        typeLabel = new JLabel(Bundle.Type());
        typeLabel.setFont(new Font("Calibri", Font.BOLD, 17));
        
        nameField = new JTextField();
        nameField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                changeName();
            }
            @Override
            public void removeUpdate(DocumentEvent e) {
                changeName();
            }
            @Override
            public void changedUpdate(DocumentEvent e){
                changeName();
            }
        });
        
        descriptionField = new JTextArea();
        descriptionField.setColumns(80);
        descriptionField.setLineWrap(true);
        descriptionField.setWrapStyleWord(true);
        descriptionField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                changeDesc();
            }
            @Override
            public void removeUpdate(DocumentEvent e) {
                changeDesc();
            }
            @Override
            public void changedUpdate(DocumentEvent e){
                changeDesc();
            }
        });
        
        entity1 = new JComboBox<>();
        entity1Listener = new Entity1Listener();
        entity2 = new JComboBox<>();
        entity2Listener = new Entity2Listener();
        
        type1 = new JComboBox<>(Relationship.TYPES);
        type2 = new JComboBox<>(Relationship.TYPES);
        type1Listener = new Type1Listener();
        type2Listener = new Type2Listener();
        
        JLabel empty = new JLabel("");
        
        GridBagConstraints gbc = new GridBagConstraints();
        this.setMinimumSize(new Dimension(100,100));
        gbc.insets = new Insets(5,15,0,15);
        gbc.weightx = 1.0;
        gbc.weighty = 1.0;
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.NORTHWEST;
        add(relationshipLablel, gbc);
        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.gridwidth=2;
        add(nameLabel, gbc);
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        add(nameField, gbc);
        gbc.gridx = 0;
        gbc.gridy = 3;
        add(descriptionLabel, gbc);
        gbc.gridx = 0;
        gbc.gridy = 4;
        gbc.insets = new Insets(5,15,20,15);
        gbc.fill = GridBagConstraints.BOTH;
        add(descriptionField, gbc);
        gbc.insets = new Insets(5,15,0,15);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.gridx = 0;
        gbc.gridy = 5;
        gbc.gridwidth=1;
        add(entityLabel, gbc);
        gbc.gridx = 1;
        gbc.gridy = 5;
        add(typeLabel, gbc);
        gbc.gridx = 0;
        gbc.gridy = 6;
        gbc.fill = GridBagConstraints.NONE;
        add(entity1, gbc);
        gbc.gridx = 1;
        gbc.gridy = 6;
        add(type1, gbc);
        gbc.gridx = 0;
        gbc.gridy = 7;
        add(entity2, gbc);
        gbc.gridx = 1;
        gbc.gridy = 7;
        add(type2, gbc);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.gridx = 0;
        gbc.gridy = 8;
        gbc.gridwidth=2;
        gbc.gridheight=15;
        gbc.weighty=15;
        gbc.fill = GridBagConstraints.BOTH;
        add(empty, gbc);
        
    }
    
    private void changeName(){
        if(selectedNode==null)
            return;
        Relationship rel = selectedNode.getLookup().lookup(Relationship.class);
        if(rel==null)
            return;
        rel.setName(nameField.getText());
    }
    
    private void changeDesc(){
        if(selectedNode==null)
            return;
        Relationship rel = selectedNode.getLookup().lookup(Relationship.class);
        if(rel==null)
            return;
        rel.setDescription(descriptionField.getText());
    }
    
    public void updatePanel(){
        if(selectedNode==null)
            return;
        
        FileChangesManager.setSetupMode(true);
        
        Relationship rel = selectedNode.getRelationship();
        if(rel==null)
            return;
        
        nameField.setText(rel.getName());
        descriptionField.setText(rel.getDescription());
                
        Node[] nodes = EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes();
        entity2.removeAllItems();
        entity1.removeAllItems();
        entity1.removeItemListener(entity1Listener);
        entity2.removeItemListener(entity2Listener);
        type1.removeItemListener(type1Listener);
        type2.removeItemListener(type2Listener);
        for(Node n:nodes){
            Entity e = n.getLookup().lookup(Entity.class); 
            if(e==null)
                continue;
            entity2.addItem(e);
            entity1.addItem(e);
            
            if(e.getId()==rel.getSourceEntityId())
                entity1.setSelectedItem(e);
            
            if(e.getId()==rel.getDestinationEntityId())
                entity2.setSelectedItem(e);
        }
        type1.setSelectedItem(rel.getSourceType());
        type2.setSelectedItem(rel.getDestinationType());
        
        entity1.addItemListener(entity1Listener);
        entity2.addItemListener(entity2Listener);
        type1.addItemListener(type1Listener);
        type2.addItemListener(type2Listener);
        
        if ("IS_A".equals(selectedNode.getRelationship().getSourceType()))
        {
            nameField.setEnabled(false);
            type2.setEnabled(false);
            type1.setEnabled(true);
        }
        else if ("IS_A".equals(selectedNode.getRelationship().getDestinationType()))
        {
            nameField.setEnabled(false);
            type1.setEnabled(false);
            type2.setEnabled(true);
        }
        else 
        {
            nameField.setEnabled(true);
            type2.setEnabled(true);
            type1.setEnabled(true);
        }
        
        FileChangesManager.setSetupMode(false);
    }
    
    private class Entity1Listener implements ItemListener{
        @Override
        public void itemStateChanged(ItemEvent e) {
            if(entity1.getSelectedItem()!=null && selectedNode!=null && selectedNode.getRelationship()!=null)
                selectedNode.getRelationship().setSourceEntityId(((Entity)entity1.getSelectedItem()).getId());
        }
    }
    private class Entity2Listener implements ItemListener{
        @Override
        public void itemStateChanged(ItemEvent e) {
            if(entity2.getSelectedItem()!=null && selectedNode!=null && selectedNode.getRelationship()!=null)
                selectedNode.getRelationship().setDestinationEntityId(((Entity)entity2.getSelectedItem()).getId());
        }
    }
    private class Type1Listener implements ItemListener{
        @Override
        public void itemStateChanged(ItemEvent e) {
            if(entity1.getSelectedItem()!=null && selectedNode!=null && selectedNode.getRelationship()!=null)
            {
                selectedNode.getRelationship().setSourceType((String)type1.getSelectedItem());
                if ("IS_A".equals(selectedNode.getRelationship().getSourceType()))
                {
                    selectedNode.getRelationship().setName("IS_A");
                    nameField.setText("IS_A");
                    type2.setSelectedItem(Relationship.TYPES[1]);
                    nameField.setEnabled(false);
                    type2.setEnabled(false);
                }
                else
                {
                    nameField.setEnabled(true);
                    type2.setEnabled(true);
                }
            }
        }
    }
    private class Type2Listener implements ItemListener{
        @Override
        public void itemStateChanged(ItemEvent e) {
            if(type2.getSelectedItem()!=null && selectedNode!=null && selectedNode.getRelationship()!=null)
            {
                selectedNode.getRelationship().setDestinationType((String)type2.getSelectedItem());
                if ("IS_A".equals(selectedNode.getRelationship().getDestinationType()))
                {
                    selectedNode.getRelationship().setName("IS_A");
                    nameField.setText("IS_A");
                    type1.setSelectedItem(Relationship.TYPES[1]);
                    nameField.setEnabled(false);
                    type1.setEnabled(false);
                }
                else
                {
                    nameField.setEnabled(true);
                    type1.setEnabled(true);
                }
            }
        }
    }
}
