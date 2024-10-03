const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the LoginUser schema
const loginUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  // Add any other fields as required
});

// Add a method to compare the provided password with the hashed password
loginUserSchema.methods.comparePassword = async function (password) {
  // `this.password` refers to the hashed password stored in the database
  return await bcrypt.compare(password, this.password);
};

// Export the LoginUser model
const LoginUser = mongoose.model('LoginUser', loginUserSchema);

module.exports = LoginUser;
