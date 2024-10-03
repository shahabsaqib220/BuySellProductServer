const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route to get all ads posted by the authenticated user
router.get('/myads', authMiddleware, async (req, res) => {
  try {
    // Fetch ads where userId matches and adStatus is false
    const userAds = await Ad.find({ userId: req.userId, adStatus: "available" });

    if (userAds.length === 0) {
      return res.status(200).json({ message: 'No ads available', ads: [] });
    }

    res.status(200).json({ ads: userAds });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
});

module.exports = router;
