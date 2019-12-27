package com.pl.erdc2.erdconstructor2.api;


import java.awt.Image;
import java.awt.event.ActionEvent;
import java.beans.IntrospectionException;
import java.util.Observable;
import java.util.Observer;
import javax.swing.AbstractAction;
import javax.swing.Action;
import org.openide.nodes.BeanNode;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.ImageUtilities;
import org.openide.util.NbBundle.Messages;
import org.openide.util.lookup.Lookups;


 @Messages({
    "ColumnDelete=Delete"
 })

public class ColumnNode  extends BeanNode<Column> implements Observer{
    public ColumnNode(Column bean) throws IntrospectionException {
        super(bean, Children.LEAF, Lookups.singleton(bean));
        if(bean.getName()==null){
            bean.setName("Attribute");
            bean.setDescription("");
        }
        bean.addObserver(this);
        this.setDisplayName(bean.getName());
        
    }

    @Override
    public void update(Observable o, Object arg) {
        if(o instanceof Column){
            Column col = (Column)o;
            String property = (String)arg;
            if(property.equals("name")){ 
                String old = this.getDisplayName();
                this.setDisplayName(col.getName());
                this.fireDisplayNameChange(old, col.getName());
            }
            else if(property.equals("primary")){
                this.fireIconChange();
            }
        }
    }
    
    @Override
    public Image getIcon (int type) {
        Column c = this.getLookup().lookup(Column.class);
        if(c!=null && c.isPrimary()){
            return ImageUtilities.loadImage("images/keyColumnIconS.png");
        }
        return ImageUtilities.loadImage("images/columnIconS.png");
    }
    
    @Override
    public Image getOpenedIcon(int i) {
        return getIcon (i);
    }
    @Override 
    public Action[] getActions(boolean popup){
       return new Action[]{new ContextMenuItem()}; 
    }
    
    public class ContextMenuItem extends AbstractAction{

        public ContextMenuItem(){
            putValue(NAME, Bundle.ColumnDelete());
        }
         
        @Override
        public void actionPerformed(ActionEvent e) {
            Column col = getLookup().lookup(Column.class);
            int op=0;
            if(e.getActionCommand().equalsIgnoreCase(Bundle.ColumnDelete()))
                op=1;
            switch(op){
               
                case 1:  System.out.println("sdfdfg");
                    for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()){                  
                    if(n instanceof EntityNode){
                       Node nod[]=n.getChildren().getNodes();
                       for(Node no:nod){
                           if(no instanceof ColumnNode){
                               Column c=no.getLookup().lookup(Column.class);
                               if(c.getId()==col.getId()){
                                   System.out.println(c.getId());
                                   Node toRemove[]={no};
                                   n.getChildren().remove(toRemove);
                                   
                               }
                           }
                       } 
                    }
                    
                }  
                break;
            }
        }
    }
}
