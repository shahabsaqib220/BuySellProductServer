const express = require('express');
const router = express.Router();
const Message = require('../models/UsersChatModel');
const User = require('../models/userRegistrationModel'); // For fetching user names

// Route to send a message and save it to the database
// Route to send a message and save it to the database
router.post('/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    // Check if a conversation exists between the sender and receiver
    let existingConversation = await Message.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    // If no conversation exists, create the first message as part of the conversation
    if (!existingConversation) {
      existingConversation = await Message.create({ senderId, receiverId, message });
    } else {
      // Otherwise, add the new message to the existing conversation
      const newMessage = await Message.create({ senderId, receiverId, message });
      existingConversation = newMessage;
    }

    res.status(201).json(existingConversation); // Return the sent message
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});


// Route to get conversation history between sender and receiver
router.get('/history/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 }); // Sort messages by timestamp

    // If no conversation found, return an empty array
    if (!messages.length) {
      return res.status(404).json({ message: 'No conversation found' });
    }

    res.json(messages); // Return conversation history
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
});

// Route to get receiver's name by ID
router.get('/receiver/name/:receiverId', async (req, res) => {
  try {
    const user = await User.findById(req.params.receiverId).select('name');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ error: 'Failed to fetch user name' });
  }
});

module.exports = router;
