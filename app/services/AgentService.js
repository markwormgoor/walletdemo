const http = require('http');
const querystring = require('querystring');

var config = require('../config');
var hostname = config.walletagent.hostname;
var port = config.walletagent.portnumber;

function httpAsync(options, body) {
    console.log("httpAsync call with options: ", options, "and body: ", body);
    return new Promise(function (resolve, reject) {
        const req = http.request(options, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let e;
            if (statusCode !== 200) {
                e = new Error('Request Failed.\n' + `Status Code: ${statusCode}` + ': ' + res.statusMessage);
            } else if (!/^application\/json/.test(contentType)) {
                e = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (e) {
                // Consume response data to free up memory
                res.resume();
                return reject(e);
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    return resolve(parsedData);
                } catch (e) {
                    return reject(e);
                }
            });
        }).on('error', (e) => {
            return reject(e);
        });
        
        if (body) {
            req.write(body || '');
        }
        
        req.end();
    });
}

class AgentService {
    async registerNym(DID, verkey, alias, endorserToken) {
        var requestData = {};
        requestData['did'] = DID;
        requestData['verkey']=verkey;
        requestData['alias']=alias;
        console.log("Token: ", endorserToken, " Request: ", requestData);
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/ledger/register-nym',
                method: 'POST',
                headers: {'Authorization': 'Bearer ' + endorserToken}
            }, querystring.stringify(requestData));
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async setPublicDid(DID, token) {
        var postData = JSON.stringify({
            'did' : DID
        });
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/wallet/did/public',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, postData
            );
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async createMultitenantWallet(walletIn) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallet',
                method: 'POST'
            }, walletIn);
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async listMultitenantWallets() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallets',
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    async getMultitenantWallet(wallet_id) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallet/' + wallet_id,
                method: 'GET'
            });
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async getMultitenantWalletToken(wallet_id) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallet/' + wallet_id + '/token',
                method: 'POST'
            });
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async deleteMultitenantWallet(wallet_id) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallet/' + wallet_id + '/remove',
                method: 'POST'
            }, "{}");
            return response;
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    async listMultitenantWalletConnections(token) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections',
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + token}
            });
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async createMultitenantWalletDID(token) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/wallet/did/create',
                method: 'POST',
                headers: {'Authorization': 'Bearer ' + token}
            });
            return response;
        } catch (e) {
            console.error(e);
            throw(e);
        }
    }

    async getStatus() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/status',
                method: 'GET'
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getConnections() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections',
                method: 'GET'
            });
            return response.results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createInvitation() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections/receive-invitation',
                method: 'POST'
            }, invitation);
            return response;
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    async receiveInvitation(invitation) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections/receive-invitation',
                method: 'POST'
            }, invitation);
            return response;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async removeConnection(connectionId) {
        try {
            await httpAsync({
                hostname: hostname,
                port: port,
                path: `/connections/${connectionId}/remove`,
                method: 'POST'
            });
        } catch (error) {
            console.error(error);
        } finally {
            return;
        }
    }

    async getProofRequests() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/present-proof/records',
                method: 'GET'
            });
            return response.results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async sendProofRequest(proofRequest) {
        try {
            await httpAsync({
                hostname: hostname,
                port: port,
                path: '/present-proof/send-request',
                method: 'POST'
            }, proofRequest);
        } catch (error) {
            console.error(error);
        } finally {
            return;
        }
    }
}

module.exports = new AgentService();