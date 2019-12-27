var router = require('express').Router();
const db = require('../../db')
const bodyParser = require('body-parser')
const authenticate = require('../../middleware')
const jwt = require('jsonwebtoken');
const config = require('../../config/config.js');
const fs = require('fs');

const secret = global.gConfig.auth.secret;

router.use(bodyParser.json())

router.get('/', authenticate, (req, res) => {
    var query = {
        text: "SELECT id, SendDate, Confirmed, Notes, Rating, Shared, \
                      student_id, term_id, rate_done, version \
                FROM report"
    }
    
    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching all reports")
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

router.get('/stats/:termID', authenticate, (req, res) => {
    var termID = req.params.termID;

    var query = {
        text: "SELECT SUM(CASE WHEN rate_done = true THEN 1 ELSE 0 END) AS rated, \
                      COUNT(1) AS all \
               FROM report WHERE term_id = $1 AND confirmed = true",
        values: [termID]
    };

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching count all reports with termID:" + termID)
            res.sendStatus(500)
            return
        }
        res.json(result.rows[0])
    });
});


router.get('/:id', (req, res) => {
    var reportID = req.params.id;

    const token = req.cookies.token;
    var query = {
        text: "SELECT * FROM report WHERE id=$1",
        values: [reportID]
    }
    
    var report;
    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching" + reportID + " report")
            res.sendStatus(500)
            return
        }
        report = result.rows[0]
        if(!report) return res.sendStatus(404);

        report_nonshared = {id: report.id, senddate: report.senddate,
                            student_id: report.student_id, term_id: report.term_id,
                            image_src:report.image_src, confirmed:report.confirmed,
                            shared:report.shared, json_report: report.json_report}
        if(!token) {
            if(report.shared) return res.json(report);
            else return res.json(report_nonshared)
        }
        else {
            jwt.verify(token, secret, function(err, decoded) {
                if(err){
                    if(report.shared) return res.json(report);
                    else return res.json(report_nonshared)
                }
                else {
                    return res.json(report)
                }
            })
        }
        
    });
});

router.get('/term/:id', (req, res) => {
    var termID = req.params.id;

    var query = {
        text: "SELECT R.* FROM report R \
               JOIN student S ON S.index = R.student_id AND S.term_id = $1",
        values: [termID]
    }

    db.query(query, (err, result) => {
        if (err){
            console.log("Error when fetching reports for term: "+ termID)
            res.sendStatus(500)
            return
        }
        res.json(result.rows)
    });
});

//udostępianie raportu z oceną, uwagami, błędami, itp.
router.put('/share', authenticate, (req, res) => {
    var updateQuery = {
        text: "UPDATE report \
                      SET shared = $1 \
                      WHERE id = $2",
        values: [req.body.shared, req.body.reportID]
    };

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating report " + req.body.reportID + " data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

//uwagi i ocena do raportu dodane przez prowadzącego
// zapisz i oznacz jako oceniona
router.put('/note/:id', authenticate, (req, res) => {

    if(!req.body.rate_done){
        updateQuery = { // zapisz
            text: "UPDATE report \
                        SET notes = $1, rating = $2 \
                        WHERE id = $3",
            values: [req.body.notes, req.body.rating, req.params.id]
        };
    }
    else {
        updateQuery = { // oznacz jako oceniona
            text: "UPDATE report \
                        SET notes = $1, rating = $2, rate_done = $3 \
                        WHERE id = $4",
            values: [req.body.notes, req.body.rating, req.body.rate_done, req.params.id]
        };
    }

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating report " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

router.put('/undone/:id', authenticate, (req, res) => {

    var updateQuery = {
        text: "UPDATE report \
                    SET rate_done = $1 \
                    WHERE id = $2",
        values: [req.body.rate_done, req.params.id]
    };

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating (undone) report " + req.params.id);
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

router.put('/move', authenticate, (req, res) => {
    var updateQuery = {
        text: "UPDATE report \
                      SET term_id = $1 \
                      WHERE id = $2",
        values: [req.body.term, req.body.report]
    };


    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating report data XD");
            console.log(err);
            res.sendStatus(500);
            return;
        });
});

//potwierdzenie przez studenta
router.put('/confirm', (req, res) => {  

    var updateQuery = {
        text: "UPDATE report \
                      SET confirmed = $1 \
                      WHERE id = $2",
        values: [req.body.confirmed, req.body.reportID]
    };

    db.query(updateQuery)
      .then(result => {
            res.sendStatus(200)
            return
        })
      .catch(err => {
            console.log("Error when updating report " + req.params.id + "data");
            if(err.code == '09000') return res.status(400).json("other confirmed");
            else return res.sendStatus(500);
        });
});

router.delete('/:id', authenticate, async (req, res) => {
    const getImageName = {
        text: "SELECT image_src FROM report WHERE id = $1",
        values: [req.params.id]
    };

    const deleteQuery = {
        text: "DELETE FROM report \
                      WHERE id = $1",
        values: [req.params.id]
    };

    await db.query(getImageName)
        .then(result =>{
            if(result.rowCount === 1){
                removeFile(result.rows[0].image_src)
            }
        })
        .catch(err => {
        });
    await db.query(deleteQuery)
      .then(result => {
            res.sendStatus(200)
            res.end();
            return
        })
      .catch(err => {
            console.log("Error when deleting report " + req.params.id + "data");
            console.log(err);
            res.sendStatus(500);
            res.end();
            return;
        });
    return;
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