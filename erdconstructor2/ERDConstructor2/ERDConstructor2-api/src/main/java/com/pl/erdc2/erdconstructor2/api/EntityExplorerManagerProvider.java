package com.pl.erdc2.erdconstructor2.api;

import java.awt.Image;
import java.util.ArrayList;
import java.util.List;
import org.openide.explorer.ExplorerManager;
import org.openide.nodes.AbstractNode;
import org.openide.nodes.ChildFactory;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.ImageUtilities;
import org.openide.util.NbBundle.Messages;

/**
 *
 * @author Piotrek
 * Entity Explorer manager provider based on code from https://blogs.oracle.com/geertjan/entry/sharing_explorermanagers_between_topcomponents
 */
@Messages({
    "EntityNodeRootName=Entities",
    "RelatioshipNodeRootName=Relationships"
})
public class EntityExplorerManagerProvider{
    private static ExplorerManager em;
    private static final EntityExplorerManagerProvider instance = new EntityExplorerManagerProvider();
    private static Node entityNodeRoot;
    private static Node relatioshipNodeRoot;
    
    private EntityExplorerManagerProvider(){
        em =  new ExplorerManager();
        em.setRootContext(new AbstractNode(Children.create(new ChildFactory() {
            @Override
            protected boolean createKeys(List list) {return true;}
        }, true)));
        entityNodeRoot = new AbstractNode(Children.create(new EntityChildFactory(), true)){
            @Override
            public Image getIcon(int type) {
                return ImageUtilities.loadImage("images/entities.png");
            }
            @Override
            public Image getOpenedIcon(int i) {
                return getIcon (i);
            }
        };
        entityNodeRoot.setDisplayName(Bundle.EntityNodeRootName());
        
        relatioshipNodeRoot = new AbstractNode(Children.create(new RelationshipChildFactory(), true)){
            @Override
            public Image getIcon(int type) {
                return ImageUtilities.loadImage("images/relationships.png");
            }
            @Override
            public Image getOpenedIcon(int i) {
                return getIcon (i);
            }
        };
        relatioshipNodeRoot.setDisplayName(Bundle.RelatioshipNodeRootName());
        
        Node[] nodes = {entityNodeRoot, relatioshipNodeRoot};
        em.getRootContext().getChildren().add(nodes);
    }
    
    public static Entity getEntityById(int id){
        for(Node n: entityNodeRoot.getChildren().getNodes()){
            Entity en = n.getLookup().lookup(Entity.class);
            if(en!=null && en.getId()==id)
                return en;
        }
        return null;
    }
    
    public static void clean(){
       entityNodeRoot.getChildren().remove(entityNodeRoot.getChildren().getNodes());
       relatioshipNodeRoot.getChildren().remove(relatioshipNodeRoot.getChildren().getNodes());
    }
    
    public static void deleteEntity(EntityNode bean){
        int id = bean.getLookup().lookup(Entity.class).getId();
        
        Node relationNodes[] = EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().getNodes();
        ArrayList<Node> listRelationsToDelete = new ArrayList<>();
        for(Node n: relationNodes){
            Relationship r = n.getLookup().lookup(Relationship.class);
            if(r.getSourceEntityId()== id || r.getDestinationEntityId() == id){
                listRelationsToDelete.add(n);
            }
        }
        Node[] arrayRelatonsToDelete = new Node[listRelationsToDelete.size()];
        arrayRelatonsToDelete = listRelationsToDelete.toArray(arrayRelatonsToDelete);

        EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().remove(arrayRelatonsToDelete); 

        Node[] toDelete = {bean};
        EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().remove(toDelete);
    }
    
    public static void deleteRelationship(RelationshipNode bean){
        Node delete[] = {bean};
        EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().remove(delete);
    }
    
    public static ExplorerManager getExplorerManager(){
        return em;
    }

    public static Node getEntityNodeRoot() {
        return entityNodeRoot;
    }

    public static Node getRelatioshipNodeRoot() {
        return relatioshipNodeRoot;
    }
    
}
