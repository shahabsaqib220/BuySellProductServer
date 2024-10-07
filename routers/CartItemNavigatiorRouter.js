const express = require('express');
const router = express.Router();
const Cart = require('../models/UsersCartItemsModel'); // Cart model

// Route to fetch adId from carts collection
// Route to fetch adId based on a cart ID or user ID
router.get('/adId/:cartId', async (req, res) => {
  try {
    // Get the cart ID from the request parameters
    const cartId = req.params.cartId;

    // Find the adId in the specific cart item
    const cart = await Cart.findOne({ _id: cartId });

    // Check if the cart is found
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Return the adId
    return res.json({ adId: cart.adId });
  } catch (error) {
    console.error('Error fetching adId:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;