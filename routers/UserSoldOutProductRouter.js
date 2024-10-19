const express = require('express');
const Ad = require('../models/UsersAdsModel');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.put("/soldout/:adId", authMiddleware, async (req, res) => {
  try {
    const { adId } = req.params;
    const userId = req.userId; // Ensure req.userId is properly set in authMiddleware

    // Find the ad by its ID and ensure that the ad belongs to the specific user who posted it
    const ad = await Ad.findOne({ _id: adId, userId });

    if (!ad) {
      return res.status(400).json({ message: "Ad not found or unauthorized" });
    }

    // Update ad status
    ad.adStatus = "sold";
    const updatedAd = await ad.save();

    return res.status(200).json({ message: 'Ad marked as sold', ad: updatedAd });
  } catch (error) {
    console.error('Error marking ad as sold:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.get('/ads', authMiddleware, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = parseInt(req.query.limit) || 10; // Number of ads per page
  
      // Calculate the starting index for pagination
      const startIndex = (page - 1) * limit;
  
      // Fetch ads where adStatus is true
      const ads = await Ad.find({ adStatus: "sold" })
        .skip(startIndex)
        .limit(limit);
  
      // Get the total count of ads
      const totalAds = await Ad.countDocuments({ adStatus: "available" });
  
      // Return paginated ads
      res.status(200).json({
        ads,
        totalAds,
        currentPage: page,
        totalPages: Math.ceil(totalAds / limit),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ads', error });
    }
  });

module.exports = router;
