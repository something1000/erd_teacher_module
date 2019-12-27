import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import CommentButton from './CommentButton.js'
import CommentContent from './CommentContent.js';


const componentSize = 400;

const styles = theme => ({
  cmtBox: {
      position: 'absolute',
      backgroundColor: '#eaeaea',
      display: 'flex',
      flexWrap: 'wrap',
      maxHeight: '300px',
      zIndex: '3',
    },

    cmtBoxVisible: {
      width: `${componentSize}px`,
      border: '1px solid black',
      borderRadius: '10px',
      zIndex: '4',
    },

    cmtBoxHidden: {
      width: '0px',
      border: '0',
    },

});


class CommentBox extends React.Component{
    constructor(props){
      super(props);
      this.state = {hide: true, comment: '', priority: 2};
      this.contentRef = {};
    }

 
    componentDidMount(){
      this.visualMode = this.props.visualMode;
    }

    changeVisibilityStateHandler = () => {
      if(!this.state.hide && this.contentRef != null){
        this.updateState();
      }
      this.setState({hide: !this.state.hide});
    };

    updateState = () => {
      this.setState({comment: this.contentRef.getValue(),
                     priority: this.contentRef.getPriority()},
                     () => this.props.contentCallback(this.props.id, this.props.mode, 
                                                {text: this.state.comment, priority: this.state.priority}));
      
    };

    render(){
      const {stylez, classes, position, mode} = this.props;

      var positionCSS = {
        top: `${mode !== "frame" ? position.y-18 : position.y+12}px`, //uwzglednienie wysokosci szerokosci, aby 
        left: `${mode !== "frame" ? position.x-2 : position.x+12}px`, //(pinezka byla pod przyciskiem / przycisk ramki w ramce)
      }

      return (       
          <div className={classNames(stylez, classes.cmtBox, this.state.hide ? classes.cmtBoxHidden: classes.cmtBoxVisible)}
               ref="cmtBox"
               style={positionCSS}>   
              <CommentButton callback={this.changeVisibilityStateHandler} 
                             visibility={this.state.hide}
                             mode={mode}
                             priority = {this.props.content.priority}/>         
              {!this.state.hide ? 
                    <CommentContent onRef={(ref) => this.contentRef = ref} 
                                    visibility={this.state.hide}
                                    close = {this.changeVisibilityStateHandler}
                                    value = {this.props.content.text}
                                    priority = {this.props.content.priority}
                                    id = {this.props.id}
                                    removeComment = {this.props.removeComment}
                                    mode = {mode}
                                    updateCallback={this.updateState}
                                    visualMode={this.visualMode}/>
                    : '' }
          </div> 
      )
    }
  }

  CommentBox.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(CommentBox);