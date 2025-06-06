const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(protect);

// Get cart and add to cart
router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart);

// Update cart item
router.put('/items', cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router; 