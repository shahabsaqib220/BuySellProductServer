// middlewares/authMiddleware.js

const User = require('../models/userRegistrationModel'); // Adjust the path as necessary
const bcrypt = require('bcryptjs');

const loginMiddleware = async (req, res, next) => {
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Attach user to request object for later use
    req.user = user;
    
    // Call next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = loginMiddleware;
