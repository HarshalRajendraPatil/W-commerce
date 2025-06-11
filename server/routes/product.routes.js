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
  getRelatedProducts,
  getVendorProducts,
  updateProductStock,
  updateProductStatus,
  toggleFeaturedStatus
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

// Vendor specific routes
router.get('/vendor/products', protect, authorize('vendor', 'admin'), getVendorProducts);
router.patch('/:id/stock', protect, authorize('vendor', 'admin'), updateProductStock);
router.patch('/:id/status', protect, authorize('vendor', 'admin'), updateProductStatus);

// Admin specific routes
router.patch('/:id/featured', protect, authorize('admin'), toggleFeaturedStatus);

// Protected routes - only vendors and admins can create/update/delete products
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router; 