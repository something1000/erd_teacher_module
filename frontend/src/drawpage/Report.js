import React from 'react';
import BaseComponent, {checkLogsError} from '../BaseComponent'
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import { Redirect } from 'react-router'

import Drawer from './Drawer'
import Toolbar from './Toolbar'
import ButtonConfirm from './ButtonConfirm'
import Button from '@material-ui/core/Button';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Popup from "reactjs-popup";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
require('../config/config.js');

const ApiR = require('./ReportApi.js')
const IMAGES_URL = global.gConfig.backend.address + "/erd_images/"
const sideWidth = 800;

const styles = theme => ({
  workspace :{
    display: 'block',
    //width: '1240px',
    width: `${sideWidth*2+80}px`,
    margin: '0 auto',
    height: '80vh',
    position: 'relative',
    overflow: 'hidden',

  },
  erDiagram : {
    padding: '10px',
    width: `${sideWidth+20}px`,
    height: '100%', // do zmiany na auto
    overflowX: 'auto',
    overflowY: 'scroll',
    backgroundColor: '#eeeeee',
    float: 'left',
    position: 'relative',
  },
  erDescription: {
    padding: '10px',
    width: `${sideWidth+20}px`,
    height: '100%',
    overflowY: 'scroll',
    backgroundColor: '#eaeaea',
    float: 'left',
    position: 'relative',
    boxShadow: 'inset 0px -5px 10px grey, inset 0px 5px 10px grey',
    fontSize: '14px',
    fontFamily: '"Arial"',
    fontStyle: 'normal',
    wordWrap: 'normal',
    textAlign: 'left',
    whiteSpace: 'wrap',
    wordSpacing: '2px',
  },
  test:{
    overflow:'hidden',
    maxWidth: '1800px'
  },

  commonFont: {
    fontFamily: "Arial",
    fontVariant: 'normal',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '18px',
    lineHeight:'30px',
    textRendering: 'geometricPrecision',
  },
  sectionHeader: {
    fontSize: '24px',
    fontWeight: '800',
  },
  normalText:{
    fontSize: '18px',
  },
  preWrapWhiteSpaces:{
    whiteSpace: 'pre-wrap'
  },
  tableWrapper: {
    padding:'20px 0px',
    width:'100%',
  },
  entityTable:{
    borderCollapse:'collapse',
    border: '1px #000 solid',
    width:'100%',
    textAlign: 'center',
  },
  entityTableHeader:{
    fontSize: '24px',
    fontWeight:'bold',
  },
  bold:{
    fontWeight:'bold',
  },
  buttonStudent:{
    height:'50px',
    width:'300px',
    float:'right',
    backgroundColor:'lightgrey',
    marginTop: '5px',
  },
  buttonStudentCnf:{
    height:'50px',
    width:'300px',
    float:'right',
    backgroundColor:'#90ee90',
    color:'rgba(0, 0, 0, 0.87) !important',
    marginTop: '5px',
  },
  buttonShare:{
    height:'50px',
    width:'300px',
    float:'left',
    backgroundColor:'lightgray',
    marginTop:'5px',
  },
  optionsContainer:{
    width:'95%',
    height:'50px',
    margin: '5px auto',
  },
  helpButton: {
    display:'inline-block',
    margin:'0 auto',
    textAlign:'center',
    backgroundColor:'lightgray',
    width:'100px',
    height:'50px',
    marginTop:'-72px',
    marginLeft:'45%',
  },
  paperHelp: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textHelp: {
    fontSize:'16px',
    textAlign:'left',
  },
});

class Report extends BaseComponent{
    constructor(props){
      super(props);
      this.state = {
        visualMode: 'onlyReport', 
        activeTool: 'brush', 
        document: {}, 
        error: false, 
        shared: false, 
        confirmed: false,
        PopHelpVisible: false
      };
    }
    
    componentDidMount() {
      ApiR.getReportByID(this.props.match.params.id, this.initializeReport);
    }

    componentWillUpdate(prevState, d){
    }

    initializeReport = (data) => {
      if(!data){
        this.showError("Error during downloading report")
        this.setState({error: true});
        return;
      }
      const reportData = JSON.parse(data.json_report);
      if(this.props.user != null){
        this.setState({visualMode: "full", activeTool:'brush'})
      } else if(data.shared){
        this.setState({visualMode: "withRating", activeTool:null})
      } else {
        this.setState({visualMode: "onlyReport", activeTool:null})
      }

      this.setState({confirmed: data.confirmed, shared: data.shared,
                     image_name: data.image_src, document: reportData},
                     () => this.setState({initialized: true}));
    }



