import React from 'react';
import BaseComponent, {checkLogsError} from './BaseComponent.js'
import { withSnackbar } from 'notistack';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import Popup from "reactjs-popup";
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import PersonIcon from '@material-ui/icons/PersonAdd';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const ApiT = require('./TeachersApi.js')

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
    whiteSpace: 'pre',
  },
  optionsContainer: {
    width:'95%',
    height:'50px',
    margin: '5px auto',
  },
  buttonNew: {
    height:'100%',
    float:'right',
    width:'300px',
    backgroundColor:'lightgray',
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
  table: {
    width:'100%',
  },
  leftOption: {
    float:'left',
    marginLeft: '5px',
    fontSize: '20px',
    fontWeight:'bold',
  },
});


class Teachers extends BaseComponent{
    constructor(props){
      super(props); 
      this.headers = ["Name", "Surname", "Login", "Terms"];
      this.state = {
        PopDodajVisible: false,
        PopHelpVisible: false,
        teachers : [],
      }
    }

    componentDidMount() {
      ApiT.getTeachers(this.loadTeachers);
    }

    loadTeachers = (data) => {
      if(!data){
        this.showError(checkLogsError);
        return;
      }
      var teacher = [];
      data.forEach((element) => {
        teacher.push(element);
      })
      this.setState({teachers: teacher})
    }

    createBody()
    {
      const {classes} = this.props;
      let table = [];

      for (let i = 0; i < this.state.teachers.length; i++) {
        const element = this.state.teachers[i];
        let columns = [];

        columns.push(<TableCell key={"firstname_"+i} className={classes.tableCell}>{element.firstname}</TableCell>);
        columns.push(<TableCell key={"lastname_"+i} className={classes.tableCell}>{element.lastname}</TableCell>);
        columns.push(<TableCell key={"login"+i} className={classes.tableCell}>{element.login}</TableCell>);
        columns.push(<TableCell key={"term_"+i} className={classes.tableCell}>{element.term}</TableCell>);
        columns.push(<TableCell key={"btn1_"+i} className={classes.tableCell} width='100px'><Button onClick={this.editTeacher.bind(this, element)}><EditIcon /></Button></TableCell>);
        columns.push(<TableCell key={"btn2_"+i} className={classes.tableCell} width='100px'><Button onClick={this.deleteAlert.bind(this, element)}><DeleteIcon /></Button></TableCell>);

        table.push(<TableRow key={"row_"+i}>{columns}</TableRow>);
      }
      return table;
    }

    deleteTeacher(element, event) {
      var newTeachers = this.state.teachers.slice();
      var removeIndex = newTeachers.findIndex((x)=>x.login === element.login);
      newTeachers.splice(removeIndex, 1);
      this.setState({teachers: newTeachers});
      ApiT.deleteTeacher(element.login,
        () => this.showSuccess("Teacher successfully removed"),
        () => this.showError(checkLogsError));
    }

    deleteAlert (element, event) {
      confirmAlert({
        title: 'DELETE CONFIRMATION',
        message: 'Are you sure about removing that teacher: ' + element.login,
        buttons: [
          {
            label: 'Yes',
            onClick: this.deleteTeacher.bind(this, element)
          },
          {
            label: 'No'
          }
        ]
      });
    }

    async editTeacher (element, event) {
      event.preventDefault();
      await this.setState({PopDodajVisible: true});

      await ApiT.getTeacherByLogin(element.login, (teacher) => {
        if(!teacher) return;
        var form = document.getElementById('formDodaj');
        form.firstName.value = teacher.firstname;
        form.lastName.value = teacher.lastname;
        form.lastName.focus();
        form.login.value = teacher.login;
        form.login.focus();
        form.login.disabled = true;
        form.password.value = null;
        form.password.focus();
        form.firstName.focus();
        form.buttonDodaj.textContent = "MODIFY";
        var headerForm = document.getElementById('headerForm');
        headerForm.textContent = "Modify teacher's date";
      });
    }

