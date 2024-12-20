// routes/ads.js
const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel'); 

router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location } = req.query;

    const filterCriteria = {
      ...(category && { category }),
      ...(location && { 'location.readable': location }),
      ...(minPrice && maxPrice && { price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } })
    };

    const ads = await Ad.find(filterCriteria);

    const uniqueCategories = await Ad.distinct('category');
    const uniqueLocations = await Ad.distinct('location.readable');

    res.json({
      ads,
      categories: uniqueCategories,
      locations: uniqueLocations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
