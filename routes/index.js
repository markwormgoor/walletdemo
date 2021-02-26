var express = require('express');
const { listMultitenantWalletConnections } = require('../services/AgentService');
var router = express.Router();
var agentService = require('../services/AgentService');

/* Get started with our walkthrough. */
router.get('/', function(req, res, next) {
  res.redirect  ('/wallet');
});

/* Delete my session and restart */
router.get('/restart', function(req, res, next) {
  req.session.destroy();
  res.redirect  ('/wallet');
});

/* Display my current wallet */
router.get('/wallet', function(req, res, next) {
  if (req.session.wallet) {
    conns = listMultitenantWalletConnections(req.session.wallet.token);
    res.render('wallet', { title: 'Afoo Demo: Wallet', wallet: req.session.wallet});
  } else {
    res.render('walletmissing', { title: 'Afoo Demo: No Wallet'});
  }
});

/* Create a new wallet */
router.post('/wallet', async function(req, res, next) {
  const Crypto = require('crypto');
  key = Crypto.randomBytes(24).toString('base64').slice(0,24);

  // Create wallet
  var walletBuild = {};
  walletBuild['image_url'] = 'https://aforceof.one/favicon.png';
  walletBuild['key_management_mode']='managed';
  walletBuild['label']=req.body.name;
  walletBuild['wallet_dispatch_type']='default';
  walletBuild['wallet_key']=key;
  walletBuild['wallet_name']=req.body.email;
  walletBuild['wallet_type']='indy';
  walletBuild['wallet_webhook_urls']=['http://localhost:8022/webhooks'];
  const walletBuildString=JSON.stringify(walletBuild);

  try {
    const wallet = await agentService.createMultitenantWallet(walletBuildString);
    req.session.wallet=wallet;
    res.redirect  ('/wallet');
  } catch (error) {
    next (error);
  }
});

/* List all wallet */
router.get('/wallets', async function(req, res, next) {
  try {
    const wallets = await agentService.listMultitenantWallets();
    res.render('walletlist', { title: 'Afoo Demo: Wallet List', wallets: wallets['results']});
  } catch (error) {
    next (error);
  }
});

/* Adopt a wallet */
router.post('/adopt', async function(req, res, next) {
  try {
    const wallet = await agentService.getMultitenantWallet(req.body.wallet_id);
    req.session.wallet=wallet;
    const token = await agentService.getMultitenantWalletToken(req.body.wallet_id);
    wallet.token = token.token;
    res.redirect  ('/wallet');
  } catch (error) {
    next (error);
  }
});

/* Delete a wallet */
router.post('/delete', async function(req, res, next) {
  try {
    const wallets = await agentService.deleteMultitenantWallets(req.body.wallet_id);
    res.redirect  ('/wallets');
  } catch (error) {
    next (error);
  }
});


module.exports = router;
