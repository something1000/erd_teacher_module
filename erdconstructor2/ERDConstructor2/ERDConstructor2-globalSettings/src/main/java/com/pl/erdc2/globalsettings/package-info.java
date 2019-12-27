/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
@OptionsPanelController.ContainerRegistration(
        id = "ERDConstructor2Settings", 
        categoryName = "#OptionsCategory_Name_ERDConstructor2Settings", 
        iconBase = "com/pl/erdc2/globalsettings/gear-icon.png", 
        keywords = "#OptionsCategory_Keywords_ERDConstructor2Settings", 
        keywordsCategory = "ERDConstructor2Settings")
@NbBundle.Messages(
        value = {
            "OptionsCategory_Name_ERDConstructor2Settings=ERD Constructor 2 Settings", 
            "OptionsCategory_Keywords_ERDConstructor2Settings=settings erd"})
package com.pl.erdc2.globalsettings;

import org.netbeans.spi.options.OptionsPanelController;
import org.openide.util.NbBundle;
