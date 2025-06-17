const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// System stats route for admin
router.get('/system', protect, authorize('admin'), dashboardController.getSystemStats);

module.exports = router; 