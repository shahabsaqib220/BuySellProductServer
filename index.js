const express = require('express');
const app = express();

// Basic route for testing Vercel deployment
app.get('/', (req, res) => {
  res.send('Hello from Express');
});

// Exporting the app for Vercel
module.exports = app;
