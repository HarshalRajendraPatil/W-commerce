const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin dashboard routes
router.get('/stats', protect, authorize('admin'), dashboardController.getDashboardStats);
router.get('/sales', protect, authorize('admin'), dashboardController.getSalesStats);
router.get('/top-products', protect, authorize('admin'), dashboardController.getTopProducts);
router.get('/recent-orders', protect, authorize('admin'), dashboardController.getRecentOrders);
router.get('/user-stats', protect, authorize('admin'), dashboardController.getUserStats);

// Vendor dashboard routes
router.get('/vendor/stats', protect, authorize('vendor'), dashboardController.getVendorDashboardStats);
router.get('/vendor/sales', protect, authorize('vendor'), dashboardController.getVendorSalesStats);
router.get('/vendor/top-products', protect, authorize('vendor'), dashboardController.getVendorTopProducts);
router.get('/vendor/recent-orders', protect, authorize('vendor'), dashboardController.getVendorRecentOrders);
router.get('/vendor/low-stock', protect, authorize('vendor'), dashboardController.getVendorLowStockProducts);
router.get('/vendor/recent-reviews', protect, authorize('vendor'), dashboardController.getVendorRecentReviews);
router.get('/vendor/analytics', protect, authorize('vendor'), dashboardController.getVendorAnalytics);

module.exports = router; 