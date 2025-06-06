const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage
} = require('../controllers/upload.controller');

const router = express.Router();

// Product image upload routes
router.post('/products/:id', protect, authorize('vendor', 'admin'), uploadProductImages);
router.put('/products/:id/primary/:imageId', protect, authorize('vendor', 'admin'), setPrimaryImage);
router.delete('/products/:id/images/:imageId', protect, authorize('vendor', 'admin'), deleteProductImage);

module.exports = router; 