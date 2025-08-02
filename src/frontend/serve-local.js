#!/usr/bin/env node

/**
 * Simple HTTP server to serve the built frontend locally
 * This avoids HTTPS->HTTP mixed content issues when connecting to localhost:5001
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend server running at http://localhost:${PORT}`);
  console.log(`🔗 Connecting to backend at http://localhost:5001`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log('');
  console.log('💡 This HTTP server avoids HTTPS->HTTP mixed content issues');
  console.log('   when connecting to your local backend.');
});