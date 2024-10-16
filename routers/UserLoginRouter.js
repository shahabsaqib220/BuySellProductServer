const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const loginMiddleware = require('../middleware/loginMiddleware');

// Use the middleware for the login route
router.post('/login', loginMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
