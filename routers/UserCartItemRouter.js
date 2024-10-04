const express = require("express");
const router = express.Router();
const Cart = require("../models/UsersCartItemsModel");
const Ad = require("../models/UsersAdsModel");
const authenticate = require("../middleware/authMiddleware"); // Middleware for authentication

// Endpoint to add items to the shopping cart
router.post("/shopping", authenticate, async (req, res) => {
  const { adId, quantity = 1 } = req.body;
  const userId = req.userId;

  try {
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    const images = Array.isArray(ad.images)
      ? ad.images.map((image) => ({ url: image, alt: "Image description" }))
      : [{ url: ad.images, alt: "Image description" }];

    let cartItem = await Cart.findOne({ userId, adId });

    if (cartItem) {
      cartItem.quantity += quantity;

      // Fetch the latest ad status
      const currentAd = await Ad.findById(adId);
      if (currentAd.adStatus !== cartItem.adStatus) {
        console.log(`Updating cart item adStatus from ${cartItem.adStatus} to ${currentAd.adStatus}`);
        cartItem.adStatus = currentAd.adStatus; // Update cart item's adStatus
      }

      await cartItem.save();
    } else {
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
          images: images,
        },
        quantity,
        adStatus: ad.adStatus, // Set initial adStatus from the ad
      });
      await cartItem.save();
    }

    res.status(201).json({ message: "Item added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error });
  }
});

// Endpoint to fetch items from the shopping cart
router.get("/cart", authenticate, async (req, res) => {
  const userId = req.userId; // Get userId from the authentication middleware

  try {
    // Find the cart items and populate the ad details
    const cartItems = await Cart.find({ userId }).populate('adId');
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found" });
    }

    // Iterate over cart items and check the ad status
    const updatedCartItems = await Promise.all(cartItems.map(async (cartItem) => {
      const ad = cartItem.adId; // Access ad details populated by 'populate'

      if (!ad) {
        cartItem.adStatus = "deleted"; 
      } else if (ad.adStatus === "sold") {
        cartItem.adStatus = "sold"; 
      } else {
        
        cartItem.adStatus = "available"; 
      }

      
      await cartItem.save();

        return cartItem;
    }));

   
    res.json(updatedCartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
});

module.exports = router;
