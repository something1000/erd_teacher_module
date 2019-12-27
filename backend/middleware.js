const jwt = require('jsonwebtoken');
const config = require('./config/config.js');

const secret = global.gConfig.auth.secret;

const authenticate = function(req, res, next) {
    const token = req.cookies.token;
    if(!token) {
        res.status(401).send('No token, no access.');
    }
    else {
        jwt.verify(token, secret, function(err, decoded) {
            if(err){
                res.status(401).send('Invalid token.');
            }
            else {
                req.login = decoded.login;
                next();
            }
        })
    }
}

module.exports = authenticate;