const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel'); // Import the Ad model

// Route to fetch all ads with user profile image where adStatus is false
router.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.find({ adStatus: "available" })// Filter ads where adStatus is false
      .populate('userId', 'profileImageUrl'); // Populate profileImageUrl from users

    res.status(200).json(ads); // Return ads with user data, including location and user profile
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
});

module.exports = router;
