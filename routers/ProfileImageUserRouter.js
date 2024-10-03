const express = require('express');
const multer = require('multer');
const admin = require('../Controllers/servicesAccount');
const User = require('../models/userRegistrationModel');
const authMiddleware = require('../middleware/authMiddleware');
const serviceAccount = require('../Controllers/servicesAccount')
const router = express.Router();

// Initialize Firebase Admin SDK
const bucket = admin.storage().bucket(); 



// Configure Multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

// Route to update profile image
router.post('/profile-photo', authMiddleware, upload.single('profileImage'), async (req, res) => {
  const userId = req.userId;  // From authMiddleware

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype
      }
    });


    const [fileUrl] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    
    user.profileImageUrl = fileUrl;
    await user.save();

    return res.json({
      message: 'Profile image updated successfully',
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.get('/profile-image', authMiddleware, async (req, res) => {
  const userId = req.userId;  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ 
      profileImageUrl: user.profileImageUrl,
      username: user.name
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update-username', authMiddleware, async (req, res) => {
  const userId = req.userId; 
  const { newName } = req.body; 

  if (!newName) {
    return res.status(400).json({ message: 'New username is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = newName;
    await user.save();

    return res.json({
      message: 'Username updated successfully',
      username: user.name
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
