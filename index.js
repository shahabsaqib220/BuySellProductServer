const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require('./middleware/errorHandler');
require('express-async-errors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/UsersChatModel');
require('dotenv').config();
const bodyParser = require('body-parser');

const authRoutes = require('./routers/registrationUserRouter');
const loginUser = require("./routers/UserLoginRouter");
const profileImage = require("./routers/ProfileImageUserRouter");
const authMiddleware = require('./middleware/authMiddleware');
const userAds = require('./routers/UsersAdsRouter');
const userLogin = require('./routers/UserLoginRouter');
const adDelete = require("./routers/DeleteUserAdRouter");
const productList = require('./routers/ProductListRouter');
const OtherRelatedProductRouter = require("./routers/OtherRelatedProductRouter");
const myAdsRouter = require('./routers/UserViewAdsRouter');
const ProductDetailsRouter = require('./routers/ProductDetailsRouter');
const userProfileImage = require('./routers/userProfileImageRouter');
const soldOutRouter = require("./routers/UserSoldOutProductRouter");
const userCartItem = require("./routers/UserCartItemRouter");
const cartItemRouter = require("./routers/CartItemNavigatiorRouter");
const PasswordChangeRouter = require("./routers/PasswordChangeRouter");
const FilteredAdsRouter = require("./routers/FiteredAdsRouter");
const CatagoryAdsRouter = require("./routers/CatagoryAdsRouter");
const UserForgetPasswordRouter = require("./routers/UserForgetPasswordRouter");
const UserChatRouter = require("./routers/UsersChatRouter");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// API Routes
app.use(process.env.API_V1_OAUTH, authRoutes);
app.use(process.env.API_V2_OAUTH, profileImage);
app.use(process.env.API_V3_OAUTH, userAds);
app.use(process.env.API_V4_OAUTH, userLogin);
app.use(process.env.API_V5_OAUTH, productList);
app.use(process.env.API_V6_OAUTH, myAdsRouter);
app.use(process.env.API_V7_OAUTH, adDelete);
app.use(process.env.API_V8_OAUTH, ProductDetailsRouter);
app.use(process.env.API_V9_OAUTH, OtherRelatedProductRouter);
app.use(process.env.API_V10_OAUTH, userProfileImage);
app.use(process.env.API_V11_OAUTH, soldOutRouter);
app.use(process.env.API_V12_OAUTH, userCartItem);
app.use(process.env.API_V13_OAUTH, cartItemRouter);
app.use(process.env.API_V14_OAUTH, PasswordChangeRouter);
app.use(process.env.API_V15_OAUTH, CatagoryAdsRouter);
app.use(process.env.API_V16_OAUTH, FilteredAdsRouter);
app.use(process.env.API_V17_OAUTH, UserForgetPasswordRouter);
app.use(process.env.API_V18_OAUTH, UserChatRouter);

app.get('/', (req, res) => {
  res.send('Hello from Express');
});

// Socket.io Setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join('_');
      socket.join(room);
      console.log(`User joined room: ${room}`);
  });

  socket.on('sendMessage', async (data) => {
      const { senderId, receiverId, message } = data;
      const room = [senderId, receiverId].sort().join('_');

      // Save message to the database
      try {
          const newMessage = await Message.create({
              senderId,
              receiverId,
              message
          });
          io.to(room).emit('receiveMessage', newMessage);  // Emit the saved message with timestamp
      } catch (error) {
          console.error('Error saving message:', error);
      }
  });

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
  socket.on('userTyping', ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join('_');
    socket.to(room).emit('userTyping', { senderId });
});
  socket.on('messageSeen', async ({ messageId, receiverId }) => {
        try {
            // Update the "seen" status in the database
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                { seen: true },
                { new: true }
            );

            if (updatedMessage) {
                const room = [updatedMessage.senderId, receiverId].sort().join('_');
                // Emit an event to notify the sender that the message was seen
                io.to(room).emit('messageSeen', messageId);
                console.log(`Message ${messageId} marked as seen in room: ${room}`);
            }
        } catch (error) {
            console.error('Error marking message as seen:', error);
        }
    });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {});
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error while connecting:', error);
  }
};






// Start the server
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  connectDB();
});
