const jwt = require('jsonwebtoken');
const fs   = require('fs');

function checkJwt(req, res, next) {
    var excludeTokenRoutes = ['/auth/login', '/auth/register', '/auth/verify', '/api-docs'];
    
    if (excludeTokenRoutes.includes(req.path)) {
        next();
    } else {
        var token = '';
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization;
            // Remove Bearer from string
            token = req.headers.authorization.slice(7, token.length);
        }

        var publicKey = fs.readFileSync('./config/jwt/public.pem');
        var decoded = jwt.verify(token, publicKey, { expiresIn:  process.env.JWT_EXPIRES_IN, algorithm: process.env.JWT_ALGORITHM }, function (err, payload) {
            if (err) {
                res.status(401).json({'message': err.message}).end();
            } else {
                next();
            }
        });
    }
}

module.exports = checkJwt;