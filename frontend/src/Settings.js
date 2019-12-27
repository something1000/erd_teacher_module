import React from 'react';
import BaseComponent, {checkLogsError} from './BaseComponent'
import { withSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container'

import Button from '@material-ui/core/Button';
import { InputLabel } from '@material-ui/core';

const ApiS = require('./SettingsApi.js');

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

class Settings extends BaseComponent{
  constructor(props){
    super(props);
    this.state ={
      default_note: '',
      max_points: 40
    }
    this.defValueField = null;
    this.maxPtsField = null;
  }

  componentDidMount(){
    ApiS.getSettings((settings) => {
        this.defValueField.value = settings.default_note;
        this.defValueField.focus();
        this.maxPtsField.value = settings.max_points;
    })
  }

  saveSettings(){
    let settings = {
      default_note: this.defValueField.value,
      max_points: this.maxPtsField.value
    }

    ApiS.updateSettings(settings,
                        () => this.showSuccess("Settings saved!"),
                        () => this.showError(this.checkLogsError));
  }

  render(){
      const { classes, blocked } = this.props;
      return(
        <Container component="main" maxWidth="md">
        <div className={classes.paper}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <InputLabel className={classes.labelStyle}>
                  Default notes:
                </InputLabel>
                This setting will automatically set empty message for student in rating window.
              </Grid>
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  inputRef={(ref) => this.defValueField = ref}
                  required
                  fullWidth
                  defaultValue={this.state.default_note}
                  id="notes"
                  label="Default notes..."
                  multiline
                />
              </Grid>
              <Grid item xs={4}>
                <InputLabel className={classes.labelStyle}>
                  Maximum points:
                </InputLabel>
                This setting will automatically set maximum points which student can obtain for work.
              </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    required
                    fullWidth
                    inputRef={(ref) => this.maxPtsField = ref}
                    defaultValue={this.state.max_points}
                    id="rating"
                    label="Max.points"
                    name="rating"
                    variant="outlined"
                    disabled={blocked}
                  />
                </Grid>
                <Grid container justify="center">
                  <Grid item xs={4}>
                    <Button type="submit" fullWidth
                          variant="contained" color="primary"
                          onClick={() => this.saveSettings()}
                          className={classes.submit}>
                    Save Settings
                  </Button>
                </Grid>
              </Grid>
            </Grid >
        </div>
      </Container>
      );
    }
  }

  Settings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
 
  export default withStyles(useStyles)(withSnackbar(Settings));