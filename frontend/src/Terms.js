import React from 'react';
import BaseComponent, {checkLogsError} from './BaseComponent.js'
import { withSnackbar } from 'notistack';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Select from 'react-select';

import Popup from "reactjs-popup";
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import EventIcon from '@material-ui/icons/Event';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';

import { TiArrowSortedDown } from "react-icons/ti";
import { TiArrowSortedUp } from "react-icons/ti";

const ApiTerms = require('./TermsApi.js');
const ApiTeacher = require('./TeachersApi.js');

const orderTab = {asc: 'desc', desc: 'asc'};
const activeTab = [
  { label: "Active", value: true }, { label: "Inactive", value: false },
];
const dayTab = [
  {label: "Monday", value: "Monday"},
  {label: "Tuesday", value: "Tuesday"},
  {label: "Wednesday", value: "Wednesday"},
  {label: "Thursday", value: "Thursday"},
  {label: "Friday", value: "Friday"},
  {label: "Saturday", value: "Saturday"},
  {label: "Sunday", value: "Sunday"},
];
const currentYear = new Date().getFullYear();

const useStyles = theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    height: '80px',
  },
  mainContainer: {
    width:'100%',
  },
  optionsContainer: {
    width:'95%',
    height:'50px',
    margin: '5px auto',
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
  },
  buttonRightOption: {
    height:'50px',
    width:'300px',
    float:'right',
    marginLeft:'10px',
    backgroundColor:'lightgray',
  },
  buttonLeftOption: {
    height:'50px',
    width:'300px',
    float:'left',
    marginRight:'10px',
    backgroundColor:'lightgray',
  },
  table: {
    width:'100%',
  },
  leftOption: {
    float:'left',
    marginLeft: '5px',
    fontSize: '20px',
    fontWeight:'bold',
  },
  paperHelp: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  helpButton: {
    height:'80%',
    float:'right',
    width:'100px',
    marginTop:'-8px',
    backgroundColor:'lightgray',
  },
  textHelp: {
    fontSize:'16px',
    textAlign:'left',
  },
});

class Terms extends BaseComponent{
    constructor(props){
      super(props); 
      this.teacherTab = [];
      this.termEdit = null;
      this.headers = ["code", "day", "hour", "year", "active", "teacher", "deadline"];
      this.state = {
        terms : [],
        order : 'desc',
        category : "stan",
        PopDodajVisible: false,
        PopHelpVisible: false,
        onlyActive: true
      }
      this.refDaySelect = React.createRef();
      this.refTeacherSelect =  React.createRef();
      this.refActiveSelect = React.createRef();

      this.refreshNavBar = props.refreshNavBar;
    }

    componentDidMount(){
      ApiTerms.getTerms(this.loadTerms);
      ApiTeacher.getTeachersLogins(this.loadTeachersLogins);
    }

    compareTeachers(a,b) {
      if (a.label < b.label)
        return -1;
      if (a.label > b.label)
        return 1;
      return 0;
    }

    loadTeachersLogins = (data) => {
      if(!data){
        return;
      }
      data.forEach((element) => {
        this.teacherTab.push({label: element.login, value: element.login});
      })
      this.teacherTab.sort(this.compareTeachers);
    }

    sortBy(key)
    {
      var newKey;
      newKey = key;
      var myData;
      var newOrder = orderTab[this.state.order];
      this.setState({})
      myData = [...this.state.terms]
      .sort((a, b) => {
        if (a[newKey] < b[newKey]) { if(newOrder === "asc") return -1; else return 1; }
        if (a[newKey] > b[newKey]) { if(newOrder === "asc") return 1; else return -1; }
        return 0;
      });
      this.setState({terms: myData, order : newOrder, category: key});
    }

    loadTerms = (data) => {
      if(!data){
        return;
      }
      var term = [];
      data.forEach((element) => {
        term.push(element);
      })
      this.setState({terms: term})
    }

