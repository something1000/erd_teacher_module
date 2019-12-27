var router = require('express').Router();
const db = require('../../db')
const bodyParser = require('body-parser')
const authenticate = require('../../middleware')
const fs = require('fs');

router.use(bodyParser.json())

router.get('/', authenticate, (req, res) => {
    var query = {
        text: "SELECT * FROM term ORDER BY active desc"
    }
    
    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching all terms")
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/active', authenticate, (req, res) => {
    var query = {
        text: "SELECT * FROM term WHERE active=true ORDER BY code"
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching all active terms")
            console.log(err)
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/your', authenticate, (req, res) => {
    var login = req.login;
    var query = {
        text: "SELECT * FROM term WHERE (active=true and teacher=$1) ORDER BY code",
        values: [login]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching all your terms")
            console.log(err)
            res.sendStatus(500)
            return
        }
        res.status(200).json(result.rows)
    });
});

router.get('/:id', authenticate, (req, res) => {
    var termID = req.params.id;

    var query = {
        text: "SELECT * FROM term WHERE id=$1",
        values: [termID]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching " + termID + " from terms")
            res.sendStatus(500)
            return
        }
        res.status(200).json(result.rows)
    });
});

router.post('/', authenticate, (req, res) => {
    var insertQuery = {
        text: "INSERT INTO term(code, day, hour, year, active, teacher, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        values: [req.body.code, req.body.day, req.body.hour, req.body.year, req.body.active, req.body.teacher, req.body.deadline]
    }

    db.query(insertQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when inserting term" + req.body.code + " data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

router.delete('/:id', authenticate, async (req, res) => {

    const getAllReportsOnTerm = {
        text: "SELECT image_src FROM report WHERE term_id = $1",
        values: [req.params.id]
    };

    var deleteQuery = {
        text: "DELETE FROM term WHERE id = $1",
        values: [req.params.id]
    };

    await db.query(getAllReportsOnTerm)
        .then(result => {
            result.rows.forEach(element => {
                removeFile(element.image_src)
            });
        })
        .catch(ex => {})

    await db.query(deleteQuery)
      .then(result => {
            res.sendStatus(200)
            res.end();
            return
        })
      .catch(err => {
            console.log("Error when deleting term" + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            res.end();
            return;
        });
});

router.put('/:id', authenticate, (req, res) => {
    var updateQuery = {
        text: "UPDATE term \
                      SET code = $1, day = $2, hour = $3, year = $4, active = $5, teacher = $6, deadline = $7 \
                      WHERE id = $8",
        values: [req.body.code, req.body.day, req.body.hour, req.body.year, req.body.active, req.body.teacher, req.body.deadline, req.params.id]
    };

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating term " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

function removeFile(path){
    if(path){
        fs.unlink("erd_images/" + path, (error) => {
            if(error){
                console.log("Failed to remove file");
                console.log(error);
            }
        });
    }
}

module.exports = router;