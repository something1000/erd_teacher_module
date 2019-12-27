import React, { Component } from 'react';
require('./config/config.js');

const AuthURL = global.gConfig.backend.address + "/api/account/islogged"

export default function withAuth(ProtectedComponent, RedirectToComponent = null) {

  return class extends Component {
    constructor() {
      super();
      this.state = {
        valid: null,
      };
      this.mounted = false;
    }

    componentDidMount() {
      this.mounted = true;
      fetch(AuthURL, {
          method: 'GET',
          credentials: 'include',
          headers: {
          'Content-Type': 'application/json'
          }
      })
        .then(res => {
          if (res.status === 200 && this.mounted) {
            this.setState({ valid: true, });
            return res.json();
          } else {
            if(this.mounted)
              this.setState({valid: false});
            throw "error"
          }
        }).then(res => {
          if(this.mounted) this.setState({user: res.login});
        })
        .catch(err => {
          if(this.mounted) this.setState({ valid: false });
        });
    }

    componentWillUnmount(){
      this.mounted = false;
    }

    render() {
      const { valid, user } = this.state;
      if (valid == null) {
        return null;
      }
      else if (valid === false) {
        return (
          <React.Fragment>
            <RedirectToComponent user={null} {...this.props} />
          </React.Fragment>
        );
        //<Redirect to="/account" />;
      }
      return (
        <React.Fragment>
          <ProtectedComponent user={user} {...this.props} />
        </React.Fragment>
      );
    }
  }
}