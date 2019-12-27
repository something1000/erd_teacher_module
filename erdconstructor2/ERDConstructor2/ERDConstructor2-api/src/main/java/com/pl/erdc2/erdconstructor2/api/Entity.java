package com.pl.erdc2.erdconstructor2.api;

import java.awt.Point;
import java.awt.Rectangle;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Observable;


public class Entity extends Observable  implements Serializable{
    private int id;
    private String name;
    private String description = "";
    
    //save properties
    private Rectangle bounds;
    private Point location;
    private List<Column> columns;
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        if(name!=null && this.name!=null && !name.equals(this.name))
            FileChangesManager.change();
        this.name = name;
        setChanged();
        notifyObservers("name");
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        if(!description.equals(this.description))
            FileChangesManager.change();
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Rectangle getBounds() {
        return bounds;
    }

    public void setBounds(Rectangle bounds) {
        this.bounds = bounds;
    }

    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
    }

    public List<Column> getColumns() {
        if(columns==null)
            columns=new ArrayList<>();
        return columns;
    }

    public void setColumns(List<Column> columns) {
        this.columns = columns;
    }
    
    @Override
    public String toString() {
        return name;
    }
    
}
