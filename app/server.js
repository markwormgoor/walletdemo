#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./index');
var db = require('./services/MongoService');
var config = require('./config');
var init = require('./init');
var http = require('http');
const mongoClient = require('mongodb').MongoClient;

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
db.connect(config.mongodb.uri, function(err) {
     if (err)
     {
         console.log("Error connecting to MongoDB");
         console.log(err);
         db.close();
         throw(err);
     } else {
         console.log("Successfully connected to MongoDB");
         init.init();
         server.listen(config.express.port, config.express.ip);
         server.on('error', onError);
         server.on('listening', onListening);
     }
 })

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
