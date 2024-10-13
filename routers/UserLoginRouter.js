const express = require('express');
const router = express.Router();
const User = require('../models/userRegistrationModel'); // Make sure this is the correct path
const bcrypt = require('bcryptjs'); // Ensure bcrypt is required
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password); // Explicitly using bcrypt
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
