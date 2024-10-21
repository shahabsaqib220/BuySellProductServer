
const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel'); // Assuming Ad is your mongoose model

// Fetch ads by category
router.get('/:category', async (req, res) => {
  const { category } = req.params;

  try {
    // Use a case-insensitive search to find ads by category
    const ads = await Ad.find({ category: { $regex: new RegExp(category, "i") } });
    
    // Check if ads exist for the category
    if (!ads.length) {
      return res.status(404).json({ message: `No ads found for category: ${category}` });
    }

    // Return ads to the frontend
    res.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
