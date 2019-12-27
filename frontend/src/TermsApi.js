require('./config/config.js');

const URL = global.gConfig.backend.address + "/api/term/";

module.exports = 
{
    getTerms(callback) {
      fetch(URL, {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token, 
          'Content-Type': 'application/json'
        }})
        .then(response => {
          if(response.status === 200){
            return response.json()
          }
          return null;
        }).then(data => {
          callback(data);
      }).catch(err => callback(null));
    },

    getActiveTerms(callback) {
      fetch(URL + 'active', {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token, 
          'Content-Type': 'application/json'
        }})
        .then(response => {
          if(response.status === 200){
            return response.json()
          }
          return null;
        }).then(data => {
          callback(data);
      }).catch(err => callback(null));
    },

    getYourTerms(callback) {
      fetch(URL + 'your', {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token, 
          'Content-Type': 'application/json'
        }})
        .then(response => {
          if(response.status === 200){
            return response.json()
          }
          return null;
        }).then(data => {
          callback(data);
      }).catch(err => {
        console.error(err);
        callback(null)});
    },

    getTermByID(termID, callback) {
      fetch(URL + termID, {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token, 
          'Content-Type': 'application/json'
        }})
        .then(response => {
          if(response.status === 200){
            return response.json()
          }
          throw response.status;
        }).then(data => {
          callback(data[0]);
      }).catch(err => callback(null));
    },

    postTerm(term, callbackSuccess, callbackFail) {
      fetch(URL, {
        method: 'POST',
        body: JSON.stringify(term),
        credentials:'include',
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

    deleteTerm(termID, callbackSuccess, callbackFail) {
      fetch(URL + termID, {
        method: 'DELETE',
        credentials:'include',
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
    
    updateTerm(termID, term, callbackSuccess, callbackFail) {
      fetch(URL + termID, {
        method: 'PUT',
        body: JSON.stringify(term),
        credentials:'include',
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
    }
}