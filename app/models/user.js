//Require Mongoose
var mongoose = require('mongoose');
var Wallet = require ('./wallet');

// Define schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: String,
  passhash: String,
  wallet_id: String,
  created: Date,
  updated: { type: Date, default: Date.now() }
});

UserSchema
.virtual('wallet')
.get (function() {
    var wallet = new Wallet();
    if (this.wallet_id.length > 8) {
        return wallet.init(this.wallet_id);
    } else {
        return wallet.init(this.email);
    }
});

module.exports = mongoose.model('User', UserSchema, 'Users');