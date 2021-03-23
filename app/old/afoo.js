var express = require('express');
var router = express.Router();
var db = require('../services/MongoService');

function isSetupComplete() {
  var settingsquery = { name: "aforceof.one" };
  db.get().collection("settings").find(settingsquery).toArray (function (err, results) {
      if (err) throw err;
      if (results.walletid && results.did) {
        return true;
      } else {
        return false;
      }
  });
}

/* Display our homepage */
router.get('/', function(req, res, next) {
  if (! isSetupComplete()) {
    res.redirect('/afoo/setup')
  } else {
    res.render('afoo-index', { title: 'A force of one: Welcome', list: collections});
  }
});

/* Display our data entry / setup page */
router.get('/setup', function(req, res, next) {
  var settingsquery = { name: "aforceof.one" };
  db.get().collection("settings").find(settingsquery).toArray (function (err, results) {
      if (err) throw err;
      res.render('afoo-setup', { title: 'A force of one: Setup Data', settings: results});
  });
});

module.exports = router;
