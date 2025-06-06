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
  getReviewAnalyticsOverview
} = require('../controllers/review.controller');

const router = express.Router();

// Public routes
router.get('/',  getReviews);
router.get('/:id', getReview);

// Customer routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, likeReview);

// Admin routes
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.put('/:id/reject', protect, authorize('admin'), rejectReview);
router.get('/analytics/products/:productId', protect, getProductReviewAnalytics);
router.get('/analytics/overview', protect, authorize('admin'), getReviewAnalyticsOverview);

module.exports = router; 