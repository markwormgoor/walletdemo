var express = require('express');
var router = express.Router();
var db = require ('../services/MongoService');
var agentService = require('../services/AgentService');

/* Get started with our walkthrough. */
router.get('/register-app', function(req, res, next) {
  res.render('id1-regapp1', { title: 'Identity one: Register your application'});
});

router.post('/register-app', async function(req, res, next) {
  const appname = req.body.appname;
  const appmail = req.body.appmail;
  if (appname.length > 2 && appmail.length > 2) {
    // Create wallet seed
    const Crypto = require('crypto');  
    key = Crypto.randomBytes(24).toString('base64').slice(0,24);

    // Create wallet
    var walletBuild = {};
    walletBuild['image_url'] = '';
    walletBuild['key_management_mode']='managed';
    walletBuild['label']=appname;
    walletBuild['wallet_dispatch_type']='default';
    walletBuild['wallet_key']=key;
    walletBuild['wallet_name']=appmail;
    walletBuild['wallet_type']='indy';
    walletBuild['wallet_webhook_urls']=['http://localhost:3000/webhooks'];
    const walletBuildString=JSON.stringify(walletBuild);
    const wallet = await agentService.createMultitenantWallet(walletBuildString);
    console.log('Created new wallet for application (' + appname + '): ' + wallet.wallet_id)

    const DID = await agentService.createMultitenantWalletDID(wallet.token);
    console.log('Created new DID for application (' + appname + '): ' + DID.result.did);
    console.log('with verification key (' + appname + '): ' + DID.result.verkey);

    // Get our global Endorser DID
    var settingsquery = { name: "identity.one" };
    db.get().collection("settings").find(settingsquery).toArray (function (err, results){
      if (results[0].walletid.length < 1 || err) throw err;
      globalDID = results[0].walletid;
      console.log('Retrieved our global Endorser ID from DB: ' + globalDID);
    });

  } else {
    res.render('id1-regapp1', { title: 'Identity one: Register your application'});
  }
});

module.exports = router;
