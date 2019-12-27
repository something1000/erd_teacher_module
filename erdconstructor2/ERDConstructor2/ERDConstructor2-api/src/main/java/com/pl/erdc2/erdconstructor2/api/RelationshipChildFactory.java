package com.pl.erdc2.erdconstructor2.api;

import java.beans.IntrospectionException;
import java.util.List;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.openide.nodes.ChildFactory;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;


public class RelationshipChildFactory extends ChildFactory<Relationship> {

    private static final Logger logger = Logger.getLogger(RelationshipChildFactory.class);
    
    public RelationshipChildFactory()    {
        BasicConfigurator.configure();
    }
    @Override
    protected boolean createKeys(List<Relationship> list) {
        return true;
    }
    
    @Override
    protected Node createNodeForKey(Relationship key) {
        RelationshipNode node = null;
        try {
            node = new RelationshipNode(key);
        } catch (IntrospectionException ex) {
            Exceptions.printStackTrace(ex);
            logger.error(ex);
        }
        return node;
    }
    
}
