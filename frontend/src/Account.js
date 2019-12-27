import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Account extends Component{

    render(){
      return(<React.Fragment><h1>You are logged in</h1></React.Fragment>);
    }
  }

  Account.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  export default Account;