// This file serves as the entry point for Vercel serverless functions
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Import the main server logic
const { initializeServer } = require('../app/src/Server');

// Create Express app
const app = express();
const server = createServer(app);

// Configure middleware
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize the server with the Express app and HTTP server
initializeServer(app, server);

// Export the Express app for Vercel
module.exports = app; 