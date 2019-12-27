import React from 'react';
import BaseComponent, {checkLogsError} from './BaseComponent.js'
import { withSnackbar } from 'notistack';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import EyeIcon from '@material-ui/icons/RemoveRedEye'
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import classNames from 'classnames';
import { TiArrowSortedDown } from "react-icons/ti";
import { TiArrowSortedUp } from "react-icons/ti";
import Divider from '@material-ui/core/Divider';
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'; // Import 
import Grid from '@material-ui/core/Grid';
import Popup from "reactjs-popup";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

const orderTab = {asc: 'desc', desc: 'asc'};
const ApiR = require('./ReportsApi.js');
const ApiT = require('./TermsApi.js');

const useStyles = theme => ({
  mainContainer: {
    width:'100%',
  },
  optionsContainer: {
    width:'95%',
    height:'50px',
    margin: '0px auto',
  },
  linkStyle: {
    color: 'darkgray',
  },
  text:{
    fontSize:'16px'
  },
  tableContainer: {
    width:'95%',
    margin: '5px auto',
  },
  tableHeader: {
    textAlign:'center',
    backgroundColor:'#e6e6e6',
  },
  tableCell: {
    textAlign:'center',
    padding: '5px',
  },
  tableCellGreen: {
    textAlign:'center',
    padding: '5px',
    backgroundColor: 'lightgreen',
  },
  tableCellRed: {
    textAlign:'center',
    padding: '5px',
    backgroundColor: '#FE2A2A',
  },
  rightOption:{
    float:'right',
    marginLeft:'10px',
  },
  button: {
    margin: '0px 5px',
    height:'45px',
    width:'auto',
    backgroundColor:'lightgray',
  },
  activePage: {
    backgroundColor:'darkgray'
  },
  leftOption:{
    float:'left',
    marginRight:'10px',
  },
  firstOption:{
    marginLeft: '5px',
    fontSize: '20px',
    fontWeight:'bold',
  },
  legend:{
    float:'left',
    margin:'10px 0px 0px 43px',
    fontSize:'20px',
  },
  legendGreen:{
    backgroundColor:'lightgreen',
    padding:'10px',
  },
  legendRed:{
    margin:'10px 0px 0px 0px',
    backgroundColor:'#FE2A2A',
    padding:'10px',
  },
  buttonLeftOption: {
    width: '250px',
    marginRight: '10px',
    marginLeft: '5px',
    backgroundColor: 'lightgray',
  },
  table: {
    width:'100%',
  },
  paperHelp: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  helpButton: {
    height:'40px',
    float:'right',
    width:'100px',
    marginTop:'-3px',
    backgroundColor:'lightgray',
  },
  textHelp: {
    fontSize:'16px',
    textAlign:'left',
  },
});

class Reports extends BaseComponent{
    constructor(props){
      super(props); 
      this.state = {
        headers : ["index", "ver.", "date", "confirmed", "grade", "shared"],
        reports : [],
        order : 'asc',
        category : "index",
        repsOnPage : 5,
        page : 0,
        test : 1,
        terms: [],
        termCode: '',
        deadline: '',
        countAllReports: 0,
        countRatingReports: 0,
        onlyConfirmed: true,
        PopHelpVisible: false
      }
    }

    componentDidMount() {
        ApiR.getReports(this.loadReports);
        ApiT.getActiveTerms(this.loadTerms);
        ApiR.getTermReportsStats(this.props.match.params.id, (stats) => {
          this.setState({countAllReports: stats.all, 
                         countRatingReports: stats.rated});
        });
    }

    componentDidUpdate(prevProps) {
      if (this.props.match.params.id !== prevProps.match.params.id) {
        ApiR.getReports(this.loadReports);
        ApiT.getActiveTerms(this.loadTerms);
        ApiR.getTermReportsStats(this.props.match.params.id, (stats) => {
          this.setState({countAllReports: stats.all, 
                        countRatingReports: stats.rated});
        });
      }
    }

    loadReports = (reps) => {
      if(!reps){
        return;
      }
      var tmp = [];
      reps.forEach((element) => {
        if(element.term_id == this.props.match.params.id){
          if (this.state.onlyConfirmed === false || (this.state.onlyConfirmed === true && element.confirmed === true)){
            tmp.push(element);
          }
        }
      })
      this.setState({reports: tmp})
    }

    loadTerms = (terms) => {
      if(!terms){
        return;
      }
      const t = terms.map( t => {return {label: t.code, value: t.id}});
      const index = terms.findIndex((x)=>x.id == this.props.match.params.id);
      const tCode = terms[index].code;
      const d = !terms[index].deadline ? 'none' : terms[index].deadline;
      this.setState({terms: t, termCode: tCode, deadline: d});
      //this.setState({reports: tmp})
    }

