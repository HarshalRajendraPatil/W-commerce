const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

// All wishlist routes require authentication
router.use(protect);

// Get wishlist and add to wishlist
router.route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.isInWishlist);

// Remove from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router; 