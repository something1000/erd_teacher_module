var router = require('express').Router();
const db = require('../../db');
const bodyParser = require('body-parser');
const authenticate = require('../../middleware')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/config.js');

const secret = global.gConfig.auth.secret;

router.use(bodyParser.json())

router.get('/islogged', authenticate, (req, res) => {
    res.json({'login': jwt.decode(req.cookies.token).login}).status(200);
    res.end();
});

router.get('/logout', authenticate, (req, res) => {
    res.clearCookie('token');
    res.status(200);
    res.end();
});

router.post('/authenticate', (req, res) => {    //not blocked by authenticate function because it is the function used to authenticate
    const {login, password} = req.body;
    var query = {
        text: "SELECT password FROM teacher WHERE login=$1",
        values: [login]
    }
    db.query(query, (err, result) => {
        if (err){
            res.status(500).json({
                error: 'Internal error'
              });
        }
        else if (result.rowCount === 0) {
            res.status(401)
              .json({
                error: 'Incorrect login or password'
              });
        }
        else {
            bcrypt.compare(password, result.rows[0].password, function(err, result) {
                if(result === true){
                    const payload = { login };
                    let token = jwt.sign(payload, secret, {
                        expiresIn: '6h'
                    });
                    res.cookie("token", token, {httpOnly: true, secure:false});
                    res.status(200).json(
                        token
                    );
                    return;
                }
                else
                {
                    res.status(401)
                    .json({
                        error: 'Incorrect login or password'
                    });
                }
            })
        }
    })
})

module.exports = router;