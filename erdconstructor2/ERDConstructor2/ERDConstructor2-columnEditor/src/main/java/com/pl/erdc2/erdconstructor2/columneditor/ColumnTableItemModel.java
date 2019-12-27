package com.pl.erdc2.erdconstructor2.columneditor;

import com.pl.erdc2.erdconstructor2.api.Column;
import java.util.ArrayList;
import java.util.List;
import javax.swing.table.AbstractTableModel;
import org.openide.util.NbBundle;


@NbBundle.Messages({
    "Column_table_header_name=Name",
    "Column_table_header_type=Type",
    "Column_table_header_key=PK",
    "Column_table_header_desc=Description"
})
public class ColumnTableItemModel extends AbstractTableModel {
    private final List<Column> columns;
    
    @Override
    public int getRowCount() {
        return columns.size();
    }

    @Override
    public int getColumnCount() {
        return 4;
    }

    public ColumnTableItemModel() {
        columns = new ArrayList<>();
    }
    
    public ColumnTableItemModel(List<Column> col){
        columns = new ArrayList<>(col);
    }
    
    public void addAll(List<Column> col){
        columns.addAll(col);
    }
    
    public void add(Column c){
        if(c!=null)
            columns.add(c);
    }
    
    @Override
    public boolean isCellEditable(int row, int col){ 
        return true; 
    }
    
    @Override
    public void setValueAt(Object value, int row, int col) {
        Column column = columns.get(row);
        switch (col) {
            case 0:
                column.setName((String)value);
                break;
            case 1:
                column.setType((String)value);
                break;
            case 2:
                column.setPrimary((boolean)value);
                break;
            case 3:
                column.setDescription((String)value);
                break;
        }
        fireTableCellUpdated(row, col);
    }
    
    @Override
    public Object getValueAt(int row, int col) {
        Object value = "??";
        Column column = columns.get(row);
        switch (col) {
            case 0:
                value = column.getName();
                break;
            case 1:
                value = column.getType();
                break;
            case 2:
                value = column.isPrimary();
                break;
            case 3:
                value = column.getDescription();
                break;
        }

        return value;
    }
    
    public void clear(){
        columns.clear();
    }

    @Override
    public Class<?> getColumnClass(int col) {
        switch (col) {
            case 0:
                return String.class;
            case 1:
                return String.class;
            case 2:
                return Boolean.class;
            case 3:
                return String.class;
        }
        return null;
    }
    
    
    
    @Override
    public String getColumnName(int col) {
        switch (col) {
        case 0:
            return Bundle.Column_table_header_name();
        case 1:
            return Bundle.Column_table_header_type();
        case 2:
            return Bundle.Column_table_header_key();
        case 3:
            return Bundle.Column_table_header_desc();
        }
        return "";
    }
}
