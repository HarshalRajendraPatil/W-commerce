const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getProductReviews,
  getTopRatedProducts,
  getRelatedProducts
} = require('../controllers/product.controller');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/top-rated', getTopRatedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);
router.get('/:id/related', getRelatedProducts);

// Protected routes - only vendors and admins can create/update/delete products
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router; 