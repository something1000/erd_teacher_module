import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Err404 extends Component{

  render(){
      return(<React.Fragment><h1>404</h1></React.Fragment>);
    }
  }

  Err404.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default Err404;