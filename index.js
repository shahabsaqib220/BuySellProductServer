const express = require('express');
const app = express();

// Test route to check if the server is working
app.get('/', (req, res) => {
  res.send('Hello from Express');
});

// Export the app for Vercel to use
module.exports = app;
