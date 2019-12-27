require('./config/config.js');
const decode = require('jwt-decode');

const URL = global.gConfig.backend.address + "/api/account/"

module.exports = {
  authenticateLogin(login, password, callbackSuccess, callbackFail) {
    var data = {
        login: login,
        password: password,
      };
    fetch(URL + 'authenticate', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(res => { 
        if(res.status === 200) {
            callbackSuccess();
        } else if(res.status === 401){
            throw({reason: "Provided credentials are invalid"})
        } else {
            throw({reason: "Internal Server Error"})
        }
        })
      .catch(err => {
        console.error(err);
        callbackFail(err.reason || "Something went wrong");
      });
  },

  authenticated() {
    return fetch(URL+ "islogged", {
        method: 'GET',
      credentials: 'include'}
    )
    },

  getCurrentUser(callback) {
    fetch(URL+ "islogged", {
      method: 'GET',
    credentials: 'include'})
    .then(res => { return res.json() })
    .then(res => { 
      callback(res.login);
    });
  },

  logout(callback) {
      fetch(URL + "logout", {
        method: 'GET',
        credentials: 'include'
      }).then(res => {
          callback();
      })
      .catch(err => callback());
  }
}
