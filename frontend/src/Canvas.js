class Canvas extends Component{
    constructor(props){
      super(props);
      this.startRect = this.startRect.bind(this);
      this.endRect = this.endRect.bind(this);
      this.moveRect = this.moveRect.bind(this);
      this.state = {
        isStarted: false,
      };
      this._startX = null;
      this._startY = null;
    }
    
    componentDidMount(){
      this.canvas = this.refs.canvas;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext("2d");
    }
  
    startRect = (evt) =>{
      this.setState({
        isStarted: true,
      });
      this._startX = evt.pageX;// - this.canvas.getBoundingClientRect().left;
      this._startY = evt.pageY;// - this.canvas.getBoundingClientRect().top;
  //+ " " + this.state.isStarted)
    }
  
    endRect(evt){  
      this.setState({isStarted: false});
    }
  
    moveRect(evt){
      
      var startX = this._startX;
      var startY = this._startY;
      var endX = evt.pageX;// - this.canvas.getBoundingClientRect().left;
      var endY = evt.pageY;// - this.canvas.getBoundingClientRect().top;
  
       if(this.state.isStarted){
         if(this._startX > endX){
          startX = endX;
          endX = this._startX
        } 
        if(this._startY > endY){
          startY = endY;
          endY = this._startY
        } 

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(startX- this.canvas.getBoundingClientRect().left,
                          startY- this.canvas.getBoundingClientRect().top,
                          Math.abs(endX-startX), Math.abs(startY-endY));
     }
    }
    render(){
      return (
        <canvas   id="drawingPane" 
                  ref="canvas" 
                  onMouseDown={this.startRect}
                  onMouseMove={this.moveRect}
                  onMouseUp={this.endRect}
        >
        </canvas>
      )
    }
  }

  export default Canvas;