const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route to get all ads posted by the authenticated user
// In your ads route (backend)
router.get('/myads', authMiddleware, async (req, res) => {
  const { page = 1, limit = 8 } = req.query; // Default values for page and limit

  try {
    const adsCount = await Ad.countDocuments({ userId: req.userId, adStatus: "available" });
    const ads = await Ad.find({ userId: req.userId, adStatus: "available" })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      ads,
      totalAds: adsCount, // Send total count for pagination
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
});

router.get('/edit/user/ad/:id', authMiddleware, async (req,res) =>{
  // First we can get the Id of the ad we want to edit, from the client side.
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }





})





module.exports = router;
