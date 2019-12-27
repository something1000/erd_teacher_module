package com.pl.erdc2.erdconstructor2.columneditor;

import com.pl.erdc2.erdconstructor2.api.Column;
import com.pl.erdc2.erdconstructor2.api.ColumnNode;
import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityNode;
import com.pl.erdc2.erdconstructor2.api.FileChangesManager;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.beans.IntrospectionException;
import java.util.LinkedList;
import java.util.List;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;
import org.apache.log4j.Logger;

/**
 *
 * @author Piotrek
 */
public class EntityPanel extends JPanel{
    JTable table;
    JLabel entityLablel;
    JLabel nameLablel;
    JLabel descriptionLabel;
    JTextField nameField;
    JTextArea descriptionField;
    JScrollPane tablePanel;
    JButton addButton;
    JButton removeButton;
    EntityNode selectedNode = null;
    private static final Logger logger = Logger.getLogger(EntityPanel.class);

    public EntityPanel() {
        setName(Bundle.CTL_ColumnEditorTopComponent());
        setToolTipText(Bundle.HINT_ColumnEditorTopComponent());
        
        this.setMinimumSize(new Dimension(100,100));
        setLayout(new GridBagLayout());

        table = new JTable();
        table.setModel(new ColumnTableItemModel());
        table.getColumnModel().getColumn(0).setCellEditor(new MyCellEditor(new JTextField()));
        table.getColumnModel().getColumn(1).setCellEditor(new MyCellEditor(new JTextField()));
        table.getColumnModel().getColumn(3).setCellEditor(new MyCellEditor(new JTextField()));
        table.getColumnModel().getColumn(1).setPreferredWidth(120);
        table.getColumnModel().getColumn(2).setPreferredWidth(30);
        table.getColumnModel().getColumn(3).setPreferredWidth(300);
        table.setRowHeight(22);
        tablePanel = new JScrollPane(table);
        
        entityLablel = new JLabel(Bundle.Entity());
        entityLablel.setFont(new Font("Calibri", Font.PLAIN, 24));
        nameLablel = new JLabel(Bundle.Name());
        nameLablel.setFont(new Font("Calibri", Font.BOLD, 17));
        nameField = new JTextField();
        descriptionLabel = new JLabel(Bundle.Description());
        descriptionLabel.setFont(new Font("Calibri", Font.BOLD, 17));
        descriptionField = new JTextArea();
        
        descriptionField.setColumns(80);
        descriptionField.setLineWrap(true);
        descriptionField.setWrapStyleWord(true);
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
        
        
        
        addButton = new JButton();
        addButton.setEnabled(false);
        addButton.setText(Bundle.Add_Column_Button());
        addButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                addNewColumn();
            }
        });
        
        removeButton = new JButton();
        removeButton.setEnabled(false);
        removeButton.setText(Bundle.Remove_Column_Button());
        removeButton.addActionListener(new ActionListener(){
            
            @Override
            public void actionPerformed(ActionEvent e) {
                removeColumn();
            }
        });
        
        GridBagConstraints gbc = new GridBagConstraints();
        
        gbc.insets = new Insets(5,15,0,15);
        gbc.anchor = GridBagConstraints.NORTHWEST;
        gbc.weightx = 1.0;
        gbc.weighty = 1.0;
        gbc.anchor = GridBagConstraints.LINE_START;
        gbc.gridx=1;
        gbc.gridy=5;
        add(removeButton,gbc);
        gbc.gridx = 0;
        gbc.gridy = 0;
        add(entityLablel, gbc);
        gbc.gridy = 1;
        add(nameLablel, gbc);
        gbc.gridy = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.gridwidth=2;
        add(nameField, gbc);
        gbc.gridwidth=1;
        gbc.gridx = 0;
        gbc.gridy = 3;
        add(descriptionLabel, gbc);
        gbc.gridy = 4; 
        gbc.insets = new Insets(5,15,20,15);
        gbc.fill = GridBagConstraints.BOTH;
        gbc.gridwidth=2;
        add(descriptionField, gbc);
        gbc.gridwidth=1;
        gbc.insets = new Insets(5,15,0,15);
        gbc.fill = GridBagConstraints.NONE;
        gbc.gridy = 5;
        add(addButton, gbc);
        gbc.gridy = 6;
        gbc.gridwidth=2;
        gbc.gridheight=13;
        gbc.weighty=10;
        gbc.fill = GridBagConstraints.BOTH;
        add(tablePanel, gbc);
        
        
    }
    
    private void changeName(){
        if(selectedNode==null)
            return;
        Entity  en = selectedNode.getLookup().lookup(Entity.class);
        if(en==null)
            return;
        en.setName(nameField.getText());
    }
    
    private void changeDesc(){
        if(selectedNode==null)
            return;
        Entity en = selectedNode.getLookup().lookup(Entity.class);
        if(en==null)
            return;
        en.setDescription(descriptionField.getText());
    }
    
    private void addNewColumn(){
        if(selectedNode==null)
            return;
        
        FileChangesManager.change();
        Column toAdd = new Column();
        try {
            ColumnNode cn = new ColumnNode(toAdd);
            cn.addNodeListener(new ColumnNodeListener(this));
            Node[] nodesAdd = {cn};
            selectedNode.getChildren().add(nodesAdd);
        } catch (IntrospectionException ex) {
            Exceptions.printStackTrace(ex);
            logger.error(ex);
        }
        updateTable();                
    }
    
    private void removeColumn(){
        if(selectedNode==null)
            return;
        if(table.getSelectedRows().length==0)
            return;
        
        FileChangesManager.change();
        int[] selRows=table.getSelectedRows();
        Node[] nodes;
        nodes= new Node[table.getSelectedRowCount()];
        List<Node> nodess = new LinkedList<Node>();
        int j=0;
        for(int i:selRows)
        {
            System.out.println(i);
            Node n=selectedNode.getChildren().getNodeAt(i);
            nodes[j++]=n;
        }
        selectedNode.getChildren().remove(nodes);
        updateTable();
    }
    
    public void updateTable(){
        if(selectedNode==null)
            return;
        
        FileChangesManager.setSetupMode(true);
        
        table.getSelectionModel().clearSelection();
        if(table.isEditing())
            table.getCellEditor().stopCellEditing();
        ColumnTableItemModel model = (ColumnTableItemModel) table.getModel();
        model.clear();
        
        
        for(Node n : selectedNode.getChildren().getNodes()){
            Column col = n.getLookup().lookup(Column.class);
            if(col!=null)
                model.add(col);
        }
        if(selectedNode.getChildren().getNodes().length>0)
            removeButton.setEnabled(true);
        else
            removeButton.setEnabled(false);
        addButton.setEnabled(true);
        nameField.setText(selectedNode.getDisplayName());
        descriptionField.setText(selectedNode.getLookup().lookup(Entity.class).getDescription());
        model.fireTableDataChanged();
        
        FileChangesManager.setSetupMode(false);
    }
    
    public void endEdititng(){
        if(table.isEditing())
            table.getCellEditor().stopCellEditing();
    }
}
