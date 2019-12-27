import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import BaseComponent, {checkLogsError} from '../BaseComponent.js'
import { withSnackbar } from 'notistack';
import rmButton from '../img/remove.png'
import PropTypes from 'prop-types';
import CommentBox from './CommentBox.js';
const Api = require('./ApiDrawer.js')

const sideWidth = 800;

const priorityColor = ['#00ff00', '#ffff00', '#ff9400', '#ff0000']

const styles = theme => ({
    drwCanvas: {
      //  width: `${sideWidth}px`,
        position: 'absolute',
        zIndex: '2',
      },
      drwHtml:{
        width: `${sideWidth}px`,
        position: 'absolute',
        padding:'20px',
        zIndex: '1',
      },

      rmBtn:{
        position: 'absolute',
        width: '20px',
        height: '20px',
        zIndex: '3',
        border: 0,
        background: `url(${rmButton})`,
        opacity: 0.5,
      },
      
      cmtBox:{
        zIndex: '4'
      },

});

class Drawer extends BaseComponent{
    constructor(props){
      super(props);
      this.lastCommentId = 0;
      this.lastDrawId = 0;
      this.drwCanvas = React.createRef();
      this.innerHtml = React.createRef();
      this.container = React.createRef();
      this.state = {
        loaded : false,
        drawings : [],
        comments: [],
        frames:[],
        canvasHidden:false,
      };
      //var started;
    }
    
    componentDidMount(){
      this.lastCommentId = 0;
      this.lastDrawId = 0;
      this.side = this.props.side;
      this.reportID = this.props.userID;
      this.visualMode = this.props.visualMode;
      this.drwContext = this.drwCanvas.current.getContext("2d");
      this.drwCnvOffset = this.drwCanvas.current.getBoundingClientRect();
      this.currentDraw = [];
      document.addEventListener('keydown',this.keydownHandler);
      document.addEventListener('keyup',this.keyupHandler);

      this.fetchDrawerData();
      
      //getDrawerFrames();
      
    }

    async fetchDrawerData(){
      if (this.visualMode === "onlyReport") // DLA STUDENTA DO POTWIERDZENIA PRACY
          return;
      if (this.visualMode === "withRating") { // PODGLĄD DLA STUDENTÓW OCENIONEJ PRACY PRZEZ PROWADZĄCEGO
        await Api.getDrawerPaths(this.reportID, this.side, (data) => {
          this.setState({drawings: data});
          this.lastDrawId = Math.max(0, ...data.map(y => y.key));                 
      });
      await Api.getDrawerComments(this.reportID, this.side, (frames, comments)=>{
          this.setState({frames: frames, comments: comments});
          this.lastCommentId = Math.max(0, ...frames.map(y=>y.id), ...comments.map(y=>y.id));
          this.setState({loaded: true}, this.setCanvasBounds());
        });
        return
      }
      // DOSTĘPNE WSZYSTKIE OPCJE DLA PROWADZĄCEGO
      await Api.getDrawerPaths(this.reportID, this.side, (data) => {
          this.setState({drawings: data});
          data.forEach((draw)=>{
            var removeButton = this.createRemoveButton(draw.key, draw.path[0].x, draw.path[0].y);
            this.container.current.appendChild(removeButton);
          });
          this.lastDrawId = Math.max(0, ...data.map(y => y.key));                 
      });
      await Api.getDrawerComments(this.reportID, this.side, (frames, comments)=>{
          this.setState({frames: frames, comments: comments});
          this.lastCommentId = Math.max(0, ...frames.map(y=>y.id), ...comments.map(y=>y.id));
          this.setState({loaded: true}, this.setCanvasBounds());
        });
    }

    componentDidUpdate(){
      this.setCanvasBounds()
    }

    componentWillUnmount(){
      document.removeEventListener('keydown',this.keydownHandler);
      document.removeEventListener('keyup',this.keyupHandler);
    }

    keydownHandler = (event) => {
      if(event.ctrlKey){
        this.drwCanvas.current.style.zIndex="-1";
      }
    }

    keyupHandler = (event) => {
      if(event.key === 'Control'){
        this.drwCanvas.current.style.zIndex="2";  
      }
    }

    setCanvasBounds = () => {
            this.drwCanvas.current.setAttribute("height", this.innerHtml.current.scrollHeight);
            this.drwCanvas.current.setAttribute("width", this.innerHtml.current.scrollWidth);
            this.redraw();
     
    }

    removeDrawing = (event) => {
        var pathToRemove = event.target;
        var pathKey = pathToRemove.value;

        var modified = this.state.drawings.slice();
        modified.splice(modified.findIndex((e)=> e.key == pathKey), 1);
        this.container.current.removeChild(pathToRemove);

        this.setState({drawings: modified});
        Api.deleteDrawerPaths(this.reportID, this.side, pathKey, ()=>{}, () => this.showError(checkLogsError));
        this.redraw();
    }

