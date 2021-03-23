var mongoose = require('mongoose');

var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done();
  mongoose.connection.on("open", function(ref) {
    console.log("Connected to MongoDB server.");
    done()
  })
  mongoose.connection.on("error", function(err) {
    console.log("Could not connect to MongoDB server.");
    done(err);
  })
  state.db = mongoose.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true });
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