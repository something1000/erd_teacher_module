import React from 'react';
import PropTypes from 'prop-types';

const ApiA = require('./AuthenticationApi');

class Logout extends React.Component{
    componentDidMount(){
      ApiA.logout(() => this.props.history.push("/"));
    }

    render(){
        return("Sign out")
  }
}
export default Logout;