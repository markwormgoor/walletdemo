var mongoose = require('mongoose');
var config = require('./config');
var agentService = require('./services/AgentService');

mongoose.connect(config.mongodb.uri, { useNewUrlParser: true ,useUnifiedTopology: true })
.then(() => {
  console.log("Connected to MongoDB server.");
  dropSettingsCollection();
  const delWallets = async() => {
    const result = await deleteAllWallets();
  }
  delWallets();
}).catch((err) => {
  console.log("Error connecting to MongoDB");
  console.log(err);
  throw(err);
});


function dropSettingsCollection () {
  mongoose.connection.db.dropCollection('Settings', function(err, delOK) {
    if (! err) {
      console.log("Deleted DB collection: settings: ", delOK);
    }
  });
  mongoose.connection.db.dropCollection('User', function(err, delOK) {
    if (! err) {
      console.log("Deleted DB collection: settings: ", delOK);
    }
  });
}

async function deleteAllWallets() {
  const list = await agentService.listMultitenantWallets();
  list.results.forEach(element => {
    const delWallet = async() => {
      const result = await agentService.deleteMultitenantWallet(element.wallet_id);
      console.log ("Deleted wallet: " + element.wallet_id + " ", result);
    }
    delWallet(element.wallet_id);
  });
}
