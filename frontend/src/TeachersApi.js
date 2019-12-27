require('./config/config.js');

const URL = global.gConfig.backend.address + "/api/teacher/";

module.exports = 
{
    getTeachers(callback) {
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

    getTeacherByLogin(teacherLogin, callback) {
      fetch(URL + teacherLogin, {
        method: 'GET',
        credentials:'include',
        headers:{
          //'token': token, 
          'Content-Type': 'application/json'
        }})
        .then(res => {
          if(res.status === 200) return res.json()
          else throw res;
      }).then(data => {
        callback(data[0])
      }).catch(err =>{
          console.error(err);
        callback(null);
      })
    },

    postTeacher(teacherLogin, password, firstname, lastname, callbackSuccess, callbackFail) {
      var data = {//token: ApiA.getToken(),
                  login: teacherLogin,
                  password: password,
                  firstname: firstname,
                  lastname: lastname
                  };
      fetch(URL, {
        method: 'POST',
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

    deleteTeacher(teacherLogin, callbackSuccess, callbackFail) {
      //var data = { token: token };
      fetch(URL + teacherLogin, {
        method: 'DELETE',
        credentials:'include',
        //body: JSON.stringify(data),
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
    
    updateTeacher(teacherLogin, password, firstname, lastname, callbackSuccess, callbackFail) {
      var data = {//token: ApiA.getToken(),
                  login: teacherLogin,
                  password: password,
                  firstname: firstname,
                  lastname: lastname
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

    getTeachersLogins(callback) {
      fetch(URL + "logins", {
        method: 'GET',
        credentials:'include',
        headers:{
        //'token': token,
        'Content-Type': 'application/json'
        }})
        .then(response => response.json())
        .then(data => {
          callback(data);
      }).catch(err => callback(null));
    },
}