const express = require("express");
const router = express.Router();
const Ad = require("../models/UsersAdsModel"); // Adjust the path to your Ad model
const admin = require("../Controllers/servicesAccount"); // Firebase admin instance
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // Generate unique filenames

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Update Ad Route
router.put("/user/ad/:id", upload.array("images", 5), async (req, res) => {
  const adId = req.params.id;
  const updateData = req.body;
  const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

  try {
    const existingAd = await Ad.findById(adId);
    if (!existingAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    let updatedImages = [...existingAd.images]; // Start with existing images
    const newImageUrls = [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket();
      for (const file of req.files) {
        const blob = bucket.file(`ads/${uuidv4()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
        });

        await new Promise((resolve, reject) => {
          blobStream.on("error", reject);
          blobStream.on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            newImageUrls.push(publicUrl);
            resolve();
          });
          blobStream.end(file.buffer);
        });
      }
    }

    // Remove images specified in `removedImages` (URLs)
    for (const imageUrl of removedImages) {
      // Delete from cloud storage
      const fileName = imageUrl.split("/").pop();
      const file = admin.storage().bucket().file(`ads/${fileName}`);
      await file.delete().catch((err) => {
        console.error(`Failed to delete file ${fileName}:`, err.message);
      });

      // Remove from `updatedImages`
      updatedImages = updatedImages.filter((img) => img !== imageUrl);
    }

    // Add new images to the updated list
    updatedImages.push(...newImageUrls);

    // Ensure at least one image exists
    if (updatedImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    updateData.images = updatedImages; // Update the images field in updateData

    // Handle location data if provided
    if (updateData.location) {
      let locationData;
      try {
        locationData = JSON.parse(updateData.location);
      } catch (error) {
        return res.status(400).json({ message: "Invalid location data format" });
      }

      if (
        !locationData.readable ||
        !Array.isArray(locationData.coordinates) ||
        locationData.coordinates.length !== 2
      ) {
        return res.status(400).json({ message: "Invalid location data provided" });
      }

      updateData.location = {
        type: "Point",
        coordinates: [locationData.coordinates[0], locationData.coordinates[1]],
        readable: locationData.readable,
      };
    }

    // Update the ad in the database
    const updatedAd = await Ad.findByIdAndUpdate(adId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Ad updated successfully",
      ad: updatedAd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while updating the ad", error: error.message });
  }
});

module.exports = router;
