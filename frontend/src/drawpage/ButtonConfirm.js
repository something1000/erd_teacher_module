import React from 'react';
import Button from '@material-ui/core/Button';
import BaseComponent, {checkLogsError} from '../BaseComponent'
import { withSnackbar } from 'notistack';

import Popup from "reactjs-popup";
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import DoneIcon from '@material-ui/icons/Done';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'
import { InputLabel } from '@material-ui/core';

const ApiR = require('./ReportApi.js');
const ApiS = require('../SettingsApi.js');

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
  buttonConfirm: {
    margin: '5px',
    height:'50px',
    width:'300px',
    float:'right',
    backgroundColor:'lightgray',
  },
  table: {
    width:'100%',
  },
  labelStyle: {
    fontSize:'20px',
    fontWeight:'bold'
  }
});

class ButtonConfirm extends BaseComponent{
    constructor(props){
      super(props);
      this.state = {
        PopDodajVisible: false,
        settings: {default_note: '', max_points: 40},
      }
      this.refNotes = null;
      this.refRating = null;
    }

    componentDidMount(){
      ApiS.getSettings((settings) => {
          this.setState({settings: settings})
      });
    }

    confirmRating(event) {
        event.preventDefault();
        const notes = this.refNotes.value;
        const rating = parseInt(this.refRating.value);
        const maxPoints = parseInt(this.state.settings.max_points);
        if(!(rating <= maxPoints && rating >= 0)){
          this.showError("Points number out of range")
          return;
        }
        if (notes === "" || rating === "") {
            this.showError("Nie wypełniono wszystkich pól!");
            return;
        }
        ApiR.updateReport(this.props.ident, notes, rating, true,
          () => {
              this.showSuccess("Report marked as done")
              this.setState({PopDodajVisible: false, rate_done: true});
          },
          () => this.showError(checkLogsError))
    }

    unconfirmRating(event) {
      event.preventDefault();

      ApiR.undoneReport(this.props.ident,
        () => {
            this.showSuccess("Report marked back as to do")
            this.setState({rate_done: false});
        },
        () => this.showError(checkLogsError))
  }

    saveReportNotes(event) {
      event.preventDefault();
      var notes = this.refNotes.value;
      var rating = parseInt(this.refRating.value);
      const maxPoints = parseInt(this.state.settings.max_points);
      if(Object.is(rating, NaN)){
        rating = null;
      }
      else if(!(rating <= maxPoints && rating >= 0)){
        this.showError("Points number out of range")
        return;
      }
      if(!notes) {
        notes=null;
      }

      if((notes == null || rating == null) && this.state.rate_done){
        this.showError("Some field are empty while report is marked as done!")
        return;
      }
      
      ApiR.updateReport(this.props.ident, notes, rating, null,
        () => {
          this.showSuccess("Changes saved!")
        },
        () => this.showError(checkLogsError))
  }

    async showPopup(event) {
      event.preventDefault();
      await this.setState({PopDodajVisible: true});

      ApiR.getReportByID(this.props.ident, (report) => {
        if(report.notes)
          this.refNotes.value = report.notes;
        else this.refNotes.value = this.state.settings.default_note;

        this.setState({rate_done: report.rate_done});
        this.refRating.value = report.rating;
        this.refRating.focus();
        this.refNotes.focus();
      })
    }

    render(){
      const { classes, blocked } = this.props;
      const buttonString = blocked ? "COMMENTS AND EVALUATION" : "EVALUATE AND CONFIRM";

        return (
          <div className={classes.mainContainer}>
            {/* <div className={classes.optionsContainer}> */}
              <Button onClick={this.showPopup.bind(this)} className={classes.buttonConfirm}>{buttonString}</Button>
              <Popup open={this.state.PopDodajVisible} closeOnDocumentClick onClose={() => {this.setState({PopDodajVisible: false})}} modal>
              <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                      <DoneIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                      Evaluation
                    </Typography>
                    <form className={classes.form} id="formRating" noValidate>
                      <Grid container spacing={2}  alignItems="center">
                        <Grid item xs={12} sm={12}>
                          <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="notes"
                            inputRef={(ref) => this.refNotes = ref}
                            label="Comments"
                            name="notes"
                            autoComplete="notes"
                            multiline
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            type="number"
                            required
                            fullWidth
                            id="rating"
                            inputRef={(ref) => this.refRating = ref}
                            label={!blocked ? "Points" :''}
                            name="rating"
                            variant="outlined"
                            InputProps={{ inputProps: { min: 0, max: this.state.settings.max_points } }}
                            disabled={blocked}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <InputLabel className={classes.labelStyle}>
                              / {this.state.settings.max_points }
                          </InputLabel>
                          
                        </Grid>
                      </Grid>
                      {!blocked ?
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button type="submit" fullWidth
                                  variant="contained" color="primary"
                                  onClick={this.saveReportNotes.bind(this)}
                                  className={classes.submit}>
                            Save notes
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button type="submit" fullWidth
                                variant="contained" color="primary"
                                onClick={!this.state.rate_done ?
                                              this.confirmRating.bind(this)
                                            : this.unconfirmRating.bind(this)}
                                className={classes.submit}>
                          {!this.state.rate_done ? 'Save and confirm' : 'Unconfirm rate'}
                        </Button>
                      </Grid>
                  </Grid>
                      : '' }
                    </form>
                  </div>
                </Container>
              </Popup>
            {/* </div> */}
           
          </div>
        );
    }
  }
  ButtonConfirm.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default withStyles(useStyles)(withSnackbar(ButtonConfirm));