const express = require('express');
const Message = require('../models/UsersChatModel');
const router = express.Router();
const User = require("../models/userRegistrationModel")
const http = require('http');
const app = express();

const { Server } = require('socket.io');
const cors = require("cors");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


// Get chat history between two users
router.get('/history/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        // Find messages where the users are sender and receiver
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });  // Sort by timestamp

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
});


router.get('/users/data/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, 'name profileImageUrl');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
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

module.exports = router;
