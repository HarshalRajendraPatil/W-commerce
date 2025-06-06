const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrdersByUser,
  processPayment,
  getPaymentStatus,
  createRazorpayOrder,
  getOrderAnalytics,
  trackOrder
} = require('../controllers/order.controller');

const router = express.Router();

// Public routes

// Protected routes for all users
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getOrdersByUser);
router.get('/analytics', authorize('admin'), getOrderAnalytics);
router.get('/:id', getOrder);
router.get('/:id/payment-status', getPaymentStatus);
router.post('/payment', processPayment);
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/:id/cancel', cancelOrder);
router.get('/track/:trackingNumber', trackOrder);

// Admin routes
router.get('/', authorize('admin', 'vendor'), getOrders);
router.put('/:id/status', authorize('admin', 'vendor'), updateOrderStatus);

module.exports = router; 