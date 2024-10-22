const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("All Done")
  });
}

module.exports = app;