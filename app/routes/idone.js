var express = require('express');
var router = express.Router();
var db = require ('../services/MongoService');
var agentService = require('../services/AgentService');
const AgentService = require('../services/AgentService');

db.get().collection("settings").find({ name: "identity.one" }).toArray (function (err, results){
  if (err) throw err;
  if (results[0].walletid.length >= 1) {
    ID1settings = results[0];
  }
});

/* Get started with our walkthrough. */
router.get('/register-app', function(req, res, next) {
  res.render('id1-regapp1', { title: 'Identity one: Register your application'});
});

/* Register our global endorser first */

/* Register a new application test */
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

    // Publicly register the application on the ledger, using our public DID
    token = await AgentService.getMultitenantWalletToken(ID1settings.walletid);

    // ERROR: THIS ISNT WORKING - NEEDS TO BE FIXED
    //none = await AgentService.registerNym(DID.result.did, DID.result.verkey, appname, token.token  );
    res.render('id1-regapp1-error', { title: 'Identity one: Register your application', did: DID.result.did, verkey: DID.result.verkey, appname: appname, appmail: appmail, wallet: wallet.wallet_id });
  } else {
    res.render('id1-regapp1', { title: 'Identity one: Register your application'});
  }
});

/* Register a new application test */
router.post('/register-app2', async function(req, res, next) {
  const did = req.body.did;
  const wallet = req.body.wallet;
  const verkey = req.body.verkey;
  const appname = req.body.appname;
  const appmail = req.body.appmail;

  // Publicly register the application on the ledger, using our public DID
  try {
    token = await AgentService.getMultitenantWalletToken(wallet);
    console.log("Trying : ", token);
    res = await AgentService.setPublicDid(did, token.token);
    res.render('id1-regapp2', { title: 'Identity one: Application fully registered', did: did, wallet: wallet, appname: appname, appmail: appmail, verkey: verkey });
  } catch (err){
    console.log(err);
    res.render('id1-regapp1-error', { title: 'Identity one: Register your application', did: did, wallet: wallet, appname: appname, appmail: appmail, verkey: verkey });
  }
});

module.exports = router;
