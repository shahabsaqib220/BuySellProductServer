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

    res.status(201).json({ message: "Item added to cart successfully", cartItem, adId: ad._id }); // Include adId in the response
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error });
  }
});

router.delete('/:itemId', authenticate, async (req, res) => {
  console.log('UserID:', req.userId); // For debugging
  console.log('ItemID:', req.params.itemId); 
  console.log('Request Params:', req.params); // To see if itemId is passed
  console.log('ItemID:', req.params.itemId); // Check if itemId is undefined
  console.log('UserID:', req.userId); // Check if userId is coming from the middleware
  try {
    const userId = req.userId; // Ensure this matches your auth middleware
    const { itemId } = req.params;

    // Find the cart item with the userId and itemId
    const cartItem = await Cart.findOne({ _id: itemId, userId: userId });

    // Check if the cart item exists and belongs to the user
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found or not authorized' });
    }

    // Delete the cart item
    await Cart.deleteOne({ _id: itemId, userId: userId });

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});







// Endpoint to fetch items from the shopping cart
// Endpoint to fetch items from the shopping cart
router.get("/cart", authenticate, async (req, res) => {
  const userId = req.userId; // Get userId from the authentication middleware

  try {
    // Find the cart items and populate the ad details, excluding deleted ads
    const cartItems = await Cart.find({ userId }).populate('adId');

    // Filter out cart items where the associated ad is deleted
    const validCartItems = cartItems.filter(cartItem => {
      const ad = cartItem.adId;
      return ad && ad.adStatus !== "deleted"; // Only keep items with ads that are not deleted
    });

    if (!validCartItems || validCartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found" });
    }

    // Iterate over valid cart items to construct the response
    const updatedCartItems = await Promise.all(validCartItems.map(async (cartItem) => {
      const ad = cartItem.adId; // Access ad details populated by 'populate'
      const adStatus = ad ? ad.adStatus : "deleted"; // Determine the ad status

      // Construct the response for each cart item
      return {
        _id: cartItem._id, // Include the cart item ID
        adId: ad ? ad._id : null, // Include adId if it exists
        adDetails: ad ? {
          model: ad.model,
          condition: ad.condition,
          price: ad.price,
          location: ad.location,
          images: ad.images // Ensure images are included
        } : {}, // Return an empty object if ad does not exist
        adStatus: adStatus // Include updated ad status
      };
    }));

    res.json(updatedCartItems); // Send the updated cart items
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
});




module.exports = router;