
var agentService = require('./services/AgentService');
var Settings = require('./models/settings');

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
    return { wallet_id: wallet.wallet_id, did: DID.result.did };
  } catch (err) {
    console.log("Creating Endorser wallet failed.");
    console.log(err);
  }
}

function initializeID1Settings () {
    Settings.findOne({ name: "identity.one" }, function (err, result) {
      if (err || ! result) {
        const setupWallet = async() => {
          const wallet = await initializeEndorserWallet();
          var setting = new Settings ({ name: "identity.one", settings: { wallet_id: wallet.wallet_id, publicdid: wallet.did } });
          setting.save(function (err, setting) {
            if(err) throw err;
            console.log("Inserted settings object into MongoDB");
          });
        }
        setupWallet();
      } else {
        console.log("id1 settings object already exists");
      }
    });
};

exports.init = function(url, done) {
    console.log("Starting application initialization");
    initializeID1Settings();
}
