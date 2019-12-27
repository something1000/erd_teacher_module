package com.pl.erdc2.erdconstructor2.api;

import java.beans.IntrospectionException;
import java.util.List;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.openide.nodes.ChildFactory;
import org.openide.nodes.Children;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;


public class EntityChildFactory extends ChildFactory<Entity> {

    private static final Logger logger = Logger.getLogger(EntityChildFactory.class);
    
    public EntityChildFactory()    {
        BasicConfigurator.configure();
    }
    @Override
    protected boolean createKeys(List<Entity> list) {
        return true;
    }

    @Override
    protected Node createNodeForKey(Entity key) {
        EntityNode node = null;  
        try {
            node = new EntityNode(key, Children.create(new ColumnChildFactory(), true));
        } catch (IntrospectionException ex) {
            Exceptions.printStackTrace(ex);
            logger.error(ex);
        }
        return node;
    }   
}
