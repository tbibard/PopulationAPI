var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const fs   = require('fs');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : 'api_auth'
  });

// Use Pool connection ?????
connection.connect();


// Home page route.
router.post('/login', function (req, res) {

    connection.query('SELECT * FROM user WHERE email = ?', [req.body.login], function (error, results) {
        // error will be an Error if one occurred during the query
        if (error) {
            return next(error);
        }
        
        if (results.length == 1) {
            bcrypt.compare(req.body.password, results[0].password).then(function(compare) {
                if (compare) {
                    fs.readFile(process.env.JWT_PRIVATE_KEY, 'utf8', function(err, data) {
                        jwt.sign({ foo: 'bar', value: 'toto' }, { key: data, passphrase: process.env.JWT_PRIVATE_KEY_PASSPHRASE }, { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: process.env.JWT_ALGORITHM }, function(err, token) {
                            // TODO : manage err
                            res.json({token: token});
                        });
                    });        
                } else {
                    res.status(401);
                    res.json({message: 'Check your login/password !'});
                }
            });
        } else {
            res.status(401);
            res.json({message: 'Check your login/password !'});
        }
    });
})

module.exports = router;