// In your routes file (e.g., messages.js)
const express = require('express');
const router = express.Router();
const Message = require('../models/UsersChatModel'); // Assuming you have a Message model
const User = require('../models/userRegistrationModel'); // Assuming you have a User model

// Route to get unique contacts along with profile images by userId
router.get('/receivers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where the user is either the sender or the receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    // Extract unique contact IDs (other user IDs in each message)
    const contactIds = [...new Set(
      messages.map(msg => 
        msg.senderId.toString() === userId ? msg.receiverId.toString() : msg.senderId.toString()
      )
    )];

    // Find user profiles for each unique contactId, including name and profileImageUrl
    const contacts = await User.find(
      { _id: { $in: contactIds } },
      { _id: 1, name: 1, profileImageUrl: 1 } // Select _id, name, and profileImageUrl fields
    ).lean();

    // Map each contact to include contactId along with name and profileImageUrl
    const contactsWithIds = contacts.map(contact => ({
      contactId: contact._id,
      name: contact.name,
      profileImageUrl: contact.profileImageUrl,
    }));

    // Respond with the array of contacts with their IDs, names, and profileImageUrls
    res.json(contactsWithIds);
    console.log(contactsWithIds);
  } catch (error) {
    console.error('Error fetching contact profiles:', error);
    res.status(500).json({ error: 'Failed to fetch contact profiles' });
  }
});

module.exports = router;
