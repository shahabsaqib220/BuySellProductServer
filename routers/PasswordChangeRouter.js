const express = require("express");
const User = require("../models/userRegistrationModel");
const ChangePassword = require("../models/ChangePasswordModel"); // New ChangePassword model
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
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
  
  
  module.exports = router;
  

