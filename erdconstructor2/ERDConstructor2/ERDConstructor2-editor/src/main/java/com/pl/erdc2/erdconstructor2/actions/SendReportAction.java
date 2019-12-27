
package com.pl.erdc2.erdconstructor2.actions;

import com.pl.erdc2.erdconstructor2.api.Column;
import com.pl.erdc2.erdconstructor2.api.Entity;
import com.pl.erdc2.erdconstructor2.api.EntityExplorerManagerProvider;
import com.pl.erdc2.erdconstructor2.api.Relationship;
import com.pl.erdc2.erdconstructor2.api.RelationshipNode;
import com.pl.erdc2.erdconstructor2.editor.DatabaseTopComponent;
import com.pl.erdc2.erdconstructor2.editor.DescriptionTopComponent;
import com.pl.erdc2.erdconstructor2.editor.EditorTopComponent;
import com.pl.erdc2.erdconstructor2.editor.EntityWidget;
import com.pl.erdc2.erdconstructor2.editor.GraphSceneImpl;
import com.pl.erdc2.erdconstructor2.editor.RelationshipWidget;
import com.pl.erdc2.globalsettings.ServerInfoPanel;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.prefs.Preferences;
import javax.swing.JOptionPane;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.openide.awt.ActionID;
import org.openide.awt.ActionReference;
import org.openide.awt.ActionRegistration;
import org.openide.util.NbBundle;
import org.openide.util.NbPreferences;
import com.pl.erdc2.globalsettings.UserInfoPanel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import javafx.geometry.Bounds;
import javax.imageio.ImageIO;
import javax.swing.ImageIcon;
import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JWindow;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;
import javax.swing.border.EmptyBorder;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.netbeans.api.visual.widget.LabelWidget;
import org.netbeans.api.visual.widget.Widget;
import org.openide.nodes.Node;
import org.openide.util.Exceptions;
import org.openide.util.ImageUtilities;
import org.openide.windows.WindowManager;


/**
 *
 * @author Kamil Jablonski
 */

@ActionID(category = "File", id = "com.pl.erdc2.SendReportAction")
@ActionRegistration(displayName = "#CTL_SendReportAction")
@ActionReference(path = "Menu/File", position = 15)
@NbBundle.Messages({"# {0} - email",
        "Send_Info=Confirmation to email {0}. Are you sure you want to send report? Previous report will be removed if was sent",
        "TooSmallImage=Created ERD is to small to send... If you are sure ERD is big enough try to resize window or entitis",
        "Empty_Fields=Some fields in the project are empty. \nCheck the project description, relational database schema and descriptions of all relationships and entities. \nContinue sending the report with empty fields?",
        "Required_Empty_Fields=Required fields in the project are empty. \nCheck the project description and relational database schema tabs. \n",
        "CTL_SendReportAction=Send report",
        "Successful_Sending=Your work was successfuly uploaded on server. \nCheck your mail box (also spam) to make sure work is valid and confirm it",
        "# {0} - serv_resp",
        "Failure_Sending=Something went wrong while uploading work on server.\nServer response:\n {0}"
        })

public class SendReportAction implements ActionListener {
    final String MAIL_REGEXP = "^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$";

    private enum BehaviourType{
            ASK,
            PASS,
            BLOCK
    }

    private class EmptyFieldBehaviour{
        String reason = "";
        BehaviourType behaviour = BehaviourType.BLOCK;
        public EmptyFieldBehaviour(String reason, BehaviourType behaviour) {
            this.reason = reason;
            this.behaviour = behaviour;
        }
    }
    
    private static final Logger logger = Logger.getLogger(SendReportAction.class);
    
    public SendReportAction() {
        BasicConfigurator.configure();
    }

    @Override
    public void actionPerformed(ActionEvent ae) {
        EmptyFieldBehaviour emptyField = this.validateReport();
        boolean send = true;
        if (emptyField.behaviour == BehaviourType.ASK) {
            int res = JOptionPane.showOptionDialog(null,
                        Bundle.Empty_Fields() + "\n" + emptyField.reason,
                        Bundle.Confirm(), JOptionPane.YES_NO_OPTION,
                        JOptionPane.INFORMATION_MESSAGE, null,
                        new String[]{Bundle.Yes_Option(), Bundle.No_Option()}, "default");
                if (res == JOptionPane.YES_OPTION)
                    send = true;
                else
                    send = false;
        } else if(emptyField.behaviour  == BehaviourType.PASS){
            send = true;
        }  else if(emptyField.behaviour  == BehaviourType.BLOCK){
            JOptionPane.showMessageDialog(null, Bundle.Required_Empty_Fields() + "\n" + emptyField.reason);
            return;
        }
        
        if (send) {
        UserSettingsDto us = getUserSettings();
        String mail = generateMailFromIndex(us.getIndexNo()); //us.getEmail();
        int response = JOptionPane.showOptionDialog(null,
                        (Object) Bundle.Send_Info(mail), 
                        Bundle.Confirm(), JOptionPane.YES_NO_OPTION, 
                        JOptionPane.INFORMATION_MESSAGE, null, 
                        new String[]{Bundle.Yes_Option(), Bundle.No_Option()}, "default");
                if (response == JOptionPane.YES_OPTION) {
                    boolean success = sendReport();
                    if(success){
                    }
                }
        }
    }
    
