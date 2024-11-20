const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

// Export the app so Vercel can use it
module.exports = app;
