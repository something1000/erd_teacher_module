require('./config/config.js');

const URL = global.gConfig.backend.address + "/api/settings/";

module.exports = 
{
    getSettings(callback) {
      fetch(URL, {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token,
          'Content-Type': 'application/json'
        }})
        .then(response => {
          if(response.status === 200)
            return response.json()
          else throw response;
        })
        .then(data => {
          callback(data);
      }).catch(err => {
        callback(null)
        console.error(err);
      });
    },

    updateSettings(settings, callbackSuccess, callbackFail) {
      var data = {
                  settings: settings,
                  };
      fetch(URL, {
        method: 'PUT',
        body: JSON.stringify(data),
        credentials:'include',
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

}