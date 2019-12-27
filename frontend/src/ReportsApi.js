require('./config/config.js');

const URL = global.gConfig.backend.address + "/api/report/"

module.exports = 
{
    getReports(callback) {
      fetch(URL, {
        method: 'GET',
        credentials: 'include',
        headers:{
        'Content-Type': 'application/json'
        }})
        .then(response => response.json())
        .then(data => {
          callback(data);
      }).catch(err => callback(null));
    },
    
    getTermReportsStats(termID, callback) {
      fetch(URL + 'stats/' + termID, {
        method: 'GET',
        credentials: 'include',
        headers:{
        'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          callback(data);
      }).catch(err => callback(null));
    },

    moveReport(reportID, newTermId, callbackSuccess, callbackFail) {
      fetch(URL + 'move', {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({report: reportID, term: newTermId}),
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

    deleteReport(reportID, callbackSuccess, callbackFail) {
      fetch(URL + reportID, {
        method: 'DELETE',
        credentials: 'include',
        headers:{
          'Content-Type': 'application/json'
        }})
        .then(res => {
          if(res.status === 200) callbackSuccess()
          else throw res;
        })
        .catch(error => {
          callbackFail();
          console.error('Error:', error)
        });
    },
}