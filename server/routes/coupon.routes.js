const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply/remove coupon routes (requires user authentication)
router.post('/apply', protect, couponController.applyCoupon);
router.delete('/remove', protect, couponController.removeCoupon);

// Admin routes (requires admin privileges)
router.route('/')
  .get(protect, authorize('admin'), couponController.getAllCoupons)
  .post(protect, authorize('admin'), couponController.createCoupon);

router.route('/:id')
  .get(protect, authorize('admin'), couponController.getCoupon)
  .put(protect, authorize('admin'), couponController.updateCoupon)
  .delete(protect, authorize('admin'), couponController.deleteCoupon);

module.exports = router; 