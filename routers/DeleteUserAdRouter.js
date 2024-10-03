const express = require('express');
const router = express.Router();
const Ad = require("../models/UsersAdsModel"); 
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/deletead/:id", authMiddleware, async (req, res) => {
    const adId = req.params.id;

    try {
        const ad = await Ad.findOne({ _id: adId }); 

        if (!ad) {
            return res.status(404).json({ message: "Ad not found!" });
        }

       
        await Ad.findByIdAndDelete(adId);
        return res.status(200).json({ message: "Ad has been deleted" });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;
