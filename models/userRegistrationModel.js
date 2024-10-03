const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, required: false, default: null },
  securityQuestions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords (for login)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { userId: this._id, email: this.email },  
    process.env.JWT_SECRET,  
    { expiresIn: '24h' }  // Extending to 24 hours for testing
  );
  return token;
};


const User = mongoose.model('User', userSchema);
module.exports = User;
