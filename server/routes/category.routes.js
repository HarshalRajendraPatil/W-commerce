const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
  getCategoryStats
} = require('../controllers/category.controller');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/:id', getCategory);

// Admin only routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.get('/:id/stats', protect, authorize('admin'), getCategoryStats);

module.exports = router; 