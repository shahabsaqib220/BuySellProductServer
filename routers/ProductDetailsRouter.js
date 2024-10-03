const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel')


router.get("/ad/:id", async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id).populate('userId'); // If user details are needed
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      console.error("Error fetching ad details:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  module.exports = router;
  