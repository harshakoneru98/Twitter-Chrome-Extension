// Importing 'http' package
const http = require('http');

// Importing app variable from app.js
const app = require('./app');

// Importing config file
const config = require('./config');

const port = config.PORT || 8080;

// Creating server
const server = http.createServer(app);

// server.listen() method creates a listener on the specified port or path
server.listen(port);
console.log('Express server started on port %s', server.address().port);
