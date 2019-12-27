import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import CommentPointIcon_P1 from '../img/comment_p1.png'
import CommentPointIcon_P2 from '../img/comment_p2.png'
import CommentPointIcon_P3 from '../img/comment_p3.png'
import CommentPointIcon_P4 from '../img/comment_p4.png'

import FrameCommentIcon from '../img/frame_comment.png'

import PropTypes from 'prop-types';

const styles = theme => ({
  cmtButton: {
      width: `${25}px`,
      height:  `${30}px`,
     // background: `url(${CommentPointIcon_P1})`,
      border: '0',
      position:'absolute',
      top:'0px',
      left:'0px',
      background:'none',
    },

   turnedOff:{
       opacity: 1,
   },
   turnedOn:{
       zIndex:10,
       opacity: 1,
   }
});


class CommentButton extends React.Component{

    selectPriorityImage(priority){
      if(this.props.mode === "frame"){
        return FrameCommentIcon;
      }

      switch(priority){
        case 1:
          return CommentPointIcon_P1;
        case 2:
          return CommentPointIcon_P2;
        case 3:
          return CommentPointIcon_P3;
        case 4:
          return CommentPointIcon_P4;
        default:
          return CommentPointIcon_P2;
      }
    }

    executeCallback = () => {
        this.props.callback();
    }

    render(){
      const {classes} = this.props;

      return (
          <div className={classNames(classes.cmtButton, !this.props.visibility ? classes.turnedOn : classes.turnedOff)} 
                  onClick={this.executeCallback}>
                  <img alt="priority" src={this.selectPriorityImage(this.props.priority)}/>
          </div>  
      )
    }
  }

  CommentButton.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(CommentButton);