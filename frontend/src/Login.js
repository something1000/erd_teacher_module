import React from 'react';
import BaseComponent, {checkLogsError} from './BaseComponent.js'
import { withSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';

const ApiA = require('./AuthenticationApi');

const useStyles = theme => ({
  main: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  field: {
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
});

class Login extends BaseComponent{
    constructor(props){
      super(props); 
      this.state = {
          login: "",
          password: "",
      }
    }

    typeValue = (event) => {
      const { value, name } = event.target;
      this.setState({
        [name]: value
      });
    }

    signIn = (event) => {
      event.preventDefault();
      const form = document.getElementById('form');
      ApiA.authenticateLogin(form.login.value, form.password.value,
        () => window.location.replace("/"),
        (err) => this.showError(err));
    }

    signOut = (event) => {
      event.preventDefault();
      ApiA.logout();
    }
    
    render(){
      const { classes } = this.props;
        return(
          <Container maxWidth="xs">
          <div className={classes.main}>
            <form className={classes.form} id="form" noValidate>
              <TextField
                className={classes.field}
                name="login"
                variant="outlined"
                required
                fullWidth
                id="login"
                label="Login"
                autoFocus/>
              <TextField
                className={classes.field}
                name="password"
                variant="outlined"
                required
                fullWidth
                id="password"
                type="password"
                label="Password"/>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                id="buttonDodaj"
                name="buttonDodaj"
                className={classes.submit}
                onClick={this.signIn}>
                  Sign In
              </Button>
            </form>
          </div>
        </Container>)
  }
}

  Login.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default withStyles(useStyles)(withSnackbar(Login));