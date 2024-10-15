// routes/userLogin.js

const express = require('express');
const router = express.Router();
const User = require('../models/userRegistrationModel'); // Make sure this is the correct path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const loginMiddleware = require('../middleware/loginMiddleware'); // Adjust the path

// Use the middleware for the login route
router.post('/login', loginMiddleware, async (req, res) => {
  const user = req.user; // Access user from the middleware

  // Generate token
  const token = user.generateAuthToken();

  // Send token and user data in response
  res.json({
    message: 'Successfully logged in',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      ads: user.ads,
    },
  });
});

module.exports = router;
