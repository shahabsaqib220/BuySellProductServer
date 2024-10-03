const express = require('express');
const router = express.Router();
const User = require('../models/userRegistrationModel');
const Ad = require('../models/UsersAdsModel'); 


router.get('/profile-image', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).json({ imageUrl: user.profileImageUrl });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/profile-image', async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const user = await User.findById(req.user.id); 
    if (user) {
      user.profileImageUrl = imageUrl;
      await user.save();
      res.status(200).json({ message: 'Image URL saved' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/ad/:adId', async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    const user = await User.findById(ad.userId);
    
    if (user) {
      res.status(200).json({ name: user.name });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