    closeTerm(element, event) {
      event.preventDefault();

      var newTerms = this.state.terms.slice();
      var index = newTerms.findIndex((x)=>x.id === element.id);
      newTerms[index].active = false;

      this.setState({terms: newTerms});
      ApiTerms.updateTerm(element.id, newTerms[index],
        () => {
          this.refreshNavBar();
          this.showSuccess("Term successfully modified")},
        () => this.showError(checkLogsError)
      );
    }

    submitDodaj(event) {
      event.preventDefault();
      
      const form = document.getElementById('formDodaj');
      var term = {code: form.code.value,
                  day: form.day.value,
                  hour: null,
                  year: form.year.value,
                  active: form.active.value === 'true',
                  teacher: form.teacher.value,
                  deadline: form.deadline.value
                  };
      if (form.hourStart.value === "" || form.hourEnd.value === "") {
        this.showError("There are empty fields!");
        return;
      }
      if (form.hourStart.value.length > 1 && (form.hourStart.value[0] === '1' || form.hourStart.value[0] === '2'))
        term.hour = form.hourStart.value.slice(0,2);
      else
        term.hour = form.hourStart.value.slice(0,1);
      if (form.hourEnd.value.length > 1 && (form.hourEnd.value[0] === '1' || form.hourEnd.value[0] === '2'))
        term.hour = term.hour + "-" + form.hourEnd.value.slice(0,2);
      else
        term.hour = term.hour + "-" + form.hourEnd.value.slice(0,1);
                  
      if (term.code === "" || term.day === "" || term.year === "" || term.active === "" || term.teacher === "") {
        this.showError("There are empty fields!");
        return;
      }

      // OBSŁUGA MODYFIKACJI TERMINU
      var but = document.getElementById('buttonDodaj');
      if (but.textContent === "MODIFY") {
        var newTerms = this.state.terms.slice();
        var index = newTerms.findIndex((x)=>x.id === this.termEdit.id);
        newTerms[index].code = term.code;
        newTerms[index].day = term.day;
        newTerms[index].hour = term.hour;
        newTerms[index].year = term.year;
        newTerms[index].active = term.active;
        newTerms[index].teacher = term.teacher;
        newTerms[index].deadline = term.deadline;

        this.setState({terms: newTerms, PopDodajVisible: false});
        ApiTerms.updateTerm(this.termEdit.id, term,
          () => {
            this.refreshNavBar();
            this.showSuccess("Term successfully modified")},
          () => this.showError(checkLogsError)
        );
        return
      }

      term.code = form.code.value;
      
      this.setState({PopDodajVisible: false});
      ApiTerms.postTerm(term,
        () => {
          ApiTerms.getTerms(this.loadTerms);
          this.showSuccess("Term successfully added")},
        () => this.showError(checkLogsError));
    }

    deleteTerm(element, event) {
      var newTerms = this.state.terms.slice();
      var removeIndex = newTerms.findIndex((x)=>x.id === element.id);
      newTerms.splice(removeIndex, 1);
      this.setState({terms: newTerms});
      ApiTerms.deleteTerm(element.id,
        () => this.showSuccess("Term successfully removed"),
        () => this.showError(checkLogsError));
    }

    deleteAlert (element, event) {
      confirmAlert({
        title: 'DELETE CONFIRMATION',
        message: 'Are you sure about removing term: ' + element.code,
        buttons: [
          {
            label: 'Yes',
            onClick: this.deleteTerm.bind(this, element)
          },
          {
            label: 'No'
          }
        ]
      });
    }

    editTerm (element, event) {
      event.preventDefault();
      this.setState({PopDodajVisible: true});

      ApiTerms.getTermByID(element.id, (term) => {
        this.termEdit = term;
        var form = document.getElementById('formDodaj');

        const day = dayTab.find(d => d.value === term.day);
        this.refDaySelect.current.select.setValue(day);

        const activeState = activeTab.find(d => d.value === term.active);
        this.refActiveSelect.current.select.setValue(activeState);

        const teacher = this.teacherTab.find(d => d.value === term.teacher);
        this.refTeacherSelect.current.select.setValue(teacher);

        const hour = term.hour.split("-");
        form.hourStart.value = hour[0];
        form.hourEnd.value = hour[1];
        form.hourEnd.focus();
        form.year.value = term.year;
        form.year.focus();
        //form.code.disabled = false;   // zależy czy pozwalamy zmieniać kod terminu
        form.code.value = term.code;
        form.code.focus();
        form.deadline.value = term.deadline;
        form.hourStart.focus();
        form.buttonDodaj.textContent = "MODIFY";
        var headerForm = document.getElementById('headerForm');
        headerForm.textContent = "Modify term";
      });
    }

