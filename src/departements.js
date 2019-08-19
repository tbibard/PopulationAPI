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

// Home page route.
router.get('/', function (req, res, next) {
  res.json({message: 'No data !'});
})

router.get('/:region', function (req, res) {

  connection.query('SELECT max(annee) as annee FROM departementale_classe', function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    res.redirect('/departement/'+req.params.region+'/'+results[0].annee+'/classe');
  });
})

router.get('/:departement/:year/:classe', function (req, res, next) {
  // TODO : req.params validation
  // Validate region
  var regions = ['01', '02', '03', '04', '06', '07', '08', '09',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', 
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
    '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '90', '91', '92', '93', '94', '95',
    '971', '972', '973', '974', '976'
  ]
  if (!regions.includes(req.params.departement)) {
    const error = new Error('departement is not valid !');
    error.httpStatusCode = 412;
    return next(error);
  }
  if (!['classe', 'quinquennal'].includes(req.params.classe)) {
    const error = new Error('classe is not valid !');
    error.httpStatusCode = 412;
    return next(error);
  }

  // Build sql query
  var sql = 'SELECT region, annee, sexe, age, population FROM departementale_'+req.params.classe+' WHERE region = ? AND annee = ? ';
  var sqlParams = [req.params.departement, req.params.year];
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