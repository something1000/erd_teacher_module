require('../config/config.js');

const URL = global.gConfig.backend.address + "/api/report/";

module.exports = 
{
    getReportByID(reportID, callback) {
        fetch(URL + reportID, {
          method: 'GET',
          credentials: 'include',
          headers:{
          'Content-Type': 'application/json'
          }})
          .then(response => {
            return response.json();
          })
          .then(data => {
            callback(data);
        }).catch(err => {
            console.error(err);
            callback(null)});
    },

    updateReport(reportID, notes, rating, rate_done, callbackSuccess, callbackFail) {
      var data = {notes: notes, rating: rating, rate_done: rate_done};
      fetch(URL + 'note/' + reportID, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
        'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess();
        else throw res
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    undoneReport(reportID, callbackSuccess, callbackFail) {
      var data = {rate_done: false};
      fetch(URL + 'undone/' + reportID, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
        'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 200) callbackSuccess();
        else throw res
      })
      .catch(error => {
        callbackFail();
        console.error('Error:', error)
      });
    },

    confirmReport(reportID, confirmed, successCallback, alreadyCnfCallback, failCallback) {
      var data = {reportID: reportID, confirmed: confirmed};
      fetch(URL + 'confirm', {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
        'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.status === 400) alreadyCnfCallback();
        if(res.status === 500) failCallback();
        if(res.status === 200) successCallback();
      })
      .catch(error => {
        failCallback();
        console.error('Error:', error)
      });
    },

    shareReport(reportID, shared, successCallback, failCallback) {
      var data = {reportID: reportID, shared: shared};
      fetch(URL + "share", {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers:{
        'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if(res.ok){
          successCallback();
        } else {
          throw res;
        }
      })
      .catch(error => {
        failCallback();
        console.error('Error: ', error)
      });
    },
}