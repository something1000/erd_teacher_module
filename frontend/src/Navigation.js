import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import { withStyles } from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import GroupIcon from '@material-ui/icons/Group'
import CalendarIcon from '@material-ui/icons/CalendarToday'
import SettingsIcon from '@material-ui/icons/SettingsApplicationsOutlined'
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import NavigationListItem from './NavigationListItem'
import {
  Link
} from 'react-router-dom';
import SettingsPowerIcon from '@material-ui/icons/PowerSettingsNew';

const drawerWidth = 280;
const ApiT = require('./TermsApi.js');
const ApiA = require('./AuthenticationApi')

const styles = theme => ({
  root: {
    display: 'flex',
    //margin:'1em',
    overflow:'hidden',
    height:'98vh',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    overflowY: 'scroll',
    overflowX: 'hidden',
    height: '100vh',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(1),
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: '100vh',
    overflow: 'auto',
  },
  navigation: {
    width: '100wh',
  },
  nested: {
    paddingLeft: theme.spacing(5),
  },
  h5: {
    marginBottom: theme.spacing(2),
  },
  navigationLink: {
    color: 'inherit', /* blue colors for links too */
    textDecoration: 'inherit',
  },
  logoutLink: {
    color: '#fff',
    textDecoration: "none",
  }
});

class Dashboard extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      open: true,//window.innerWidth > 480,
      expanded: false,
      currentLogin: "empty",
      terms: [],
      yourTerms: [],
      visible: false
    };
    this.props.refAssign(this);
  }

  update = () => {
    ApiT.getActiveTerms(this.loadTerms);
    ApiT.getYourTerms(this.loadYourTerms);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleExpandItem = () => {
    this.setState({expanded: !this.state.expanded});
  };

  handleResizeWindow = () => {
      if(window.innerWidth <=480){
        this.setState({open: false});
      };
  }

  componentDidMount(){
      window.addEventListener("resize",this.handleResizeWindow);
      ApiA.authenticated()
      .then(res => {
        return res.status === 200
      })
      .then(res => {
        if(res){
          this.setState({visible: true});
          ApiT.getYourTerms(this.loadYourTerms);
          ApiT.getActiveTerms(this.loadTerms);
          this.setAppBarTitle();
        } else this.setState({visible: false});
      });
  }

  componentWillUnmount(){
    window.removeEventListener("resize");
  }

  componentWillUpdate(prevProps, prevState){
    
    const fullpath = window.location.pathname;
    if(!prevState.location || prevState.location === fullpath) return;
    ApiA.authenticated()
        .then(res => {
          return res.status === 200
        })
        .then(res => {
          if(res){
            this.setState({visible: true})
            this.setAppBarTitle();
          } else this.setState({visible: false, location: null});
        });
  }

  setAppBarTitle(){
      const fullpath = window.location.pathname;
      const path = fullpath.split("/",2)[1];
      // switch(path){
      //   case "terms":
      //     this.setState({currentPage: "Terminy", location:fullpath});
      //     break;
      //   case "teachers":
      //     this.setState({currentPage: "Prowadzący", location:fullpath});
      //     break;
      //   case "report":
      //     this.setState({currentPage: "Raport", location:fullpath});
      //       break;
      //   case "term":
      //     const termID = fullpath.split("/",3)[2];
      //     ApiT.getTermByID(termID, (term) => {
      //       if(!term) return;
      //       this.setState({currentPage: "Termin " + term.code + " Deadline: " + (term.deadline || "brak"), location:fullpath});
      //     })
      //     // this.setState({currentPage: "Raporty", location:fullpath});
      //       break;
      //   case "account":
      //     this.setState({currentPage: "Zaloguj", location:fullpath});
      //       break;
      //   default:
      //     this.setState({location:fullpath});
      //   break;
      // }
      var loggedIn = ApiA.getCurrentUser(this.setLogin);
      this.setState({ location:fullpath });
  }

  setLogin = (login) => {
    this.setState({login: "Signed in as " + login});
  }

  loadTerms = (data) => {
    if(!data){
      return;
    }
    this.setState({terms: data})
  }

  loadYourTerms = (data) => {
    if(!data){
      return;
    }
    this.setState({yourTerms: data})
  }

  createTermBar(){
    var list = [];
    var data = this.state.terms;
    
    data.forEach(elem => {
      list.push({id: elem.id, day: elem.day, hours: elem.hour});
    });
    var nav = [];

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .forEach(day => {
        const subcat = list.filter((term) => term.day === day)
                         .map((el) => {
                            return {label: el.hours, link:"/term/" + el.id}
                          });
        nav.push({category: day, subcategory: subcat});
      });
    return nav;
  }

  createYourTermBar(){
    var list = [];
    var data = this.state.yourTerms;
    data.forEach(elem => {
      list.push({id: elem.id, day: elem.day, hours: elem.hour});
    });
    var nav = [];
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .forEach(day => {
        const subcat = list.filter((term) => term.day === day)
                         .map((el) => {
                            return {label: el.hours, link:"/term/" + el.id}
                          });
        nav.push({category: day, subcategory: subcat});
      });
    return nav;
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        
        {this.state.visible===true ? 
        <div>
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden,
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {this.state.login}
            </Typography>
            <Link to="/logout" className={classes.logoutLink}>
              <Button color="inherit">
                Sign out
              </Button>
            </Link>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
          <Typography
              component="h1"
              variant="h6"
              color="primary"
              noWrap
              className={classes.title}
            >
              Teacher's Panel
            </Typography>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />

          <List
            component="nav"
            subheader={<ListSubheader component="div">Management</ListSubheader>}
            className={classes.navigation}
          >
            <Link to="/teachers" className={classes.navigationLink}>
              <ListItem button >
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText inset primary="Teachers" />
              </ListItem>
            </Link>
            <Link to="/terms" className={classes.navigationLink} >
              <ListItem button>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText inset primary="Terms" />
              </ListItem>
            </Link>
            <Link to="/settings" className={classes.navigationLink} >
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText inset primary="Settings" />
              </ListItem>
            </Link>
            {/* !ApiA.authenticated() && <Link to="/account" className={classes.navigationLink} >
              <ListItem button>
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText inset primary="Konto" />
              </ListItem>
            </Link> */}
          </List>

          <Divider />
          <List
            component="nav"
            subheader={<ListSubheader component="div">Your terms</ListSubheader>}
            className={classes.navigation}
          >
            <NavigationListItem refAssign={this.props.refAssign} items={this.createYourTermBar()} />
          </List>

          <Divider />
          <Divider />
          <List
            component="nav"
            subheader={<ListSubheader component="div">All terms</ListSubheader>}
            className={classes.navigation}
          >
            {<NavigationListItem refAssign={this.props.refAssign} items={this.createTermBar()} />}
          </List>
        </Drawer></div>
        :''
        }
        {this.props.children}
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Dashboard));