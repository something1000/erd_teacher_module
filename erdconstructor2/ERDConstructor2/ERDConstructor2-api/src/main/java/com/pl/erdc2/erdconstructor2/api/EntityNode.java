package com.pl.erdc2.erdconstructor2.api;

import java.awt.Image;
import java.awt.event.ActionEvent;
import java.beans.IntrospectionException;

import java.util.ArrayList;
import javax.swing.AbstractAction;
import javax.swing.Action;
import java.util.Observable;
import java.util.Observer;
import org.openide.nodes.BeanNode;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.ImageUtilities;
import org.openide.util.NbBundle.Messages;
import org.openide.util.lookup.Lookups;

@Messages({
    "# {0} - entity",
    "EntityDefaultName=Entity {0}",
    "DeleteNode=Delete entity"
})

public class EntityNode extends BeanNode<Entity>  implements Observer{    
    public EntityNode(Entity bean) throws IntrospectionException {
        super(bean, Children.LEAF, Lookups.singleton(bean));

        bean.setId(getNextIdValue());
        bean.setName(Bundle.EntityDefaultName(+bean.getId()));
        setDisplayName(bean.getName());
        bean.addObserver(this);
    }

    public EntityNode(Entity bean, Children children) throws IntrospectionException {
        super(bean, children, Lookups.singleton(bean));
        if(bean.getId()==0){
            bean.setId(getNextIdValue());
            bean.setName(Bundle.EntityDefaultName(bean.getId()));
        }
        setDisplayName(bean.getName());
        bean.addObserver(this);
    }
    
    @Override
    public Image getIcon (int type) {    
        return ImageUtilities.loadImage("images/entityIcon.png");
    }
    @Override
    public Image getOpenedIcon(int i) {
        return getIcon (i);
    }
    
    @Override
    public Action[] getActions(boolean popup) {
        return new Action[]{new ContextMenuItem(this)};
    }

    private class ContextMenuItem extends AbstractAction {

        EntityNode entityNode;
        
        public ContextMenuItem(EntityNode entityNode) {
            this.entityNode = entityNode;
            putValue(NAME, Bundle.DeleteNode());
        }

        @Override
        public void actionPerformed(ActionEvent e) {  
            
            int op = 0;
            if(e.getActionCommand().equalsIgnoreCase(Bundle.DeleteNode()))
                op=1;
            switch(op)
            {
                case 1:
                    Entity entity = entityNode.getBean();
                    Entity entity2;
                    int entityId = entity.getId();              
                    Node entityRoot = EntityExplorerManagerProvider.getEntityNodeRoot();
                    Node[] entityNodes = entityRoot.getChildren().getNodes();

                    for(Node n :  entityNodes){

                        entity2 = n.getLookup().lookup(Entity.class);

                        if(entity2.getId() == entityId){
                            Node nodesToRemove[]={n};
                            entityRoot.getChildren().remove(nodesToRemove);
                            break;
                        }                                
                    }           

                    Node relationNodes[] = EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().getNodes();
                    ArrayList<Node> listRelationsToDelete = new ArrayList<>();
                    for(Node n: relationNodes){

                        Relationship r = n.getLookup().lookup(Relationship.class);

                        if(r.getSourceEntityId()== entityId || r.getDestinationEntityId() == entityId){
                            listRelationsToDelete.add(n);
                        }
                    }
                    Node[] arrayRelatonsToDelete = new Node[listRelationsToDelete.size()];
                    arrayRelatonsToDelete = listRelationsToDelete.toArray(arrayRelatonsToDelete);

                    EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().remove(arrayRelatonsToDelete); 
                    break;
            }
        }
    }
    
    private static int getNextIdValue(){
        int max=0;
        for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()){
            int id=0;
            if(n instanceof EntityNode)
                id=((EntityNode)n).getLookup().lookup(Entity.class).getId();
            max= id>max ? id : max;
        }
        return ++max;
    }

    
    @Override
    public void update(Observable o, Object arg) {
        if(!(o instanceof Entity))
            return;
        
        Entity col = (Entity)o;
        String property = (String)arg;
        if(property.equals("name")){ 
            String old = this.getDisplayName();
            this.setDisplayName(col.getName());
            this.fireDisplayNameChange(old, col.getName());
        }
    }
}
