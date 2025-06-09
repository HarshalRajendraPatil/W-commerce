const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  likeReview,
  getProductReviewAnalytics,
  getReviewAnalyticsOverview,
  getVendorProductReviews,
  respondToReview
} = require('../controllers/review.controller');

const router = express.Router();

// Public routes
router.get('/',  getReviews);
router.get('/vendor', protect, authorize('vendor'), getVendorProductReviews);
router.get('/:id', getReview);

// Customer routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, likeReview);

// Vendor routes
router.post('/:id/respond', protect, authorize('vendor'), respondToReview);

// Admin routes
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/reject', protect, authorize('admin'), rejectReview);
router.get('/analytics/products/:productId', protect, getProductReviewAnalytics);
router.get('/analytics/overview', protect, authorize('admin'), getReviewAnalyticsOverview);

module.exports = router; 