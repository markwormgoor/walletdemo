//Require Mongoose
var mongoose = require('mongoose');

// Define schema
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  name: String,
  settings: {
      type: Map,
      of: String
  }
});

module.exports = mongoose.model('Settings', SettingsSchema, 'Settings');