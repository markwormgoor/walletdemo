var MongoClient = require('mongodb').MongoClient

var state = {
  db: null,
}

function initializeDB () {
  /* Create collection "settings" if it doesn't exist yet */
    state.db.createCollection("settings", function(err, collection) {
    if (! err) {
      console.log("Initialized DB collection: settings");
    }
  });

}

exports.connect = function(url, done) {
  if (state.db) return done();

  MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true }, function(err, db) {
    if (err) {
        console.log(err);
        done(err);
    } else {
        state.db = db.db();
        initializeDB();
        done();
    }
  })
}

exports.get = function() {
  return state.db;
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null;
      state.mode = null;
      return done(err);
    })
  }
}