#!/usr/bin/env node

const http = require('http');
const querystring = require('querystring');
var config = require('./config');
var hostname = config.walletagent.hostname;
var port = config.walletagent.portnumber;

walletid="25d33bcf-3dc6-4a9e-abaa-32edbd9a561d";
DID='3916TVUC18cHRCV1zoaN2v';
verkey='2AawGo5y4aTbBCB981FUEAQrJyWY5A9RmzhUktrZbYae';
token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3YWxsZXRfaWQiOiIyNWQzM2JjZi0zZGM2LTRhOWUtYWJhYS0zMmVkYmQ5YTU2MWQifQ.DRltS-Z_T5Hsj8EjPPx51v9yxQgRC6asxMJpB_jh9vw';
// listDIDs(token);
setPublicDid(DID, token);

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

async function setPublicDid(DID, token) {
  var queryBuild = {};
  queryBuild['did'] = DID;
  const postDataJSON=JSON.stringify(queryBuild);

  /* var postDataQuery = querystring.stringify({
    'did' : DID
  }); */
  var postData = postDataJSON;
  try {
      const response = await httpAsync({
          hostname: hostname,
          port: port,
          path: '/wallet/did/public',
          method: 'POST' ,
          headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
              // 'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData)
          }
      }, postData);
      console.log(response);
      return response;
  } catch (e) {
      console.error(e);
      throw(e);
  }
}

async function listDIDs(token) {
  try {
      const response = await httpAsync({
          hostname: hostname,
          port: port,
          path: '/wallet/did',
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + token
          }
      });
      console.log(response);
      return response;
  } catch (e) {
      console.error(e);
      throw(e);
  }
}
