var router = require('express').Router();
const db = require('../../db');
const bodyParser = require('body-parser');
const authenticate = require('../../middleware')
const bcrypt = require('bcrypt');

router.use(bodyParser.json())

router.post('/', authenticate, (req, res) => {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if(err)
        {
            console.log("Error when using bcrypt");
            res.sendStatus(500);
            return;
        }
        var insertQuery = {
            text: "INSERT INTO teacher(login, password, firstname, lastname) VALUES ($1, $2, $3, $4)",
            values: [req.body.login, hash, req.body.firstname, req.body.lastname]
        }
        db.query(insertQuery)
            .then(result => {
                res.sendStatus(200)
                return
            }).catch(err => {
                console.log("Error when inserting teacher" + req.body.login + " data");
                console.log(err);
                res.sendStatus(500);
            return;
        });
    });
});

router.get('/logins', authenticate, (req, res) => {

    var query = {
        text: "SELECT login FROM teacher",
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching logins from teachers")
            console.log(err);
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/', authenticate, (req, res) => {
    var query = {
        text: "SELECT tr.firstname, tr.lastname, tr.login, string_agg(tm.code, '\n') as term FROM teacher tr \
                LEFT JOIN term tm ON (tr.login=tm.teacher AND tm.active = true) GROUP BY tr.login, tr.firstname, tr.lastname \
                ORDER BY 4 ASC"
    }
    
    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching all teachers")
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/:login', authenticate, (req, res) => {
    var teacherLogin = req.params.login;
    var query = {
        text: "SELECT login, firstname, lastname FROM teacher WHERE login=$1",
        values: [teacherLogin]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching " + teacherLogin + " from teachers")
            console.log(err);
            res.sendStatus(500)
            res.end();
            return
        }
        res.status(200).json(result.rows)
        res.end();
    });
});

router.delete('/:login', authenticate, (req, res) => {
    var deleteQuery = {
        text: "DELETE FROM teacher WHERE login = $1",
        values: [req.params.login]
    };

    db.query(deleteQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when deleting teacher" + req.params.login + " data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

router.put('/', authenticate, (req, res) => {

    if(req.body.password === ""){

        var updateQuery = {
            text: "UPDATE teacher \
                        SET firstname = $1, lastname = $2 \
                        WHERE login = $3",
            values: [req.body.firstname, req.body.lastname, req.body.login]
        };

        db.query(updateQuery)
        .then(result => {
              res.sendStatus(200)
              return
          })
        .catch(err => {
              console.log("Error when updating teacher " + req.body.login + " data");
              console.log(err);
              res.sendStatus(500);
              return;
          });

    } else {

        bcrypt.hash(req.body.password, 10, function (err, hash) {
            if(err)
            {
                console.log("Error when using bcrypt in update teacher");
                res.sendStatus(500);
                return;
            }
            const updateQuery = {
                text: "UPDATE teacher \
                              SET firstname = $1, lastname = $2, password = $3 \
                              WHERE login = $4",
                values: [req.body.firstname, req.body.lastname, hash, req.body.login]
            };
            db.query(updateQuery)
                .then(result => {
                    res.sendStatus(200)
                    return
                }).catch(err => {
                    console.log("Error when updating teacher" + req.body.login + " data");
                    console.log(err);
                    res.sendStatus(500);
                return;
            });
        });
    }



});


module.exports = router;