import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames'
import commentIcon from '../img/commentIcon.png'
import brushIcon from '../img/brushIcon.png'
import frameIcon from '../img/borderIcon.png'
import PropTypes from 'prop-types';


const styles = theme => ({
  toolbar:{
    position:'absolute',
    right:'-1px',
    top:'100px',
    zIndex:'21',
    overflow:'hidden', 
  },

  tbContent:{
    float:'right',
    width:'70px',
    padding:'10px 2px',
    background:'#cecece',
    borderRadius:'10px 0px 0px 10px',
    border: '1px solid black',
    overflow: 'hidden',
  },

  tbElement:{
    //border: '1px 1px 1px 1px',    
    border: '2px solid #efefef',
    width:'80px',
    borderBottom:'1px solid #8f8f8f',
    float:'left',
    paddingTop:'10px',
    margin:'5px 0px',
    paddingBottom:'10px',
    verticalAlign:'middle',
    position:'relative',
    overflow:'hidden',  
    left:'20px',
    paddingLeft:'10px',
    borderRadius:'10px 0px 0px 10px',
    background:'#afafaf',
  },


  tbActive:{
    //padding:'5px 0px 5px 0px',
    //paddingRight:'20px',
    left:'0px',
    marginRight:'20px',
    paddingRight:'10px',
    //paddingLeft:'0px',
    borderRadius:'10px 0px 0px 10px',
    background:'#4d61d1',
  },

  tbImage:{
    //padding:'10px',
    width:'40px',
    filter:'invert(100%)',
  }
});


class Toolbar extends React.Component{
    constructor(props){
      super(props);
      //var started;
      this.state = {active: 'brush'}
    }

    
    componentDidMount(){

    }


    handleButton = (name) => {
      this.setState({active: name}, this.props.callback(name));
    }

    render(){
      const tbOptions = [{id: 0, name: 'brush', image: brushIcon},
                         {id: 1, name: 'comment', image: commentIcon},
                         {id: 2, name: 'frame', image: frameIcon}];
      const {classes} = this.props;
      return (
        <div className={classes.toolbar} ref="toolbar">
          <div className={classes.tbContent}>
            {
            tbOptions.map((btn, i)=>(
              
              <div key={btn.id} className={
                
                classNames(this.state.active === btn.name ? classes.tbActive : '',
                           classes.tbElement)} 
                      onMouseDown={() => this.handleButton(btn.name)}>
                <img key={btn.id} src={btn.image} className={
                  classes.tbImage} alt={btn.name}/>
              </div>
            ))
            }
        </div>
      </div>
      )
    }
  }

  Toolbar.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(Toolbar);