     private UserSettingsDto getUserSettings() {
        UserSettingsDto userSettingsDto = new UserSettingsDto();
        Preferences pref = NbPreferences.forModule(UserInfoPanel.class);
        userSettingsDto.setFirstName(pref.get("firstNamePreference", ""));
        userSettingsDto.setLastName(pref.get("lastNamePreference", ""));
        userSettingsDto.setIndexNo(pref.get("indexNoPreference", ""));
        userSettingsDto.setGroupID(pref.get("groupIDPreference", ""));
        userSettingsDto.setTermCode(pref.get("termPreference", ""));
        //userSettingsDto.setEmail(pref.get("emailPreference", ""));
        return userSettingsDto;
    }

     private EmptyFieldBehaviour validateReport() {
        UserSettingsDto userSettings = getUserSettings();
        if(userSettings.getTermCode().equals("") || //userSettings.getEmail().equals("")     ||
           userSettings.getIndexNo().equals("")   || userSettings.getGroupID().equals("") ||
           userSettings.getFirstName().equals("") || userSettings.getLastName().equals("")){
            return new EmptyFieldBehaviour("Empty student information fields in description tab", BehaviourType.BLOCK);
        }

        try{
            Integer.parseUnsignedInt(userSettings.getIndexNo());
        } catch(NumberFormatException e){
            return new EmptyFieldBehaviour("Provided index has invalid format", BehaviourType.BLOCK);
        }


        //if(!Pattern.compile(MAIL_REGEXP).matcher(userSettings.getEmail()).matches()){
        if(!Pattern.compile(MAIL_REGEXP).matcher(generateMailFromIndex(userSettings.getIndexNo())).matches()){
            return new EmptyFieldBehaviour("Generated email has invalid format", BehaviourType.BLOCK);
        }

        DescriptionTopComponent dtc = (DescriptionTopComponent) WindowManager.getDefault().findTopComponent("descriptionTopComponent");
        if (dtc.getSubject().equals("") || dtc.getDescription().equals("") || dtc.getDetailDescription().equals(""))
            return new EmptyFieldBehaviour("Empty description fields", BehaviourType.BLOCK);
        
        DatabaseTopComponent dbtc = (DatabaseTopComponent) WindowManager.getDefault().findTopComponent("databaseTopComponent");
        if (dbtc.getDatabaseSchema().equals(""))
            return new EmptyFieldBehaviour("Empty database schema", BehaviourType.BLOCK);
        
        for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()) {
            Entity ent = n.getLookup().lookup(Entity.class);
            if(ent == null) continue;
            if (ent.getDescription() == null || ent.getDescription().equals("")){
                return new EmptyFieldBehaviour("Empty description in " + ent.getName() + " entity", BehaviourType.ASK);
            }
            for(Column x : ent.getColumns()){
                if(x.getDescription() == null || x.getDescription().equals("")){
                    return new EmptyFieldBehaviour("Empty description in one of the" + ent.getName() + " entity column", BehaviourType.ASK);
                }
                if(x.getName() == null || x.getName().equals("")){
                    return new EmptyFieldBehaviour("Empty name in one of the" + ent.getName() + " entity column", BehaviourType.ASK);
                }
                if(x.getType()== null || x.getType().equals("")){
                    return new EmptyFieldBehaviour("Empty type in one of the" + ent.getName() + " entity column", BehaviourType.ASK);
                }
            }
        }
        
        for(Node n : EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().getNodes()) {
            Relationship rel = n.getLookup().lookup(Relationship.class);
            if (rel != null && rel.getDescription()!= null && rel.getDescription().equals(""))
                return new EmptyFieldBehaviour("Empty description in " + rel.getName() + " relationship", BehaviourType.ASK);
        }
        