    submitDodaj(event) {
      event.preventDefault();
      
      // OBSŁUGA MODYFIKACJI DANYCH PROWADZĄCEGO
      var but = document.getElementById('buttonDodaj');
      if (but.textContent === "MODIFY") {
        const form = document.getElementById('formDodaj');
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const login = form.login.value;
        const password = form.password.value;

        if (firstName === "" || lastName === "" || login === "") {
          this.showError("There are empty fields!");
          return;
        }

        var newTeachers = this.state.teachers.slice();
        var removeIndex = newTeachers.findIndex((x)=>x.login === login);
        newTeachers[removeIndex].firstname = firstName;
        newTeachers[removeIndex].lastname = lastName;
        newTeachers[removeIndex].password = password;

        this.setState({teachers: newTeachers, PopDodajVisible: false});
        ApiT.updateTeacher(login, password, firstName, lastName,
          () => this.showSuccess("Teacher's data successfully modified"),
          () => this.showError(checkLogsError));
        return
      }

      // OBSŁUGA DODAWANIA NOWEGO PROWADZĄCEGO
      const form = document.getElementById('formDodaj');
      const login = form.login.value;
      
      ApiT.getTeacherByLogin(login, (teacher) => {
        if (teacher && form.login.value !== ""){
          this.showError("Teacher with login: " + teacher.login + " alredy exists");
          return;
        }
  
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const login = form.login.value;
        const password = form.password.value;
  
        if (firstName === "" || lastName === "" || login === "" || password === "") {
          this.showError("There are empty fields!");
          return;
        }
  
        this.setState({teachers: this.state.teachers.concat({firstname: firstName, lastname: lastName, login: login, term: ""}), PopDodajVisible: false});
        ApiT.postTeacher(login, password, firstName, lastName,
          () => this.showSuccess("Teacher successfully added"),
          () => this.showError(checkLogsError));
      });
      return
    }

    render(){
      const { classes } = this.props;
        return (
          <div className={classes.mainContainer}>
            <div className={classes.optionsContainer}>
              <div className={classes.leftOption}>
                Teachers
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
                              <p>You see teacher management table.</p>
                              <p>
                                If you want to add a new teacher you have to click the "ADD NEW TEACHER" button in the upper right corner.
                                All fields in the new popup are required.
                              </p>
                              <p>If you want to edit teacher you have to click pencil icon <EditIcon /> in the selected row.</p>
                              <p>If you want to delete teacher you have to click trash icon <DeleteIcon /> in the selected row and then confirm this operation.</p>
                            </div>
                        </Grid>
                    </div>
                  </Container>
                </Popup>
            </div>
            <div className={classes.optionsContainer}>
                <Button onClick = {() => {this.setState({PopDodajVisible: true})}} className={classes.buttonNew}>ADD NEW TEACHER</Button>
                <Popup open={this.state.PopDodajVisible} closeOnDocumentClick onClose={() => {this.setState({PopDodajVisible: false})}} modal>
                  <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div className={classes.paper}>
                      <Avatar className={classes.avatar}>
                        <PersonIcon />
                      </Avatar>
                      <Typography component="h1" variant="h5" id="headerForm" name="headerForm">
                        Add new teacher
                      </Typography>
                      <form className={classes.form} id="formDodaj" noValidate>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              autoComplete="fname"
                              name="firstName"
                              variant="outlined"
                              required
                              fullWidth
                              id="firstName"
                              label="Name"
                              autoFocus
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              variant="outlined"
                              required
                              fullWidth
                              id="lastName"
                              label="Surname"
                              name="lastName"
                              autoComplete="lname"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              variant="outlined"
                              required
                              fullWidth
                              id="login"
                              label="Login"
                              name="login"
                              autoComplete="login"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              variant="outlined"
                              required
                              fullWidth
                              name="password"
                              label="Password"
                              type="password"
                              id="password"
                              autoComplete="current-password"
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
                      <TableCell key={header} className={classes.tableHeader}>
                        <Button>{header}</Button>
                      </TableCell>
                      ))}
                      <TableCell className={classes.tableHeader}><Button>EDIT</Button></TableCell>
                      <TableCell className={classes.tableHeader}><Button>DELETE</Button></TableCell>
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
  Teachers.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default withStyles(useStyles)(withSnackbar(Teachers));