    changeReportTerm = (input)=> {
      confirmAlert({
        title: 'Moving report`s term',
        message: 'Are you sure about moving this report on term:' + input.label,
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              ApiR.moveReport(input.id, input.value, 
                () => {
                  this.showSuccess("Report successfully moved to another term.")
                  this.setState({reports: this.state.reports.filter(val => val.id != input.id)});},
                () => this.showError(checkLogsError)
              );
            }
          },
          {
            label: 'No'
          }
        ]
      });
    }

    deleteReport (id) {
      confirmAlert({
        title: 'Removing report',
        message: 'Are you sure about removing this report?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              ApiR.deleteReport(id,
                () => {
                this.showSuccess("Report has been deleted.")
                this.setState({reports: this.state.reports.filter(val => val.id != id)});},
                () => this.showError(checkLogsError));
            }
          },
          {label: 'No'}
        ]
      });
    }

    sortBy(key)
    {
      var newKey;
      switch (key) {
        case this.state.headers[0]:
          newKey = "student_id";
          break;
        case this.state.headers[1]:
            newKey = "version";
            break;
        case this.state.headers[2]:
          newKey = "senddate";
          break;
        case this.state.headers[3]:
          newKey = "confirmed";
          break;
        case this.state.headers[4]:
          newKey = "rating";
          break;
        case this.state.headers[5]:
          newKey = "shared";
          break;
        default:
          newKey = "";
      }
      var myData;
      var newOrder = orderTab[this.state.order];

      this.setState({})
      myData = [...this.state.reports]
      .sort((a, b) => {
        if (a[newKey] < b[newKey]) { if(newOrder === "asc") return -1; else return 1; }
        if (a[newKey] > b[newKey]) { if(newOrder === "asc") return 1; else return -1; }
        return 0;
      });
      this.setState({reports: myData, order : newOrder, category: key});
    }

    formatDateTime(dateString) {
    //   var date = dateString.split(" ");
    //   date[1] = date[1].substr(0, date[1].length-5);
    //   return (date[0] + " " + date[1]);
      return dateString;
    }

    formatOnlyDate(dateString) {
      var date = dateString.split(" ");
      return date[0];
    }

    weeksLate(dateString) {
      if (this.state.deadline === null || this.state.deadline === "none")
        return "-";

      if (this.formatOnlyDate(dateString) <= this.state.deadline) // praca wysłana w terminie
        return 0;

      var late = Date.parse(dateString) - Date.parse(this.state.deadline); // w milisekundach
      late = (((late / 1000) / 60) / 60) / 24;  // w dniach
      late = late - 1;  // pozwalamy do końca dnia wysłać
      late = late / 7;  // tygodnie spoźnienia
      return parseInt(late, 10) + 1;
    }

    makeSelectTermOptions = (id) => {
      const T = this.state.terms.map(x => {
        return {label: x.label, value: x.value, id: id}
      });
      return T;
    }

    createBody()
    {
      const {classes} = this.props;
      let table = [];
      for (let i = 0; i < this.state.repsOnPage; i++) {
        if(this.state.page * this.state.repsOnPage + i >= this.state.reports.length)
          break;
        const element = this.state.reports[this.state.page * this.state.repsOnPage + i];
        let columns = [];
        const link = '/report/' + element.id;
        columns.push(<TableCell key={"index_"+i} className={classes.tableCell}>{element.student_id}</TableCell>);
        columns.push(<TableCell key={"ver_"+i} className={classes.tableCell}>{element.version}</TableCell>);
        if (this.state.deadline === null || this.state.deadline === "none")
          columns.push(<TableCell key={"send_"+i} className={classes.tableCell}>{this.formatDateTime(element.senddate)}</TableCell>);
        else {
          if (this.formatOnlyDate(element.senddate) <= this.state.deadline)
            columns.push(<TableCell key={"send_"+i} className={classes.tableCellGreen}>{this.formatDateTime(element.senddate)}</TableCell>);
          else
            columns.push(<TableCell key={"send_"+i} className={classes.tableCellRed}>{this.formatDateTime(element.senddate)}</TableCell>);
        }
        columns.push(<TableCell key={"cnf_"+i} className={classes.tableCell}>{element.confirmed ? "YES" : "NO"}</TableCell>);
        columns.push(<TableCell key={"rating_"+i} className={classes.tableCell}>{element.rate_done ? element.rating : '-'}</TableCell>);
        columns.push(<TableCell key={"shared_"+i} className={classes.tableCell}>{element.shared ? "YES" : "NO"}</TableCell>);
        columns.push(<TableCell key={"late_"+i} className={classes.tableCell}>{this.weeksLate(element.senddate).toString()}</TableCell>);
        columns.push(<TableCell key={"move_"+i} className={classes.tableCell}>
          <Select
              isSearchable={true}
              options={this.makeSelectTermOptions(element.id)}
              fullWidth
              value={null}
              placeholder="Move"
              onChange={this.changeReportTerm}
            />
        </TableCell>);
        columns.push(<TableCell key={"del_"+i} className={classes.tableCell}><Button onClick={() => this.deleteReport(element.id)}><DeleteIcon fontSize="large"/></Button></TableCell>);
        columns.push(<TableCell key={"see_"+i} className={classes.tableCell}><Link className={classes.linkStyle} to={link}><EyeIcon fontSize="large"/></Link></TableCell>);

        table.push(<TableRow key={"row_"+i}/*onClick={() => this.props.history.push(link)}*/>{columns}</TableRow>);
      }
      return table;
    }

    generatePages()
    {
      const { classes } = this.props;
      let buttons = []
      for (let index = 0; index < this.state.reports.length/this.state.repsOnPage; index++) {
        const active = this.state.page === index ? classes.activePage : '';
        buttons.push(<Button key={index} className={classNames(classes.button, active)} onClick={() => this.changePage(index)}>{index+1}</Button>)
      }
      return buttons;
    }

    changePage(p)
    {
      this.setState({page : p});
    }

    render(){
      const { classes } = this.props;
      const allReports = this.state.countAllReports;
      const ratingReports = this.state.countRatingReports;
      const tCode = this.state.termCode;
      const dLine = this.state.deadline;
        return (
          <div className={classes.mainContainer}>
            <div className={classes.optionsContainer}>
              <Grid container>
                <Grid item xs={3}>
                  <div className={classes.firstOption}>
                    Term: {tCode}
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className={classes.firstOption}>
                    Deadline: {dLine}
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className={classes.firstOption}>
                    Evaluated: {ratingReports == null ? "0" : ratingReports + "/" + allReports}
                  </div>
                </Grid>
                <Grid item xs={3}>
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
                              <p>You see reports in term management table.</p>
                              <p>At the top of the page is term code, deadline and number of rating reports.</p>
                              <p>
                                Button "SHOW CONFIRMED ONLY" shows only rated reports in the table.
                                Button "SHOW ALL" shows all reports in the table.
                              </p>
                              <p>
                                The numbers on the left (1, 2, 3...) allow you to change the page.
                                The numbers on the right (5, 10, 15, 20) allow you to choose how many reports will be on one page.
                              </p>
                              <p>
                                If you click on one of the first six table headers, it will sort the table rows by the selected column.
                                Second click will sort in reverse order.
                              </p>
                              <p>
                                The background color in the date column can be green or red.
                                Green means the report is sent on time. Red means the report is late.
                              </p>
                              <p>If you want to move report to another term you have to select term code from select list in "MOVE" column.</p>
                              <p>
                                If you want to delete report you have to click trash icon <DeleteIcon /> in the selected row and then confirm this operation.
                              </p>
                              <p>
                                If you want to see and start rating the report you have to click eye icon <EyeIcon /> in the selected row.
                              </p>
                            </div>
                        </Grid>
                    </div>
                  </Container>
                </Popup>
                </Grid>
              </Grid>
            </div>
            <div className={classes.optionsContainer}>
                <Button onClick={() => {ApiR.getReports(this.loadReports); this.setState({onlyConfirmed: true})}} className={classes.buttonLeftOption}>SHOW CONFIRMED ONLY</Button>
                <Button onClick={() => {ApiR.getReports(this.loadReports); this.setState({onlyConfirmed: false})}} className={classes.buttonLeftOption}>SHOW ALL</Button>
            </div>
            <div className={classes.optionsContainer}>
              <div className={classes.leftOption}>
                {this.generatePages(classes.button)}
              </div>
              <div className={classes.rightOption}>
                <span className={classes.text}>On page: </span>
                <Button className={classNames(classes.button)} onClick={() => {this.setState({repsOnPage : 5, page: 0});}}>{5}</Button>
                <Button className={classNames(classes.button)}  onClick={() => {this.setState({repsOnPage : 10, page: 0});}}>{10}</Button>
                <Button className={classNames(classes.button)}  onClick={() => {this.setState({repsOnPage : 15, page: 0});}}>{15}</Button>
                <Button className={classNames(classes.button)}  onClick={() => {this.setState({repsOnPage : 20, page: 0});}}>{20}</Button>
              </div>
            </div>
            <Divider />

          <div className={classes.tableContainer}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                {this.state.headers.map((header, index) => (
                  <TableCell key={index} className={classes.tableHeader}><Button onClick={() => this.sortBy(header)}><span>{header}</span>
                  {this.state.category === header ? (
                    this.state.order === "asc" ? (
                      <TiArrowSortedUp />
                    ) : (
                      <TiArrowSortedDown />
                    )
                  ) : null}</Button></TableCell>))}
                  <TableCell className={classes.tableHeader}><Button>LATE</Button></TableCell>
                  <TableCell className={classes.tableHeader}><Button>MOVE</Button></TableCell>
                  <TableCell className={classes.tableHeader}><Button>DELETE</Button></TableCell>
                  <TableCell className={classes.tableHeader}><Button>SEE</Button></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {this.createBody()}
              </TableBody>
            </Table>
            {this.generatePages()}
            </div>
            <div className={classes.legend}>
              <div className={classes.legendGreen}>
                  Report sent in deadline
              </div>
              <div className={classes.legendRed}>
                  Report is late
              </div>
            </div>
          </div>
        );
    }
  }

  Reports.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default withStyles(useStyles)(withSnackbar(Reports));