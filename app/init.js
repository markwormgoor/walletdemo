var db = require('./services/MongoService');
var agentService = require('./services/AgentService');

function initializeDB () {
  /* Create collection "settings" if it doesn't exist yet */
  db.get().createCollection("settings", function(err, collection) {
    if (! err) {
      console.log("Initialized DB collection: settings");
    }
  });
}

async function initializeEndorserWallet() {
  const Crypto = require('crypto');  
  key = Crypto.randomBytes(24).toString('base64').slice(0,24);

  // Create wallet
  var walletBuild = {};
  walletBuild['image_url'] = '';
  walletBuild['key_management_mode']='managed';
  walletBuild['label']='Identity.one';
  walletBuild['wallet_dispatch_type']='default';
  walletBuild['wallet_key']=key;
  walletBuild['wallet_name']='admin@identity.one';
  walletBuild['wallet_type']='indy';
  walletBuild['wallet_webhook_urls']=['http://localhost:3000/webhooks'];
  const walletBuildString=JSON.stringify(walletBuild);

  try { 
    const wallet = await agentService.createMultitenantWallet(walletBuildString);
    console.log('Created new wallet for our Endorser: ' + wallet.wallet_id)

    const DID = await agentService.createMultitenantWalletDID(wallet.token);
    console.log('Created new DID for our Endorser: ' + DID.result.did);
    return { walletid: wallet.wallet_id, did: DID.result.did };
  } catch (err) {
    console.log("Creating Endorser wallet failed.");
    console.log(err);
  }
}

function initializeID1Settings () {
    var settingsquery = { name: "identity.one" };
    db.get().collection("settings").find(settingsquery).toArray (function (err, results){
        if (err) throw err;
        if (results.length < 1) {
            console.log("id1 settings object does not exist");
            const setupWallet = async() => {
                const wallet = await initializeEndorserWallet();
                const afooSettings = { name: "identity.one", walletid: wallet.walletid, publicdid: wallet.did };                
                db.get().collection("settings").insertOne(afooSettings, function(err, res) {
                    if(err) throw err;
                    console.log("Inserted settings object into MongoDB");
                });
            }
            setupWallet();
        } else {
            console.log("id1 settings object already exists");
        }
    });
}

exports.init = function(url, done) {
    console.log("Starting application initialization");
    initializeDB();
    initializeID1Settings();
}
