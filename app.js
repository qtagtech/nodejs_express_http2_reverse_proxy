#!/usr/bin/env node
"use strict";

//module dependencies
const debug = require("debug")("express:server");
const spdy = require('spdy');
const fs = require('fs');
const express  = require('express');
const httpProxy = require('http-proxy');
const ServerOne = 'http://test1.kambi.nrgs.lan';

let apiProxy = httpProxy.createProxyServer();

//create http server
var httpPort = normalizePort(process.env.PORT || 8100);
var app = express();

app.all("/nrgs/adro/*", (req, res) => {
    console.log('redirecting to Server1');
    apiProxy.web(req, res, {target: ServerOne});
});

/*app.get('*', (req, res) => {
    res
      .status(200)
      .json({message: 'ok'})
})*/

app.set("port", httpPort);
// var httpServer = http.createServer(app);
var options = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
}
var httpServer = spdy.createServer(options, app);

//listen on provided ports
httpServer.listen(httpPort);

//add error handler
httpServer.on("error", onError);

//start listening on port
httpServer.on("listening", onListening);


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = port && typeof port === "string"
    ? 'Pipe'
    : 'Port';

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
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
  var addr = httpServer.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}