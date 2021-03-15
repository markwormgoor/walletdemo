var express = require('express');
var router = express.Router();
var db = require('../services/MongoService');

/* Display my current wallet */
router.get('/', function(req, res, next) {
  db.get().collections(function(err, collections) {
    if (err) {
        console.log(err);
        next(err);
    } else {
      res.render('afoo-index', { title: 'A force of one: testWelcome', list: collections});
    }
  });
});

module.exports = router;
