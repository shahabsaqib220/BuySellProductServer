const mongoose = require("mongoose");

const changePasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Referencing the User model
    required: true,
  },
  otp: {
    code: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
});

const ChangePassword = mongoose.model("ChangePassword", changePasswordSchema);

module.exports = ChangePassword;
