const express = require('express');
const router = express.Router();
const Ad = require("../models/UsersAdsModel");

router.get('/:category', async (req, res) => {
    try {
        // Fetch products by category and ensure adStatus is "available"
        const products = await Ad.find({ 
            category: req.params.category,
            adStatus: "available"  // Only fetch products with status "available"
        }).limit(5); // Fetch up to 5 products

        res.json(products);
    } catch (error) {
        console.error("Error fetching available products:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching available products' });
    }
});

module.exports = router;
