const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  submitApplication,
  getMyApplicationStatus,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication
} = require('../controllers/vendorApplication.controller');

// Routes restricted to authenticated users
router.use(protect);

// Customer-accessible routes
router.post('/', submitApplication);
router.get('/me', getMyApplicationStatus);

// Admin-only routes
router.get('/', authorize('admin'), getAllApplications);
router.get('/:id', authorize('admin'), getApplicationById);
router.put('/:id/approve', authorize('admin'), approveApplication);
router.put('/:id/reject', authorize('admin'), rejectApplication);

module.exports = router; 