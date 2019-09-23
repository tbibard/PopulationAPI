var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_DATABASE
});

// Use Pool connection ?????
connection.connect();

router.get('/', function (req, res, next) {
  res.json({message: 'No data !'});
})

router.get('/:type/:year', function (req, res, next) {
  // Validate type
  var types = ['regions', 'departements']
  if (!types.includes(req.params.type)) {
    const error = new Error('type is not valid !');
    error.httpStatusCode = 412;
    return next(error);
  }
  var table = '';
  if (req.params.type === 'regions') {
    table = 'regionale';
  } else {
    table = 'departementale';
  }

  // Build sql query
  var sql = 'SELECT region, annee, SUM(population) as population FROM '+table+'_classe WHERE annee = ? GROUP BY region';
  var sqlParams = [req.params.year];

  var results = '';
  connection.query(sql, sqlParams, 
    function (error, rows, fields) {
    // error will be an Error if one occurred during the query
    if (error) {
      return next(error);
    }

    res.json(rows);
  });

})

module.exports = router;