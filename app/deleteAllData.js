var db = require('./services/MongoService');
var agentService = require('./services/AgentService');
var config = require('./config');

db.connect(config.mongodb.uri, function(err) {
  if (err)
  {
      console.log("Error connecting to MongoDB");
      console.log(err);
      db.close();
      throw(err);
  } else {
      dropSettingsCollection();
      const delWallets = async() => {
        const result = await deleteAllWallets();
      }
      delWallets();
  }
})


function dropSettingsCollection () {
  /* Create collection "settings" if it doesn't exist yet */
  db.get().collection("settings").drop(function(err, delOK) {
    if (! err) {
      console.log("Deleted DB collection: settings");
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
