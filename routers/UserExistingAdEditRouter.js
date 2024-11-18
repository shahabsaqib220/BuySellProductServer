const express = require('express');
const router = express.Router();
const Ad = require('../models/UsersAdsModel'); // Adjust the path to your Ad model
const authMiddleware = require('../middleware/authMiddleware'); // Middleware to verify JWT token
const admin = require('../Controllers/servicesAccount'); // Reuse the initialized admin instance
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // For generating unique filenames

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Update Ad Route
router.put('/user/ad/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  const adId = req.params.id;

  // Extract update data from the request body
  const updateData = req.body;

  try {
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket();
      const imageUrls = [];

      for (const file of req.files) {
        const blob = bucket.file(`ads/${uuidv4()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        // Upload the file to Firebase
        await new Promise((resolve, reject) => {
          blobStream.on('error', (error) => reject(error));
          blobStream.on('finish', () => {
            // Get the public URL of the uploaded file
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            imageUrls.push(publicUrl);
            resolve();
          });
          blobStream.end(file.buffer);
        });
      }

      // Update the images in the updateData
      updateData.images = imageUrls;
    }

    // Handle location data if provided and validate
    if (updateData.location) {
      let locationData;

      // Check if location is a string and parse it
      try {
        locationData = JSON.parse(updateData.location);
      } catch (error) {
        return res.status(400).json({ message: "Invalid location data format" });
      }

      // Ensure that human-readable location and coordinates are provided and valid
      if (!locationData.readable || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
        return res.status(400).json({ message: "Invalid location data provided" });
      }

      // Format the location into GeoJSON
      updateData.location = {
        type: 'Point',
        coordinates: [locationData.coordinates[0], locationData.coordinates[1]], // Longitude, Latitude
        readable: locationData.readable, // Human-readable address
      };
    }

    // Find the ad by ID and update it
    const updatedAd = await Ad.findByIdAndUpdate(adId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Validate the update against the model
    });

    if (!updatedAd) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json(updatedAd);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
