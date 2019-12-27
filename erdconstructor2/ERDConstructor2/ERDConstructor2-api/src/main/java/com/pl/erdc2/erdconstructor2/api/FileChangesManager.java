package com.pl.erdc2.erdconstructor2.api;

import java.io.File;
import org.openide.util.NbBundle;
import org.openide.windows.WindowManager;
import org.openide.windows.TopComponent;
/**
 *
 * @author Piotrek
 */
@NbBundle.Messages({
    "CTL_editorTopComponent=Diagram editor",
    "CTL_descriptionTopComponent=Project description",
    "CTL_databaseTopComponent=Database schema"
})
public class FileChangesManager{
    private static String filename="";
    private static boolean fileWasChanged=false;
    private static TopComponent etc, dtc, dbtc;
    private static File file;
    private static boolean setupMode=false;
        
    private FileChangesManager(){
        etc = WindowManager.getDefault().findTopComponent("editorTopComponent");
        dtc = WindowManager.getDefault().findTopComponent("descriptionTopComponent");
        dbtc = WindowManager.getDefault().findTopComponent("databaseTopComponent");
    }

    public static void change(){
        if(setupMode)
            return;
        if(!fileWasChanged && !filename.equals(""))
        {
            getEtc().setHtmlDisplayName("<html><b>"+"ERD "+filename+"</b></html>");
            getDtc().setHtmlDisplayName("<html><b>Description</b></html>");
            getDbtc().setHtmlDisplayName("<html><b>Database</b></html>");
        }
        fileWasChanged=true;
    }
    
    public static void newFile(){
        fileWasChanged=false;
        filename="";
        getEtc().setHtmlDisplayName(Bundle.CTL_editorTopComponent());
        getDtc().setHtmlDisplayName(Bundle.CTL_descriptionTopComponent());
        getDbtc().setHtmlDisplayName(Bundle.CTL_databaseTopComponent());
    }
    
    public static void openFile(String filename, File f){
        fileWasChanged=false;
        FileChangesManager.filename = filename;
        file=f;
        getEtc().setHtmlDisplayName(filename);
        getDtc().setHtmlDisplayName(filename);
        getDbtc().setHtmlDisplayName(filename);
    }
    
    public static void saveFile(String filename, File f){
        fileWasChanged=false;
        FileChangesManager.filename = filename;
        file=f;
        getEtc().setHtmlDisplayName(filename);
        getDtc().setHtmlDisplayName(filename);
        getDbtc().setHtmlDisplayName(filename);
    }

    public static void setSetupMode(boolean setupMode) {
        FileChangesManager.setupMode = setupMode;
    }

    public static String getFilename() {
        return filename;
    }

    public static boolean isFileWasChanged() {
        return fileWasChanged;
    }

    public static File getFile() {
        return file;
    }
    
    private static TopComponent getEtc(){
        if(etc==null)
            etc = WindowManager.getDefault().findTopComponent("editorTopComponent");
        return etc;
    }
    
    private static TopComponent getDtc(){
        if(dtc==null)
            dtc = WindowManager.getDefault().findTopComponent("descriptionTopComponent");
        return dtc;
    }
    
    private static TopComponent getDbtc(){
        if(dbtc==null)
            dbtc = WindowManager.getDefault().findTopComponent("databaseTopComponent");
        return dbtc;
    }
}
