const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userRegistrationModel'); // Adjust the path to your User model

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the hashed password with the entered password using the model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If password matches, generate a token
    const token = user.generateAuthToken();

    return res.status(200).json({
      success: true,
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
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
