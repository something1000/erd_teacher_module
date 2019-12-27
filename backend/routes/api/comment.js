var router = require('express').Router();
const db = require('../../db')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const authenticate = require('../../middleware')

router.use(morgan('short'))

router.use(bodyParser.json())

router.post('/:id', authenticate, (req, res) => {
    var insertQuery = {
        text: "INSERT INTO comment(key, text, priority, position, bounds, report_id, window_side)\
                 VALUES ($1, $2, $3, $4, $5, $6, $7)",
        values: [req.body.key, req.body.text, req.body.priority, req.body.position, 
                 req.body.bounds, req.params.id, req.body.window_side]
    };

    db.query(insertQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when inserting comment " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});


router.put('/:id', authenticate, (req, res) => {
    var updateQuery = {
        text: "UPDATE comment \
                      SET text = $1, priority = $2 \
                      WHERE key = $3 and report_id = $4 and window_side = $5",
        values: [req.body.text, req.body.priority,
                 req.body.key, req.params.id, req.body.window_side]
    };

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating comment " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
    //res.json(result.rows)
});

router.get('/:id', (req, res) => {
    
    var query = {
        text: "SELECT * FROM comment where report_id = $1",
        values: [req.params.id]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching report" + req.params.id + "data")
            console.log(err);
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/:id/:side', (req, res) => {
    
    var query = {
        text: "SELECT * FROM comment where report_id = $1 and window_side = $2",
        values: [req.params.id, req.params.side]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching report" + req.params.id + "data for side " + req.params.side)
            console.log(err);
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var deleteQuery = {
        text: "DELETE from comment \
                      WHERE key = $1 and report_id = $2 and window_side = $3",
        values: [req.body.key, req.params.id, req.body.window_side]
    };

    db.query(deleteQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when deleting comment " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
    //res.json(result.rows)
});

module.exports = router;