    makeTermCode(event) {
      const form = document.getElementById('formDodaj');
      if (form.day.value === "" || form.hourStart.value === "" || form.year.value === "") {
        return;
      }
      else {
        var code = "";
        if (form.hourStart.value.length > 1 && (form.hourStart.value[0] === '1' || form.hourStart.value[0] === '2'))  // bierzemy 2 cyfry z godziny do kodu terminu
          code = form.year.value + "_" + form.day.value.slice(0,3) + "_" + form.hourStart.value.slice(0,2);
        else  //  bierzemy 1 cyfrę z godziny do kodu terminu (np. godzina 7, 8, 9)
          code = form.year.value + "_" + form.day.value.slice(0,3) + "_" + form.hourStart.value.slice(0,1);
        

        // SPRAWDZANIE CZY ISTNIEJE JUŻ TAKI KOD I GENEROWANIE UNIKALNEGO
        var j = 2;
        var codeTmp = code;

        for (let i = 0; i < this.state.terms.length; i++) {
          const element = this.state.terms[i];
          if (codeTmp === element.code) {
            codeTmp = code + "_" + j;
            j++;
            i = -1;
          }
        }
        form.code.value = codeTmp;
      }
    }

    createBody()
    {
      const {classes} = this.props;
      let table = [];

      for (let i = 0; i < this.state.terms.length; i++) {
        const element = this.state.terms[i];
        let columns = [];

        if (this.state.onlyActive && element.active !== true) {
          continue;
        }

        columns.push(<TableCell key={element.code} className={classes.tableCell}>{element.code}</TableCell>);
        columns.push(<TableCell key={"day_" + i} className={classes.tableCell}>{element.day}</TableCell>);
        columns.push(<TableCell key={"hour_" + i} className={classes.tableCell}>{element.hour}</TableCell>);
        columns.push(<TableCell key={"year_" + i} className={classes.tableCell}>{element.year}</TableCell>);
        columns.push(<TableCell key={"active_" + i} className={classes.tableCell}>{element.active ? "Active" : "Inactive"}</TableCell>);
        columns.push(<TableCell key={"teacher_" + i} className={classes.tableCell}>{element.teacher}</TableCell>);
        columns.push(<TableCell key={"deadline_" + i} className={classes.tableCell}>{element.deadline}</TableCell>);
        columns.push(<TableCell key={"btn1_" + i} className={classes.tableCell} width='100px'><Button onClick={this.editTerm.bind(this, element)}><EditIcon /></Button></TableCell>);
        columns.push(<TableCell key={"btn2_" + i} className={classes.tableCell} width='100px'><Button onClick={this.deleteAlert.bind(this, element)}><DeleteIcon /></Button></TableCell>);
        if (element.active) {
          columns.push(<TableCell key={"btn3_" + i} className={classes.tableCell} width='100px'><Button onClick={this.closeTerm.bind(this, element)}>CLOSE</Button></TableCell>);
        }

        table.push(<TableRow key={"row_" + i}>{columns}</TableRow>);
      }
      return table;
    }