    buildHTMLReport(){
      const {classes} = this.props;
      var html;
      const document = this.state.document;
      if(!document) return "";
      html =  <div className={classes.preWrapWhiteSpaces}>
                  <h1 className={classes.docHeader}>Project Subject</h1>
                  <span className={classnames(classes.normalText, classes.commonFont)}>
                    {document.project_subject}
                  </span>

                  <h1 className={classes.docHeader}>Project Description</h1>
                  <span className={classnames(classes.normalText, classes.commonFont)}>
                    {document.project_desc}
                  </span>

                  <h1 className={classes.docHeader}>Project Details</h1>
                    <span className={classnames(classes.normalText, classes.commonFont)}>
                      {document.project_details}
                    </span>

                  <h1 className={classes.docHeader}>Entity set description</h1>
                  {document.entities.map(entity =>{
                    return <div key={entity.hash} className={classnames(classes.normalText, classes.commonFont, classes.tableWrapper)}>
                              <a name={entity.hash}/>
                              <table className={classnames(classes.entityTable, "entityTable")}>
                                <tbody>
                                  <tr>
                                    <td className={classes.entityTableHeader} colSpan="4">{entity.name}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan="4">{entity.description}</td>
                                  </tr>
                                  <tr className={classes.bold}>
                                    <td width="18%">Name</td>
                                    <td width="18%">Primary Key</td>
                                    <td width="18%">Type/Domain</td>
                                    <td>Description</td>
                                  </tr>
                                  {entity.columns.map((column, index) => {
                                    return  <tr key={"tr_"+index}>
                                              <td className="entityTable">{column.name}</td>
                                              <td className="entityTable">{column.primary? "YES": "NO"}</td>
                                              <td className="entityTable">{column.type}</td>
                                              <td className="entityTable">{column.description}</td>
                                            </tr>
                                    })
                                  }
                                </tbody>
                              </table>
                          </div>
                  })
                  }

                  <h1 className={classes.docHeader}>Relationships description</h1>
                  <div className={classnames(classes.normalText, classes.commonFont, classes.tableWrapper)}>
                    <table className={classnames(classes.entityTable, "entityTable")}>
                      <tbody>
                        <tr className={classes.bold}>
                          <td>Name</td>
                          <td>Entity 1</td>
                          <td>Entity 2</td>
                          <td width="18%">Cardinality</td>
                          <td>Description</td>
                        </tr>
                        {document.relationships.map((rel, index) =>{
                          return <tr key={"tr_"+index}>
                                    <td>{rel.name}</td>
                                    <td>{rel.entity_1}</td>
                                    <td>{rel.entity_2}</td>
                                    <td>{rel.cardinality}</td>
                                    <td><a name={rel.hash}/>{rel.description}</td>
                                  </tr>
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                  <h1>Relational Database Schema</h1>
                  <span className={classnames(classes.normalText, classes.commonFont)}>
                    {document.schema}
                  </span>
              </div>
      return html;
    }

    buildErdMap(mapName){
      var diagram_regions;
      const document = this.state.document;
      if(!document) return "";
      diagram_regions = <map name={mapName}>
                            {document.diagram_map.map(rect => {
                              return <area key={rect.hash} shape="rect"
                                          coords={rect.x + "," + rect.y + "," +
                                                  eval(rect.x + rect.width) + "," + 
                                                  eval(rect.y + rect.height)}
                                          href={"#"+rect.hash}
                                          alt="Go to description"
                                          onClick={this.openMapElement}>
                                    </area>
                            })
                            }
                        </map>
      return diagram_regions;
    }
    offsetTop(){
      this.dscCnvOffset = this.refs.dscCanvas.getBoundingClientRect();
      return this.dscCnvOffset.top;// + this.refs.erDescription.scrollTop ;//+ (window.pageYOffset || 0);
    }

    offsetLeft(){     
      this.dscCnvOffset = this.refs.dscCanvas.getBoundingClientRect();
      return this.dscCnvOffset.left;// - this.refs.erDescription.scrollLeft ;//+ (window.pageXOffset || 0);
    }

    startDrawingHandler = (event) => {
      this.dscContext.strokeStyle = "red";
      this.dscContext.lineWidth = "5";
      this.dscContext.beginPath();
      this.dscContext.moveTo((event.pageX - this.offsetLeft()), (event.pageY - this.offsetTop()));
      this.old_x = event.x;
      this.old_y = event.y;
      this.started = true;
    };
  
    drawingHandler = (event) => {
      if(this.started){
        this.dscContext.lineTo((event.pageX - this.offsetLeft()), (event.pageY - this.offsetTop()));
        this.dscContext.stroke();
      }
    };

    stopDrawingHandler = (event) => {
      this.started = false;
    };

    setTool = (drawMode) =>{
      this.setState({activeTool: drawMode});
    }

    openMapElement = (event) => { // handler potrzebny bo uzywamy klawisza CTRL 
      event.preventDefault();     // dzieki temu element mapy nie otwiera sie w nowym oknie
      window.location.href = event.target.href;
    }

    buttonStudent (reportID, event) {
      event.preventDefault();
      ApiR.confirmReport(reportID, true,
        () => {
          this.setState({confirmed: true});
          this.showSuccess('Report confirmed')},
        () => {
          this.showWarning('Other report is already confirmed')},
        () => {
          this.showError('Error ocured, try again')},
      );
    }

    buttonShare (reportID, event) {
      event.preventDefault();
      if (this.state.shared === false) {
        ApiR.shareReport(reportID, true, 
          () => {
            this.showSuccess("Report evaluation was shared with student");
            this.setState({shared: true});
          },
          () => {
            this.showError(checkLogsError);
          }
        );
      }
      else {
        ApiR.shareReport(reportID, false,
          () => {
          this.showSuccess("Shared evaluation was revoked");
          this.setState({shared: false});
          },
          () => {
            this.showError(checkLogsError);
          });
      }
    }

    getButtonAndToolbarByState(){
      const {classes, match} = this.props;
      var button, tool;
      if (this.state.visualMode === "full") {
        button = <ButtonConfirm ident={match.params.id} blocked={false}/>;
        tool = <Toolbar callback={this.setTool}/>;  
      }
      else {
        if(this.state.confirmed){
          button = <Button className={classes.buttonStudentCnf} disabled>
                           CONFIRMED
                  </Button>;
        } else {
          button = <Button onClick={this.buttonStudent.bind(this, match.params.id)}
                           className={classes.buttonStudent}>
                           CONFIRM YOUR REPORT
                   </Button>;
        }
        tool = null;
      }
      return {button, tool}
    }

    render(){
      
      if(this.state.error){
        return <Redirect
                to="/404"
                />;
      }
      const {classes, match} = this.props;
      const imageTag =  this.state.initialized ? 
                            <img src={IMAGES_URL+this.state.image_name} useMap="#diagram_regions" /> 
                          : "";
      let {button, tool} = this.getButtonAndToolbarByState();

      return ( this.state.initialized ? 
        <div className={classes.test}>
          <div className={classes.workspace} ref="workspace" >
            <Drawer stylez={classes.erDiagram} 
                    inHtml={imageTag}
                    color="red"
                    tool={this.state.activeTool}
                    userID={match.params.id}
                    side="0"
                    visualMode={this.state.visualMode}/>
      
            <Drawer stylez={classes.erDescription}
                    inHtml={this.state.initialized ? this.buildHTMLReport() : ""}
                    color="red"
                    tool={this.state.activeTool}
                    userID={match.params.id}
                    side="1"
                    visualMode={this.state.visualMode}/>
          
          </div>
          {tool}
          <div className={classes.optionsContainer}>
            {button}
            {this.state.visualMode === "full" ? 
              <Button onClick={this.buttonShare.bind(this, match.params.id)}
                      className={classes.buttonShare}>
                      {this.state.shared === false ? "SHARE EVALUATION" : "UNDO SHARE"}
              </Button>
            : ""}
            {this.state.visualMode === "withRating" ? 
              <ButtonConfirm ident={match.params.id} blocked={true}/>
            : ""}
          </div>
          {this.state.visualMode === "full" ?
            <div>
              <Button onClick = {() => {this.setState({PopHelpVisible: true})}} className={classes.helpButton}>HELP</Button>
              <Popup open={this.state.PopHelpVisible} closeOnDocumentClick onClose={() => {this.setState({PopHelpVisible: false})}} modal>
                <Container component="main" maxWidth="xl">
                  <CssBaseline />
                  <div className={classes.paperHelp}>
                    <Typography component="h1" variant="h4">
                      Help
                    </Typography>
                      <Grid container spacing={2}>
                          <div className={classes.textHelp}>
                            <p>
                              You see a single report. On the left is the ERD diagram.<br />
                              On the right are all descriptions and relational database schema.
                            </p>
                            <p>On the right you can choose one of three tools that are used to mark errors.</p>
                            <p>
                              First option - brush is used to draw red lines. To delete a line, press the gray circle at the beginning of the line.
                            </p>
                            <p>
                              Second option - just comment allows you to insert a pin anywhere. To enter a comment, press the pin.
                              You can choose the pin color (yellow, orange, red, green) with the slider on the right side of the frame.
                              To delete a comment press the "delete" button. 
                              To close an open frame, press "save" or the pin in the upper left corner of the frame.
                            </p>
                            <p>
                              Third option - frame with comment is used to select a larger area of the report. 
                              To enter a comment, press the gray square icon.
                              You can choose the frame color (yellow, orange, red, green) with the slider on the right side of the frame.
                              To delete a frame press the "delete" button. 
                              To close an open frame, press "save" or the gray square icon in the upper left corner of the frame.
                            </p>
                            <p>All lines, pins, frames and comment are saved automatically.</p>
                            <p>
                              Button "EVALUATE AND CONFIRM" in the bottom right corner opens popup with the final rating of the report.
                              There, you can enter final comments, points for individual parts of the report and total numer of points.
                            </p>
                            <p>
                              Button "SHARE EVALUATION" makes the entered comments and points available to the student.
                            </p>
                          </div>
                      </Grid>
                  </div>
                </Container>
              </Popup>
              </div>
            : ""}
          {this.state.initialized ? this.buildErdMap("diagram_regions") : ""}
      </div> : 'loading'
      )
    }
  }

  Report.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(withSnackbar(Report));