    redraw(){
        //clear area
        this.drwContext.clearRect(0,0,this.drwCanvas.current.width, this.drwCanvas.current.height);
        this.drwContext.lineWidth = "5";
        //redraw all paths
        this.drwContext.strokeStyle = this.props.color;
        this.state.drawings.forEach((i) => {
            this.drwContext.beginPath();
            this.drwContext.moveTo(i.path[0].x, i.path[0].y);

            i.path.forEach((point) => {
                this.drwContext.lineTo(point.x, point.y);
                this.drwContext.stroke();
            });

        });   

        //redraw current frame (while holding mouse)
        if(this.currentDraw.start_x){
          this.drwContext.strokeStyle = priorityColor[1];
          this.drwContext.strokeRect(this.currentDraw.start_x, this.currentDraw.start_y, this.currentDraw.width, this.currentDraw.height);
        }

        //redraw each frame drawed
        this.state.frames.forEach((frame) => {
          //this.drwContext.strokeStyle = this.props.color;
            var color = frame.content.priority ? frame.content.priority - 1 : 1;
            this.drwContext.strokeStyle = priorityColor[color];
            this.drwContext.strokeRect(frame.position.x, frame.position.y, frame.bounds.width, frame.bounds.height);
        });

        
    }

    createRemoveButton(
      id,
      pos_x = this.currentDraw[0].x,
      pos_y = this.currentDraw[0].y)
      {
        var b = document.createElement("button");
        b.className = this.props.classes.rmBtn;
        b.value = `${id}`;
        b.style.top = pos_y + "px";
        b.style.left = pos_x + "px";
        b.onmouseover = function(){
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
        };
        b.onmouseout = function() {
            this.style.opacity = '0.5';
            this.style.cursor = 'default'
        }; 
        b.onclick = this.removeDrawing;
        return b;
    }

 

    offsetTop(){
      this.drwCnvOffset = this.drwCanvas.current.getBoundingClientRect();
      return this.drwCnvOffset.top;// + this.refs.drawing.scrollTop ;//+ (window.pageYOffset || 0);
    }

    offsetLeft(){     
      this.drwCnvOffset = this.drwCanvas.current.getBoundingClientRect();
      return this.drwCnvOffset.left;// - this.refs.drawing.scrollLeft ;//+ (window.pageXOffset || 0);
    }

    getHandlersByTool(tool){
      var mouseDown = null;
      var mouseMove =null;
      var mouseUp = null;
      switch(tool){
        case 'brush':
          mouseDown = this.startDrawingHandler;
          mouseMove = this.drawingHandler;
          mouseUp   = this.stopDrawingHandler;
        break;
        case 'comment':
          mouseDown = this.addCommentHandler;
          break;
        case 'frame':
          mouseDown = this.startFrameHandler;
          mouseMove = this.moveFrameHandler;
          mouseUp   = this.completeFrameHandler;
          break;
        default:
          break;
      }
      return [mouseDown, mouseMove, mouseUp];
    }

    startFrameHandler = (event) => {
      if(event.button !== 0) return;
      this.drwCanvas.current.style.zIndex = '5';
      this.drwContext.strokeStyle = this.props.color;
      this.drwContext.lineWidth = "5";
      this.frameX = event.pageX;
      this.frameY = event.pageY;
      this.started = true;
      this.currentDraw = {start_x: event.pageX, start_y: event.pageY, width: 0, height:0};
    };

    moveFrameHandler = (event) => {
      if(this.started){

        var beginX, beginY;
        var width = Math.abs(this.frameX - event.pageX);
        var height = Math.abs(this.frameY - event.pageY);

        if(this.frameX > event.pageX){
           beginX = event.pageX;
        } else {
          beginX = this.frameX;
        }

        if(this.frameY > event.pageY){
          beginY = event.pageY;
       } else {
          beginY = this.frameY;
       }
        //this.drwContext.strokeRect((beginX - this.offsetLeft()), (beginY - this.offsetTop()), width, height);
        this.currentDraw = {start_x: (beginX - this.offsetLeft()), start_y: (beginY - this.offsetTop()), width: width, height: height};
        //this.currentDraw.push({type: "pen", point_x: (event.pageX - this.offsetLeft()), point_y: (event.pageY - this.offsetTop())});  
       this.redraw();
      }
    };


    completeFrameHandler = (event) => {
      if(event.button !== 0) return;

        this.started = false;
        this.drwCanvas.current.style.zIndex = '2';
        if(!this.currentDraw.start_x) return;
        
        if(this.currentDraw.width < 25 || this.currentDraw.height < 25) {
          this.currentDraw = [];
          this.redraw();
          return;
        }

        this.lastCommentId = this.lastCommentId + 1;
        
        const position = {x: this.currentDraw.start_x,
                          y: this.currentDraw.start_y};
        const bounds = {width: this.currentDraw.width,
                        height: this.currentDraw.height}; 
        
        const newFrame = {id: this.lastCommentId, position: position, bounds:bounds, content:{text:'',priority: 2}};
        this.setState({frames: this.state.frames.concat(newFrame)});

        Api.postDrawerComment(this.reportID, this.side, this.lastCommentId, newFrame,
                              () => {},
                              () => this.showError(checkLogsError));
        this.currentDraw = [];
    }

