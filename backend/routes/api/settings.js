var router = require('express').Router();
const db = require('../../db')
const bodyParser = require('body-parser')
const authenticate = require('../../middleware')

router.use(bodyParser.json())

router.get('/', (req, res) => {
    var query = {
        text: "SELECT * FROM settings"
    }
    
    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching settings")
            res.sendStatus(500)
            return
        }
        if(result.rows.length > 0) {
            res.json(result.rows[0].settings)
        } else {
            res.sendStatus(400)
            return
        }
    });
});


router.put('/', authenticate, (req, res) => {
    var insertQuery = {
        text: "UPDATE settings SET settings = $1",
        values: [req.body.settings]
    }

    db.query(insertQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when inserting settings");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

module.exports = router;