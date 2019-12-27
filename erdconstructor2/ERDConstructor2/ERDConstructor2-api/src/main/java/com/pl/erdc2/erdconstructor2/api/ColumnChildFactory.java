package com.pl.erdc2.erdconstructor2.api;

import java.beans.IntrospectionException;
import java.util.List;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.openide.nodes.ChildFactory;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;


public class ColumnChildFactory extends ChildFactory<Column> { 

    private static final Logger logger = Logger.getLogger(ColumnChildFactory.class);
    
    public ColumnChildFactory()    {
        BasicConfigurator.configure();
    }
    
    @Override
    protected boolean createKeys(List<Column> toPopulate) {
        return true;
    }

    @Override
    protected Node createNodeForKey(Column key) {
        ColumnNode node = null;
        try {
            node = new ColumnNode(key);
        } catch (IntrospectionException ex) {
            Exceptions.printStackTrace(ex);
            logger.error(ex);
        }
        return node;
    }
}
