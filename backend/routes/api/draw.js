var router = require('express').Router();
const config = require('../../config/config.js');
const db = require('../../db')
const bodyParser = require('body-parser')
const authenticate = require('../../middleware')

router.use(bodyParser.json())

router.post('/:id', authenticate, (req, res) => {
    var insertQuery = {
        text: "INSERT INTO draw(key, path, report_id, window_side) VALUES ($1, $2, $3, $4)",
        values: [req.body.key, req.body.path, req.params.id, req.body.window_side]
    }

    db.query(insertQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when inserting report" + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

router.delete('/:id', authenticate, (req, res) => {
    var deleteQuery = {
        text: "DELETE FROM draw WHERE report_id = $1 and key = $2 and window_side = $3",
        values: [req.params.id, req.body.key, req.body.window_side]
    };

    db.query(deleteQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when deleting report" + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
    //res.json(result.rows)
})


router.get('/:id', (req, res) => {
    
    var query = {
        text: "SELECT * FROM draw where report_id = $1",
        values: [req.params.id]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching report" + req.params.id + "data")
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
})

router.get('/:id/:side', (req, res) => {
    
    var query = {
        text: "SELECT * FROM draw where report_id = $1 and window_side = $2",
        values: [req.params.id, req.params.side]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching report" + req.params.id + "data for side "+ req.params.side)
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
})

module.exports = router;