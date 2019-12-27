import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import { withStyles } from '@material-ui/core/styles';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import {Link} from 'react-router-dom';

import CalendarIcon from '@material-ui/icons/Today'
import TimeIcon from '@material-ui/icons/AccessTime'


const styles = theme => ({
    navigation: {
        width: '100wh',
      },
      nested: {
        paddingLeft: theme.spacing(5),
      },
});

//TODO: poprawic czytelnosc tego
class NavigationListItem extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            expanded: Array(this.props.items.length).fill(false),
        };
    }

    handleExpandItem = (c) => {
        const newExpanded = this.state.expanded.slice();
        newExpanded[c] = !newExpanded[c];
        this.setState({expanded: newExpanded})
    };

render(){
    const { classes, items } = this.props;

    const listItems = items.filter(element => element.subcategory.length !== 0).map((element, index) => {
        return <span key={index}>
            <ListItem key={index} button onClick={() => this.handleExpandItem(index)}>
                <ListItemIcon>
                    <CalendarIcon />
                </ListItemIcon>
                <ListItemText inset primary={element.category} />
                {this.state.expanded[index] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={this.state.expanded[index]} timeout="auto" unmountOnExit >
            {
                element.subcategory.map( (subcat, key) =>
                <List key={key} component="div" disablePadding>
                    <Link to={subcat.link} style={{ all: 'initial' }}>
                        <ListItem button className={classes.nested}>
                                <ListItemIcon>
                                    <TimeIcon />
                                </ListItemIcon>
                            <ListItemText inset primary={subcat.label} />
                        </ListItem>
                    </Link>
                </List>
                )
            }
            </Collapse>
        </span>
    });
    return(
        <div className = {classes.navigation}>
        {listItems}
        </div>
    );}
}

NavigationListItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };

  export default withStyles(styles)(NavigationListItem)