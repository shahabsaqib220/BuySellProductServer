const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userRegistrationModel');

const loginUser = async (email, password) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with this email:', email);
      throw new Error('Invalid email or password');
    }

    console.log('User found:', user.email); // Debugging

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user.email);
      throw new Error('Invalid email or password');
    }

    console.log('Password match! Logging in user:', user.email);

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'Hi', { expiresIn: '1h' });
    return { message: 'Login successful', token };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
};

module.exports = { loginUser };
