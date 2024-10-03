const express = require('express');
const router = express.Router();
const Ad = require("../models/UsersAdsModel");

router.get('/:category', async (req, res) => {
    try {
        const products = await Ad.find({ category: req.params.category }).limit(5); // Fetch up to 5 products
        res.json(products);
    } catch (error) {
        console.error("Error fetching other products:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching other products' });
    }
});

module.exports = router;