    render(){
      const { classes } = this.props;
        return (
          <div className={classes.mainContainer}>
            <div className={classes.optionsContainer}>
            <div className={classes.leftOption}>
                Terms
              </div>
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
                              <p>You see terms management table.</p>
                              <p>
                                Button "SHOW ACTIVE ONLY" shows only terms in the table whose status is active.
                                Button "SHOW ALL" shows all terms in the table whose status is active or inactive.
                              </p>
                              <p>
                                If you click on one of the first seven table headers, it will sort the table rows by the selected column.
                                Second click will sort in reverse order.
                              </p>
                              <p>
                                If you want to add a new term you have to click the "ADD NEW TERM" button in the upper right corner.
                                All fields except the deadline in the new popup are required. The term code is generated automatically.
                              </p>
                              <p>If you want to edit term you have to click pencil icon <EditIcon /> in the selected row.</p>
                              <p>
                                If you want to delete term you have to click trash icon <DeleteIcon /> in the selected row and then confirm this operation.
                                If you delete term then all reports from that term will also be deleted.
                              </p>
                              <p>The "CLOSE" button changes the status of the term from active to inactive.</p>
                            </div>
                        </Grid>
                    </div>
                  </Container>
                </Popup>
            </div>
            <div className={classes.optionsContainer}>
              <Button onClick={() => {this.setState({onlyActive: true})}} className={classes.buttonLeftOption}>SHOW ACTIVE ONLY</Button>
              <Button onClick={() => {this.setState({onlyActive: false})}} className={classes.buttonLeftOption}>SHOW ALL</Button>
              <Button onClick={() => {this.setState({PopDodajVisible: true})}} className={classes.buttonRightOption}>ADD NEW TERM</Button>
              <Popup open={this.state.PopDodajVisible} closeOnDocumentClick onClose={() => {this.setState({PopDodajVisible: false})}} modal>
              <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                      <EventIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" id="headerForm" name="headerForm">
                      Add term
                    </Typography>
                    <form className={classes.form} id="formDodaj" noValidate>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="hourStart"
                            label="Start time"
                            name="hourStart"
                            autoComplete="hourStart"
                            onChange={this.makeTermCode.bind(this)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="hourEnd"
                            label="End time"
                            name="hourEnd"
                            autoComplete="hourEnd"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Select
                            options={dayTab}
                            required
                            ref={this.refDaySelect}
                            fullWidth
                            id="day"
                            placeholder="Day"
                            name="day"
                            onInputChange={this.makeTermCode.bind(this)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            disabled={false}
                            id="year"
                            label="Year"
                            name="year"
                            autoComplete="year"
                            defaultValue={currentYear}
                            onChange={this.makeTermCode.bind(this)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Select
                            options={activeTab}
                            ref={this.refActiveSelect}
                            required
                            fullWidth
                            id="active"
                            placeholder="Active"
                            name="active"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            variant="outlined"
                            required
                            disabled
                            fullWidth
                            id="code"
                            label="Code"
                            name="code"
                            autoComplete="code"
                            defaultValue="auto generated"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Select
                            options={this.teacherTab}
                            ref={this.refTeacherSelect}
                            required
                            fullWidth
                            id="teacher"
                            placeholder="Teacher"
                            name="teacher"
                          />
                        </Grid >
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id="deadline"
                            name="deadline"
                            fullWidth
                            required
                            label="Deadline"
                            type="date"
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        id="buttonDodaj"
                        name="buttonDodaj"
                        onClick={this.submitDodaj.bind(this)}
                        className={classes.submit}
                      >
                        SUBMIT
                      </Button>
                    </form>
                  </div>
                </Container>
              </Popup>
            </div>
            <Divider />
            <div className={classes.tableContainer}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    {this.headers.map((header) => (
                      <TableCell key={header} className={classes.tableHeader}><Button onClick={() => this.sortBy(header)}><span>{header}</span>
                      {this.state.category === header ? (
                        this.state.order === "asc" ? (
                          <TiArrowSortedUp />
                        ) : (
                          <TiArrowSortedDown />
                        )
                      ) : null}</Button></TableCell>))}
                      <TableCell className={classes.tableHeader}><Button>EDIT</Button></TableCell>
                      <TableCell className={classes.tableHeader}><Button>DELETE</Button></TableCell>
                      <TableCell className={classes.tableHeader}><Button>CLOSE</Button></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {this.createBody()}
                </TableBody>
              </Table>
            </div>
          </div>
        );
    }
  }
  Terms.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default withStyles(useStyles)(withSnackbar(Terms));