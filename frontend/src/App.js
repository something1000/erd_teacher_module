import React, { Component } from 'react';
import './App.css';
import Navigation from './Navigation';
import { withStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import Report from './drawpage/Report';
import Teachers from './Teachers'
import Terms from './Terms'
import TermReports from './Reports';
import Account from './Account';
import Login from './Login';
import Logout from './Logout';
import Settings from './Settings';
import Err404 from './Err404';
import withAuth from './withAuth';

const styles = theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: '100vh',
    overflow: 'auto',
  },
});

class App extends Component {

  constructor(props){
    super(props);
    this.state = {refNav: null};
  };

  assignNavVariable = (variable) => {
    this.setState({refNav: variable});
  }

  refreshNavBar = () => {
    this.state.refNav.update();
  }

  render() {
    const {classes} = this.props;
    const AuthTerms = withAuth(Terms, Login)
    return (
      <Router>
        <Navigation refAssign={this.assignNavVariable}>
          <main className={classes.content}>
          <div className={classes.appBarSpacer} />
              <div>
                  <Switch>
                    <Route path="/term/:id" component={withAuth(TermReports, Login)}/>
                    <Route path="/teachers" component={withAuth(Teachers, Login)}/>
                    <Route path="/terms"  render={(props) => <AuthTerms refreshNavBar={this.refreshNavBar} {...props} />}/>
                    <Route path="/report/:id" component={withAuth(Report, Report)}/>
                    <Route path="/settings" component={withAuth(Settings, Login)}/>
                    <Route exact path="/" component={(props) => <AuthTerms refreshNavBar={this.refreshNavBar} {...props} />}/>
                    <Route path="/logout" component={Logout} />
                    <Route path="/" component={Err404} />
                  </Switch>
                </div>
          </main>
          </Navigation>
        </Router>
    );
  }
}

export default withStyles(styles)(App) ;
