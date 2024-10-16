const express = require('express');
const router = express.Router();
const User = require('../models/userRegistrationModel'); // Ensure correct path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const loginMiddleware = require('../middleware/loginMiddleware'); // Adjust the path

// Use the middleware for the login route
router.post('/login', loginMiddleware, async (req, res) => {
  try {
    const user = req.user; // Access user from the middleware

    // Generate token with expiration (e.g., 1 hour)
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
