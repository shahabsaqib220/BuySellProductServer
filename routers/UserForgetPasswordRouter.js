const express = require("express");
const router = express.Router();
const User = require("../models/userRegistrationModel");
const ResetOtp = require("../models/ResetOtpModel"); // Import the ResetOtp model
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
require("dotenv").config();

router.post("/find", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

// Send OTP to the User's Email
router.post("/send-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a 6-digit OTP and set expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Update OTP if email already exists, otherwise create a new entry
    await ResetOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP via email using Nodemailer and wrap in a Promise
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. This OTP is valid for 2 minutes.`,
    };

    // Use a Promise for transporter.sendMail
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    // Return success response after email is sent
    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find OTP record for the provided email and OTP, ensuring it has not expired
    const otpRecord = await ResetOtp.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if the OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await ResetOtp.deleteOne({ email, otp }); // Remove expired OTP
      return res.status(400).json({ error: "OTP expired" });
    }

    // OTP is valid and not expired, so remove it from the database
    await ResetOtp.deleteOne({ email, otp });

    // Respond with success message
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetch-security-questions", async (req, res) => {
  const { email } = req.query; // Assume email is passed as a query parameter

  try {
    const user = await User.findOne({ email });

    if (!user || !user.securityQuestions) {
      return res.status(404).json({ error: "User or security questions not found" });
    }

    // Return only the questions without the answers
    const questions = user.securityQuestions.map(q => ({ question: q.question }));
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Verify answers to the security questions
router.post("/verify-security-answers", async (req, res) => {
  const { email, answers } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.securityQuestions) {
      return res.status(404).json({ error: "User or security questions not found" });
    }

    // Call the `compareSecurityAnswers` method
    const isValid = await user.compareSecurityAnswers(answers);

    if (!isValid) {
      return res.status(400).json({ error: "Incorrect answers" });
    }

    res.json({ message: "Security answers verified successfully" });
  } catch (error) {
    console.error("Error verifying security answers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.put('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword; // This will trigger the pre-save hook to hash the password
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;
