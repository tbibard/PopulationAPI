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

/**
 * @swagger
 * 
 * /region:
 *    get:
 *      description: Redirect on population for last year with default classe age
 */
router.get('/:region', function (req, res) {

  connection.query('SELECT max(annee) as annee FROM regionale_classe', function (error, results, fields) {
    // error will be an Error if one occurred during the query
    if (error) {
      return next(error);
    }
    res.redirect('/region/'+req.params.region+'/'+results[0].annee+'/classe');
  });
})

router.get('/:region/:year/:classe', function (req, res, next) {
  // Validate region
  var regions = ['01', '02', '03', '04', '06', '11', '24', '27', '28', '32', '44', '52', '53', '75', '76', '84', '93', '94',]
  if (!regions.includes(req.params.region)) {
    const error = new Error('region is not valid !');
    error.httpStatusCode = 412;
    return next(error);
  }
  // Validate classe
  if (!['classe', 'quinquennal'].includes(req.params.classe)) {
    const error = new Error('classe is not valid !');
    error.httpStatusCode = 412;
    return next(error);
  }

  // Build sql query
  var sql = 'SELECT region, annee, sexe, age, population FROM regionale_'+req.params.classe+' WHERE region = ? AND annee = ? ';
  var sqlParams = [req.params.region, req.params.year];
  // Check if request contains query parameters
  if (Object.keys(req.query).length > 0) {
    if (req.query.sexe) {
      sql += 'AND sexe = ?';
      sqlParams.push(req.query.sexe);
    }

    if (req.query.age) {
      sql += 'AND age = ?';
      sqlParams.push(req.query.age);
    }
  }

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