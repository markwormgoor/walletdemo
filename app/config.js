var config = module.exports
var PRODUCTION = process.env.NODE_ENV === 'production'

config.express = {
  port: process.env.EXPRESS_PORT || 3000,
  ip: '127.0.0.1'
}

config.walletagent = {
    hostname: process.env.WALLET_AGENT_HOST || '127.0.0.1',
    portnumber: process.env.WALLET_AGENT_PORT || '8061'
}

config.mongodb = {
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/id1',
}

if (PRODUCTION) {
  config.express.ip = '0.0.0.0'
}

// config.db same deal
// config.email etc
// config.log