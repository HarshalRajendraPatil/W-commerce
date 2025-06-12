const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes restricted to admin
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/', userController.getUsers);
router.get('/analytics', userController.getUserAnalytics);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Add the analytics route after the other admin routes
router.get('/analytics', protect, authorize('admin'), userController.getUserAnalytics);

module.exports = router; 