        return new EmptyFieldBehaviour("", BehaviourType.PASS);
     }
     
     private boolean sendReport(){
        final JDialog frame = getLoadingFrame();
        frame.setVisible(true);

        UserSettingsDto userSettings = getUserSettings();
        DescriptionTopComponent dtc = (DescriptionTopComponent) WindowManager.getDefault().findTopComponent("descriptionTopComponent");
        DatabaseTopComponent dbtc = (DatabaseTopComponent) WindowManager.getDefault().findTopComponent("databaseTopComponent");
        
        JSONObject report = new JSONObject();  
        report.put("index", String.valueOf(Integer.parseUnsignedInt(userSettings.getIndexNo())));
        report.put("project_group", userSettings.getGroupID());
        report.put("project_subject", dtc.getSubject());
        report.put("project_desc", dtc.getDescription());
        report.put("project_details", dtc.getDetailDescription());
        
        JSONArray entities = new JSONArray();
        for(Node n : EntityExplorerManagerProvider.getEntityNodeRoot().getChildren().getNodes()){
            Entity ent = n.getLookup().lookup(Entity.class); 
                
            JSONObject entity = new JSONObject();
            entity.put("name", ent.getName());
            entity.put("description", ent.getDescription());
            entity.put("hash", ent.hashCode());
            JSONArray columns = new JSONArray();
                
            for(Node columnNode : n.getChildren().getNodes()){
                JSONObject column = new JSONObject();
                Column c = columnNode.getLookup().lookup(Column.class);
                column.put("name", c.getName());
                column.put("primary", c.isPrimary() ? true: false);
                column.put("type", c.getType());
                column.put("description", c.getDescription());
                columns.put(column);
            }
            entity.put("columns", columns);
            entities.put(entity);
        }
        report.put("entities", entities);
        
        JSONArray relationships = new JSONArray();
        for(Node n : EntityExplorerManagerProvider.getRelatioshipNodeRoot().getChildren().getNodes()){
            Relationship rel = n.getLookup().lookup(Relationship.class);
                
            JSONObject relation = new JSONObject();
            relation.put("name", rel.getName());
            relation.put("description", rel.getDescription());
            relation.put("hash", n.hashCode());
            
            Entity e1 = EntityExplorerManagerProvider.getEntityById(rel.getSourceEntityId());
            Entity e2 = EntityExplorerManagerProvider.getEntityById(rel.getDestinationEntityId());
            relation.put("entity_1", e1.getName());
            relation.put("entity_2", e2.getName());
            relation.put("cardinality", (rel.getSourceType()+" : "+rel.getDestinationType()));
            relationships.put(relation);
        }
        report.put("relationships", relationships);
        
        report.put("schema", dbtc.getDatabaseSchema());
        
        EditorTopComponent etc;
        etc = (EditorTopComponent) WindowManager.getDefault().findTopComponent("editorTopComponent");
        GraphSceneImpl scene = etc.getScene();
        JComponent view = scene.getView();
        BigDecimal scale = new BigDecimal(scene.getZoomFactor());
        BigDecimal width = new BigDecimal(view.getPreferredSize().width).divide(scale, RoundingMode.HALF_UP);
        BigDecimal height = new BigDecimal(view.getPreferredSize().height).divide(scale, RoundingMode.HALF_UP);
        if(width.intValue() < 50 || height.intValue() < 50){
            JOptionPane.showMessageDialog(null, Bundle.TooSmallImage());
            frame.setVisible(false);
            frame.dispose();
            return false;
        }

        BufferedImage bi = new BufferedImage(width.intValue()+1, height.intValue()+1, BufferedImage.TYPE_4BYTE_ABGR);
        Graphics2D graphics = bi.createGraphics();
        scene.paint(graphics);
        graphics.dispose();


        ByteArrayOutputStream imageStream = new ByteArrayOutputStream(100*1024);
        try {
            ImageIO.write(bi, "png", imageStream);
        } catch (IOException ex) {
            Exceptions.printStackTrace(ex);
        }

        JSONArray diagram_map = new JSONArray();
        for(Widget w : scene.getMainLayer().getChildren()){
            if(w instanceof EntityWidget){
                Point p = scene.convertSceneToView(w.getLocation());
                BigDecimal posx = new BigDecimal(p.x).divide(scale, RoundingMode.HALF_UP);
                BigDecimal posy = new BigDecimal(p.y).divide(scale, RoundingMode.HALF_UP);
                //diagram_map.put(new Point(posx,posy) w.get)
                JSONObject mapRect = new JSONObject();
                mapRect.put("hash", ((EntityWidget)w).getEntity().hashCode());
                mapRect.put("x", posx.intValue());
                mapRect.put("y", posy);
                mapRect.put("width", w.getClientArea().width);
                mapRect.put("height", w.getClientArea().height);
                diagram_map.put(mapRect);
              }
          }
        for(Widget w : scene.getConnectionLayer().getChildren()){
            if(w instanceof RelationshipWidget){
                LabelWidget label =((RelationshipWidget) w).getLabel();
                RelationshipNode rel =((RelationshipWidget) w).getBean();
                Point p = scene.convertSceneToView(label.getLocation());
                Rectangle labelBounds = label.getBounds();
                
                BigDecimal posx = new BigDecimal(p.x).divide(scale, RoundingMode.HALF_UP);
                BigDecimal posy = new BigDecimal(p.y).divide(scale, RoundingMode.HALF_UP);
                JSONObject mapRect = new JSONObject();
                mapRect.put("hash", rel.hashCode());
                mapRect.put("x", posx.intValue() - labelBounds.x);
                mapRect.put("y", posy.intValue() + labelBounds.y);
                mapRect.put("width", labelBounds.width);
                mapRect.put("height", labelBounds.height);
                diagram_map.put(mapRect);
            }
        }
        report.put("diagram_map", diagram_map);
        
        final String postUrl = getServerURL();
        
        int CONNECTION_TIMEOUT_MS = 10 * 1000; // Timeout in millis.
        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectionRequestTimeout(CONNECTION_TIMEOUT_MS)
            .setConnectTimeout(CONNECTION_TIMEOUT_MS)
            .setSocketTimeout(CONNECTION_TIMEOUT_MS)
            .build();
        final HttpClient httpClient = HttpClientBuilder.create().setConnectionTimeToLive(10, TimeUnit.SECONDS).build();
        final HttpPost post = new HttpPost(postUrl+"/api/erd");
        post.setConfig(requestConfig);

        final HttpEntity entity = MultipartEntityBuilder
                                .create()
                                .addTextBody("document", report.toString(), ContentType.APPLICATION_JSON)
                                .addTextBody("term_code", userSettings.getTermCode())
                                .addTextBody("email", generateMailFromIndex(userSettings.getIndexNo()))
                                .addTextBody("index", String.valueOf(Integer.parseUnsignedInt(userSettings.getIndexNo())))
                                .addBinaryBody("image", imageStream.toByteArray(), ContentType.IMAGE_PNG, "erd.png")
                                .build();
        post.setEntity(entity);
        
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    HttpResponse  response = httpClient.execute(post);
                    StatusLine status;
                    if((status = response.getStatusLine()) != null){
                        if(status.getStatusCode() == 200){
                           JOptionPane.showMessageDialog(null, Bundle.Successful_Sending());
                        } else {
                            String responseString = EntityUtils.toString(response.getEntity(), "UTF-8");
                            JOptionPane.showMessageDialog(null, Bundle.Failure_Sending(responseString));
                        }
                    }
                } catch(Exception exx) {
                    JOptionPane.showMessageDialog(null, "Something went wrong!\nCannot connect to " + postUrl + 
                                                        "\n" + exx.getCause());
                };
                SwingUtilities.invokeLater(new Runnable() {
                    public void run() {
                        frame.setVisible(false);
                        frame.dispose();
                    }
                });
            }
        }).start();
        
        return true;
     }

     private JDialog getLoadingFrame(){
        JDialog frame = new JDialog();
        frame.setUndecorated(true);
        frame.setSize(200,200);
        frame.setBackground(new Color(0, 0, 0, 0));
        Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();
        frame.setLocation(dim.width/2-frame.getSize().width/2, dim.height/2-frame.getSize().height/2);

        JPanel panel = new JPanel();
        panel.setLayout(new BorderLayout());
        panel.setSize(200,200);
        panel.setBackground(new Color(0, 0, 0, 0));
        ImageIcon loadingImage;
        try{
            URL gifURL = this.getClass().getResource("/com/pl/erdc2/erdconstructor2/editor/loader.gif");
            loadingImage = new ImageIcon(gifURL);
        } catch(Exception e){
            return frame;
        }
        JLabel loadingImageLabel = new JLabel(loadingImage);
        panel.add(loadingImageLabel, BorderLayout.CENTER);

        frame.add(panel);
        frame.pack();
        frame.setLocationRelativeTo(null);
        return frame;
     }
     private String getServerURL(){
        Preferences pref = NbPreferences.forModule(ServerInfoPanel.class);
        String postUrl = pref.get("serverAddressPreference", "erd.popi.pl:1996");
        if(postUrl.equals("")) postUrl = "erd.popi.pl:1996";
        if(postUrl.startsWith("http")){
            return postUrl;
        }
        return "http://"+postUrl;
     }
     
     private String generateMailFromIndex(String indexNo){
         return "s" + indexNo + "@student.pg.edu.pl";
     }
}