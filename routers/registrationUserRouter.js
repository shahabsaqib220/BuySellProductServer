const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const Otp = require('../models/OtpModel'); // OTP Model
const User = require('../models/userRegistrationModel'); // User model
require('dotenv').config();

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // You can use any email service (like Yahoo, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address from which OTP will be sent
    pass: process.env.EMAIL_PASSWORD, // Your email password or App-specific password for security
  },
});

// POST /send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndDelete({ email });

    const newOtp = new Otp({
      email,
      otp,
      expiresIn,
    });

    await newOtp.save();

    const mailOptions = {
      from: 'shahabsaqib220@gmail.com',
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
      }
      return res.json({ message: 'OTP sent successfully!' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});
// POST /verify-otp
// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
    const { otp, email } = req.body;
  
    try {
      // Retrieve OTP from the database
      const otpRecord = await Otp.findOne({ email });
  
      if (!otpRecord) {
        return res.status(400).json({ code: 'OTP_NOT_FOUND', message: 'OTP not found or expired' });
      }
  
      // Check if the OTP has expired
      if (Date.now() > otpRecord.expiresIn) {
        await Otp.findOneAndDelete({ email }); // Delete expired OTP
        return res.status(400).json({ code: 'OTP_EXPIRED', message: 'OTP has expired' });
      }
  
      // Verify the OTP
      if (otp !== otpRecord.otp) {
        return res.status(400).json({ code: 'INVALID_OTP', message: 'Invalid OTP' });
      }
  
      // OTP is valid, proceed to the next step (e.g., account creation)
      await Otp.findOneAndDelete({ email });
  
      return res.json({ message: 'OTP verified successfully!' });
    } catch (error) {
      console.error('Error in verify-otp:', error);
      return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});

router.post('/register', async (req, res) => {
  const { name, email, password, securityQuestions } = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed automatically
      securityQuestions, // Answers will be hashed in the pre-save hook
    });

    // Save the user to the database
    await newUser.save();

    // Optional: Clear OTP after successful registration
    await Otp.findOneAndDelete({ email });

    return res.json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});






module.exports = router;