    startDrawingHandler = (event) => {
      if(event.button !== 0) return;
      this.drwCanvas.current.style.zIndex = '5';
      this.drwContext.strokeStyle = this.props.color;
      this.drwContext.lineWidth = "5";
      this.drwContext.beginPath();
      this.old_y = event.pageY;
      this.old_x = event.pageX;
      this.started = true;
      this.currentDraw = [];
    };

  
    drawingHandler = (event) => {
      if(this.started){
        if(Math.abs(this.old_x - event.pageX) > 5 || Math.abs(this.old_y - event.pageY)>5){
            this.drwContext.lineTo((event.pageX - this.offsetLeft()), (event.pageY - this.offsetTop()));
            this.drwContext.stroke();
            this.currentDraw.push({x: (event.pageX - this.offsetLeft()), y: (event.pageY - this.offsetTop())});
            this.old_x = event.pageX;
            this.old_y = event.pageY;   
        }
     }
    };

    stopDrawingHandler = (event) => {
        if(event.button !== 0) return;

        this.started = false;
        this.drwCanvas.current.style.zIndex = '2';
        if(this.currentDraw.length === 0) return;

        this.lastDrawId = this.lastDrawId + 1;

        this.setState({drawings: this.state.drawings.concat({key: this.lastDrawId, path: this.currentDraw})});
        
        Api.postDrawerPaths(this.reportID, this.side, this.lastDrawId, this.currentDraw,
                            () => {},
                            () => this.showError(checkLogsError));

        var b = this.createRemoveButton(this.lastDrawId);
        this.container.current.appendChild(b);
        this.currentDraw = [];
    };


    addCommentHandler = (event) => {
      if(event.button !== 0) return;

      this.lastCommentId = this.lastCommentId + 1;

      //var 
      var newComment = {id: this.lastCommentId,
                        content: {text:'', priority: 2}, 
                        position: {x: (event.pageX - this.offsetLeft()), 
                                   y: (event.pageY - this.offsetTop())}};
      this.setState({comments: this.state.comments.concat(newComment)});

      Api.postDrawerComment(this.reportID, this.side, this.lastCommentId, newComment,
                            () => {},
                            () => this.showError(checkLogsError));
    }


    removeComment = (key, mode) => {
      var comment = mode === "frame" ? this.state.frames : this.state.comments; 
      var removeIndex = comment.findIndex((y)=>y.id === key);

      var newComments = comment.slice();
      newComments.splice(removeIndex, 1);
      if(mode === "frame"){
        this.setState({frames: newComments}/*, () => this.redraw()*/);
        
      } else {
        this.setState({comments: newComments});
      }
      Api.deleteDrawerComment(this.reportID, this.side, key,
                              () => {},
                              () => this.showError(checkLogsError));
    }

    updateComment = (key, mode, content) => {
      if(this.props.visualMode !== "full") return;
      var comment = mode === "frame" ? this.state.frames : this.state.comments; 
      var commentIndex = comment.findIndex((y)=>y.id === key);
      var newComments = comment.slice();
      newComments[commentIndex].content = content;
      if(mode === "frame"){
        this.setState({frames: newComments}/*, () => this.redraw()*/);
      } else {
        //Api.postDrawerComment(this.reportID, 0, key, newComments[commentIndex]);
        this.setState({comments: newComments}); 
      }
      Api.updateDrawerComment(this.reportID, this.side, key, newComments[commentIndex],
                              () => {},
                              () => this.showError(checkLogsError));
    }


    render(){
      const {classes, stylez, tool} = this.props;

      const [mouseDownHandler, mouseMoveHandler, mouseUpHandler] = this.getHandlersByTool(tool);

      return (
          
          <div className={stylez} ref={this.container}>
              {
              this.state.comments.map(cmt => (
                <CommentBox key={cmt.id} 
                            id={cmt.id}
                            contentCallback={this.updateComment}
                            position={cmt.position}
                            content={cmt.content}
                            mode="comment"
                            removeComment={this.removeComment} 
                            visualMode={this.visualMode}/>
              ))
              }
              {
              this.state.frames.map(frame => (
                <CommentBox key={frame.id} 
                            id={frame.id}
                            position={frame.position}
                            content={frame.content}
                            mode="frame"
                            contentCallback={this.updateComment}
                            removeComment={this.removeComment} 
                            visualMode={this.visualMode}/>
              ))             
              }
              {this.state.canvasHidden ? "" :
                <canvas className={classes.drwCanvas} 
                    ref={this.drwCanvas} 
                    width={this.props.inHtmlwidth}
                    onMouseDown={mouseDownHandler}
                    onMouseMove={mouseMoveHandler}
                    onMouseUp={mouseUpHandler}
                ></canvas>
              }
            <div className={classes.drwHtml} ref={this.innerHtml}>
              {this.props.inHtml}
            </div>

          </div> 
      )
    }
  }

  Drawer.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  

export default withStyles(styles)(withSnackbar(Drawer));