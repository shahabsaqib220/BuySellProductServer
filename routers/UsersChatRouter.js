const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Message = require('../models/UsersChatModel');
const User = require('../models/userRegistrationModel');


const secretKeyHex = process.env.SECRET_KEY;  

 
console.log('Length of SECRET_KEY:', secretKeyHex.length); 
const secretKey = Buffer.from(secretKeyHex, 'hex'); 
const algorithm = 'aes-256-cbc';


function encryptMessage(text) {
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`; 
}

// Function to decrypt the message
function decryptMessage(encryptedText) {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return '[Decryption failed]'; 
  }
}

router.post('/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    // Encrypt the message before saving
    const encryptedMessage = encryptMessage(message);

    const newMessage = new Message({
      senderId,
      receiverId,
      message: encryptedMessage,
      seen: false,
    });

    const savedMessage = await newMessage.save();
    console.log(savedMessage);

    // Decrypt the message for sending to clients in plain text
    savedMessage.message = decryptMessage(savedMessage.message);

    // Emit the decrypted message
    req.io.to(receiverId).emit('receiveMessage', savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages/history/:senderId/:receiverId - To get conversation history
router.get('/history/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    // Fetch encrypted messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    // Decrypt each message
    const decryptedMessages = messages.map(msg => {
      const decryptedMessage = decryptMessage(msg.message);
      return decryptedMessage
        ? { ...msg.toObject(), message: decryptedMessage }
        : { ...msg.toObject(), message: '[Decryption failed]' };
    });

    if (!decryptedMessages.length) {
      return res.status(404).json({ message: 'No conversation found' });
    }

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
});

// GET /api/messages/receiver/name/:receiverId - To get receiver's name by ID
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

// PUT /api/messages/markAsSeen - To mark messages as seen
router.put('/markAsSeen', async (req, res) => {
  const { messageIds } = req.body;

  try {
    const messages = await Message.updateMany(
      { _id: { $in: messageIds } },
      { seen: true, seenAt: new Date() }
    );

    if (!messages.matchedCount) {
      return res.status(404).json({ error: 'No messages found to update' });
    }

    messageIds.forEach((messageId) => {
      const updatedMessage = { _id: messageId, seen: true, seenAt: new Date() };
      req.io.emit('messageSeen', updatedMessage);
    });

    res.json({ success: true, message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
