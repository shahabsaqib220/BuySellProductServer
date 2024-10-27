// models/resetOtpModel.js
const mongoose = require("mongoose");

const resetOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

resetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically remove expired OTPs

const ResetOtp = mongoose.model("ResetOtp", resetOtpSchema);
module.exports = ResetOtp;
