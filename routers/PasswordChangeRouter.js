const express = require("express");
const User = require("../models/userRegistrationModel");
const ChangePassword = require("../models/ChangePasswordModel"); 
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require('bcryptjs');

const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// Verify old password
router.post('/verify-old-password', authMiddleware,async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
});


// Generate OTP and send it via email
router.post("/generate-otp", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP and expiration time
    const otpCode = crypto.randomInt(100000, 999999); // 6-digit OTP
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    console.log("otp generated:", otpCode)


    // Check if an OTP for this user already exists, and remove it
    await ChangePassword.findOneAndDelete({ userId: user._id });

    // Save the new OTP in the ChangePassword collection
    const changePasswordEntry = new ChangePassword({
      userId: user._id,
      otp: { code: otpCode, expiresAt: otpExpiresAt },
    });
    await changePasswordEntry.save();

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your OTP for Password Change',
      text: `Your OTP code is ${otpCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
      res.json({ success: true, message: 'OTP sent to your email' });
    });
  } catch (err) {
    console.log('Error generating OTP:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// router.post('/verify-old-password',authMiddleware ,async (req, res) => {
//   const { email, oldPassword } = req.body;

//   try {
//       const user = await User.findOne({ email });

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       // Compare the hashed password in the database with the provided oldPassword
//       const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

//       if (!isPasswordValid) {
//           return res.status(401).json({ message: 'Old password is incorrect' });
//       }

//       res.json({ success: true, message: 'Old password verified successfully' });
//   } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//   }
// });


// Verify OTP and clear from the ChangePassword collection after verification
router.post("/verify-otp", authMiddleware, async (req, res) => {
    const { otp } = req.body; // User-provided OTP
    console.log("otp received:", otp);
  
    try {
      // Fetch the OTP entry for the user from the ChangePassword collection
      const changePasswordEntry = await ChangePassword.findOne({ userId: req.userId });
      if (!changePasswordEntry) {
        return res.status(400).json({ message: "Invalid or Expired OTP" });
      }
  
      // Check if the OTP matches
      if (changePasswordEntry.otp.code !== parseInt(otp)) {  // Ensure correct comparison with parseInt
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      // Check if the OTP has expired
      if (Date.now() > changePasswordEntry.otp.expiresAt) {
        return res.status(400).json({ message: "OTP expired" });
      }
  
      // If OTP is valid and not expired, delete the ChangePassword entry
      await ChangePassword.findByIdAndDelete(changePasswordEntry._id);
  
      res.json({ success: true, message: "OTP verified" });
    } catch (err) {
      console.log('Error verifying OTP:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });


  router.get('/get-questions', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !user.securityQuestions) {
        return res.status(404).json({ message: 'No security questions found for this user' });
      }
  
      // Only send the question text, not the hashed answers
      const questions = user.securityQuestions.map(q => ({ _id: q._id, question: q.question }));
      res.json({ questions });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });


  router.post('/update-password', authMiddleware, async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }
  
    try {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update and hash the new password
      user.password = password;
      await user.save(); // Ensure this triggers the pre('save') hook to hash the password
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating password' });
    }
  });
  
  



router.post('/verify-questions', authMiddleware, async (req, res) => {
  const { answers } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check each answer against the hashed answer in the database
    for (const question of user.securityQuestions) {
      if (!await bcrypt.compare(answers[question._id], question.answer)) {
        return res.status(400).json({ message: 'Incorrect answer to a security question' });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

  
  
  module.exports = router;
  

