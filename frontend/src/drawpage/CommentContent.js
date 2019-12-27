import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import PropTypes from 'prop-types';


import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const styles = theme => ({

    commentContent:{
      zIndex:'9',
    },

    rightSide:{
      width:'10%',
      float:'left',
    },

    leftSide:{
      padding: '10px 20px',
      width:'90%',
      float:'left',
    },
    leftSideStudent:{
      padding: '10px 20px',
      width:'350px',
      float:'left',
    },
  

    inputRange:{
      marginTop: '20px',
      width: '10px',
      height: '100px',
      float: 'left',
      
    },

    button:{
      float:'left',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },

    textField:{
      width:'95%',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },


    btnArea:{
      float:'left',
      width:'100%',
      height:'20%',
    },

    contentHidden:{
      position: 'absolute',
      zIndex:'-1',
    },

});


class CommentContent extends React.Component{
    constructor(props){
      super(props);
      this.state = {hide: true, remove:false};
      if(this.props.onRef != null){
        this.props.onRef(this);
      }
      this.inputText = {};

      this.setPrioritySlider = element => {
        this.prioritySlider = element;
      }
    
    } 

    removeCommentHandler = () => {
      this.props.removeComment(this.props.id, this.props.mode);
    }

    getRemoveStatus(){
      return this.state.remove;
    }

    getValue(){
      return this.inputText.value;
    }

    getPriority(){
      return this.prioritySlider.valueAsNumber;
    }
 
    componentDidMount(){
      this.prioritySlider.value = this.props.priority;
      this.visualMode = this.props.visualMode;
    }

    render(){
      const {classes} = this.props;
      const vis = this.props.visibility;// ? classes.contentHidden: '';
      const mode = this.props.visualMode;

      return (
        <span>
          {
            !vis ?
             mode==="full" ? 
                <div className={classes.commentContent}>
                  <div className={classes.leftSide}>
                    <TextField
                        label="Comment"
                        placeholder="Comment"
                        multiline
                        className={classNames(classes.textField)}
                        margin="normal"
                        variant="filled"
                        rowsMax={10}
                        defaultValue ={this.props.value}
                        inputRef= {(ref) => this.inputText = ref}
                      />
                      <div className={classes.btnArea}>
                          <Button variant="contained" className={classes.button} onClick={this.props.close}>
                            Save
                          </Button>
                          <Button variant="contained" className={classes.button} onClick={this.removeCommentHandler}>
                            Delete
                          </Button>
                      </div>
                  </div>
                    
                  <div className={classes.rightSide}>
                        <input className={classNames("input-range", classes.inputRange)}
                              type="range" orient="vertical" min="1" max="4" 
                              defaultValue = {this.props.priority}
                              onChange = {this.props.updateCallback}
                              ref={this.setPrioritySlider}/>
                  </div>          
                </div>
              : //  WIDOK DLA STUDENTA
                <div className={classes.commentContent}>
                <div className={classes.leftSideStudent}>
                  <TextField
                      label="Comment"
                      placeholder="Comment"
                      multiline
                      className={classNames(classes.textField)}
                      margin="normal"
                      variant="filled"
                      rowsMax={10}
                      defaultValue ={this.props.value}
                      inputRef= {(ref) => this.inputText = ref}
                      disabled
                    />
                </div>
                <div className={classes.rightSide}>
                      <input className={classNames("input-range", classes.inputRange)}
                            type="range" orient="vertical" min="1" max="4" 
                            defaultValue = {this.props.priority}
                            ref={this.setPrioritySlider} hidden/>
                </div>          
              </div>
            :""
          }
        </span>
          

      )
    }
  }

  CommentContent.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(CommentContent);