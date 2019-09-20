// importing the dependencies
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Parse .env file
require('dotenv').config();

// defining the Express app
const app = express();
const fs   = require('fs');
const checkJwt = require('./src/middlewares/checkJwt.js');
const auth = require('./src/auth.js')
const region = require('./src/regions.js')
const departement = require('./src/departements.js')
const france = require('./src/france.js')


app.use(compression());

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
var accessLogStream = fs.createWriteStream('logs/access.log', { flags: 'a' })

// adding morgan to log HTTP requests
// app.use(morgan('combined'));
app.use(morgan('combined', { stream: accessLogStream }))

// Check JWT Token
app.use(checkJwt);

// Router /auth
app.use('/auth', auth);
// Router /region
app.use('/region', region);
// Router /departement
app.use('/departement', departement);
// Router /france
app.use('/france', france);

// Error handler
app.use(function(err, req, res, next) {
  if (err.hasOwnProperty('httpStatusCode')) {
    res.status(err.httpStatusCode).json({message: err.message});
  } else {
    res.status(500).json({message: err.message});
  }
});

// starting the server
app.listen(process.env.APP_PORT, () => {
  console.log('listening on port '+process.env.APP_PORT);
});