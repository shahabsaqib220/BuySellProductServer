const express = require("express");
const router = express.Router();
const Cart = require("../models/UsersCartItemsModel");
const Ad = require("../models/UsersAdsModel");
const authenticate = require("../middleware/authMiddleware"); // Middleware for authentication

// POST /shopping - Add item to cart
router.post("/shopping", authenticate, async (req, res) => {
  const { adId, quantity = 1 } = req.body; // Get adId and quantity from the request body
  const userId = req.userId; // Now correctly get the userId from the request

  try {
    // Check if the ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Format the images properly for the Cart schema
    const images = Array.isArray(ad.images)
      ? ad.images.map((image) => ({ url: image, alt: "Image description" }))
      : [{ url: ad.images, alt: "Image description" }]; // Handle single image case

    // Check if the item is already in the cart
    let cartItem = await Cart.findOne({ userId, adId });
    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create a new cart item
      cartItem = new Cart({
        userId,
        adId,
        adDetails: {
          category: ad.category,
          brand: ad.brand,
          model: ad.model,
          price: ad.price,
          description: ad.description,
          MobilePhone: ad.MobilePhone,
          condition: ad.condition,
          location: ad.location,
          images: images, // Store properly formatted images array
        },
        quantity,
      });
      await cartItem.save();
    }

    res.status(201).json({ message: "Item added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error });
  }
});

router.get("/cart", authenticate, async (req, res) => {
  const userId = req.userId; // Get userId from the authentication middleware

  try {
    const cartItems = await Cart.find({ userId }).populate('adId'); // Populate adId to get ad details
    if (!cartItems) {
      return res.status(404).json({ message: "No cart items found" });
    }
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
});


module.exports = router;
