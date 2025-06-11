const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route for validating coupons
router.post('/validate', protect, couponController.validateCoupon);

// Admin only routes
router.use(protect);

router.post('/apply', couponController.applyCoupon);
router.delete('/remove', couponController.removeCoupon);

router.use(authorize('admin'));

router.get('/', couponController.getCoupons);
router.get('/analytics', couponController.getCouponAnalytics);
router.post('/', couponController.createCoupon);
router.get('/:id', couponController.getCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.get('/:id/stats', couponController.getCouponStats);

module.exports = router; 