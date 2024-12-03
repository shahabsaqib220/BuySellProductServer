require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routers/registrationUserRouter');
const loginUser = require('./routers/UserLoginRouter');
// Add other imports as necessary...

const app = express();
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Add your API routes
app.use(process.env.API_V1_OAUTH || '/api/auth', authRoutes);
app.use(process.env.API_V2_OAUTH || '/api/login', loginUser);
// Add other routes similarly...

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {});
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

connectDB();

// Export the app for Vercel
module.exports = app;
