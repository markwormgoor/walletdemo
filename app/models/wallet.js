var agentService = require('../services/AgentService');
const { init } = require('./user');
const webhook_url_init = ['http://localhost:3000/webhooks'];

class Wallet {
    constructor() {
        this.wallet_id = null;
        this.created_at = null;
        this.updated_at = null;
        this.key_management_mode = null;
        this.wallet_type = null;
        this.wallet_name = null;
        this.wallet_webhooks = null;
        this.wallet_dispatchtype = null;
        this.default_label = null;
        this.token = null;
    }

    async init(inputstring) {
        if (inputstring.includes("@")) {
            /*
             * The input is an e-mail address, not a wallet id
             * We need to create a new wallet
             */

            // Create wallet seed
            const Crypto = require('crypto');  
            const key = Crypto.randomBytes(24).toString('base64').slice(0,24);

            // Create wallet
            var walletBuild = {};
            walletBuild['image_url'] = '';
            walletBuild['key_management_mode']='managed';
            walletBuild['label']=inputstring;
            walletBuild['wallet_dispatch_type']='default';
            walletBuild['wallet_key']=key;
            walletBuild['wallet_name']=inputstring;
            walletBuild['wallet_type']='indy';
            walletBuild['wallet_webhook_urls']=webhook_url_init;
            const walletBuildString=JSON.stringify(walletBuild);

            try {
                const result = await agentService.createMultitenantWallet(walletBuildString);
                this.wallet_id = result.wallet_id;
                this.created_at = result.created_at;
                this.updated_at = result.updated_at;
                this.key_management_mode = result.key_management_mode;
                this.wallet_type = result.settings['wallet.type'];
                this.wallet_name = result.settings['wallet.name'];
                this.wallet_webhooks = result.settings['wallet.webhook_urls'];
                this.wallet_dispatchtype = result.settings['wallet.dispatch_type'];
                this.default_label = result.settings['default_label'];
            } catch (err) {
                console.log("Unable to create new wallet: ", err);
                throw err;
            }
        } else {
            try {
                const result = await agentService.getMultitenantWallet(inputstring);
                this.wallet_id = result.wallet_id;
                this.created_at = result.created_at;
                this.updated_at = result.updated_at;
                this.key_management_mode = result.key_management_mode;
                this.wallet_type = result.settings['wallet.type'];
                this.wallet_name = result.settings['wallet.name'];
                this.wallet_webhooks = result.settings['wallet.webhook_urls'];
                this.wallet_dispatchtype = result.settings['wallet.dispatch_type'];
                this.default_label = result.settings['default_label'];
            } catch (err) {
                console.log("Unable to retrieve wallet: " , err);
                throw err;
            }
        }

        try {
            const token = await agentService.getMultitenantWalletToken(this.wallet_id);
            this.token = token;
        } catch (err) {
            console.log("Unable to retrieve wallet token: ", err);
            throw err;
        } 
    }

}

module.exports = Wallet;