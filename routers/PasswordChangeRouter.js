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
router.post('/verify-old-password', authMiddleware, async (req, res) => {
  const { email, oldPassword } = req.body;  // Changed 'password' to 'oldPassword'

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);  // Compare with 'oldPassword'
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


router.post('/update-questions', async (req, res) => {
  const { email, newQuestions, newAnswers } = req.body;

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Step 2: Validate that the questions are not the same
    if (newQuestions.question1 === newQuestions.question2) {
      return res.status(400).json({ success: false, message: 'Security questions must be different.' });
    }

    if (!newAnswers.answer1 || !newAnswers.answer2) {
      return res.status(400).json({ success: false, message: 'Answers must not be empty.' });
    }

    // Step 3: Hash the new answers
    const hashedAnswer1 = await bcrypt.hash(newAnswers.answer1, 10);
    const hashedAnswer2 = await bcrypt.hash(newAnswers.answer2, 10);

    // Update the user's security questions and hashed answers
    user.securityQuestions = [
      { question: newQuestions.question1, answer: hashedAnswer1 },
      { question: newQuestions.question2, answer: hashedAnswer2 }
    ];

    // Save the updated user information
    await user.save();

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: 'Security questions updated successfully.',
    });

  } catch (error) {
    // Handle any errors
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});






router.post("/verify-otp", authMiddleware, async (req, res) => {
    const { otp } = req.body;
    console.log("otp received:", otp);
  
    try {
      const changePasswordEntry = await ChangePassword.findOne({ userId: req.userId });
      if (!changePasswordEntry) {
        return res.status(400).json({ message: "Invalid or Expired OTP" });
      }
  
      if (changePasswordEntry.otp.code !== parseInt(otp)) {  
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
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
  

