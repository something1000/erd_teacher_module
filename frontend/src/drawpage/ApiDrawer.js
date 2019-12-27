require('../config/config.js');

const drawURL = global.gConfig.backend.address + "/api/draw/";
const commentURL = global.gConfig.backend.address + "/api/comment/";

module.exports = 
{

    postDrawerPaths(reportID, side, key, drawing, callbackSuccess, callbackFail){
      
      var data = "[";
      data=drawing.map(
        (draw) => {
          return "(" + draw.x + ", " + draw.y + ")";
        }
      ) //this produces ["(x,y)", "(x,y)"]
       // we need [(x,y), (x,y)]
      data = JSON.stringify(data)
      data = data.replace(/\"/g, "");

      data = {key: key, path: data, window_side: side};
      fetch(drawURL+reportID, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
          //'token': token,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess()
        else throw res;
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    getDrawerPaths(reportID, side, callback){
        fetch(drawURL + reportID + "/" + side, {
          method: 'GET',
          credentials: 'include',
          headers:{
            //'token': token,
            'Content-Type': 'application/json'
          }})
          .then(response => response.json())
          .then(data => {
                        var list = [];
                        data.forEach( (line) => {
                            var currentDraw = [];
                            var path = line.path.replace(/\(/g, "["); //regexp - zamiana ( na [
                            path = path.replace(/\)/g, "]"); //regexp - zamiana ) na ]
                            path = JSON.parse(path);
                            path.forEach((coords)=>{
                              currentDraw.push({x: coords[0], y: coords[1]})
                            });
                            list.push({key: line.key, path: currentDraw.slice()});
                        });
                        callback(list);
        });
    },

    deleteDrawerPaths(reportID, side, key, callbackSuccess, callbackFail){
      
      const data = {key: key, window_side: side};
      fetch(drawURL+reportID, {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess()
        else throw res;
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },




    /*COMMENTS*//*COMMENTS*//*COMMENTS*//*COMMENTS*//*COMMENTS*/


    postDrawerComment(reportID, side, key, comment, callbackSuccess, callbackFail){
      // this.setState({comments: this.state.comments.concat({id: lastID + 1, 
      //   position: {x: (event.pageX - this.offsetLeft()), 
      //              y: (event.pageY - this.offsetTop())}})});

      const bounds = comment.bounds ? "(" + comment.bounds.width + "," + comment.bounds.height + ")" : null;
      var data = {
                  key: key,
                  text: comment.content.text,
                  priority: comment.content.priority,
                  position:"(" + comment.position.x + "," + comment.position.y + ")",
                  bounds:bounds,
                  report_id:reportID,
                  window_side: side};
      fetch(commentURL + reportID, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess()
        else throw res;
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    updateDrawerComment(reportID, side, key, comment, callbackSuccess, callbackFail){
      // this.setState({comments: this.state.comments.concat({id: lastID + 1, 
      //   position: {x: (event.pageX - this.offsetLeft()), 
      //              y: (event.pageY - this.offsetTop())}})});

      var data = {
                  key: key,
                  text: comment.content.text,
                  priority: comment.content.priority,
                  report_id:reportID,
                  window_side: side};
      fetch(commentURL + reportID, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess()
        else throw res;
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    deleteDrawerComment(reportID, side, key, callbackSuccess, callbackFail){

      var data = {
                  key: key,
                  report_id:reportID,
                  window_side: side};
      fetch(commentURL + reportID, {
        method: 'DELETE',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess()
        else throw res;
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    getDrawerComments(reportID, side, callback){
      fetch(commentURL + reportID + "/" + side, {
        method: 'GET',
        credentials: 'include',
        headers:{
          'Content-Type': 'application/json'
        }})
        .then(response => response.json())
        .then(data => {
                      var frameList = [];
                      var commentList = [];
                      data.forEach( (cmt) => {
                          var currentComment = {
                                id: cmt.key,
                                content: {text: cmt.text,
                                          priority: cmt.priority
                                },
                                position: cmt.position,
                          }
                          if(cmt.bounds){
                            currentComment.bounds = {width: cmt.bounds.x, height: cmt.bounds.y};
                            frameList.push(currentComment);
                          } else{
                            commentList.push(currentComment);
                          }
                      });
                      callback(frameList, commentList);
      });
  },

}