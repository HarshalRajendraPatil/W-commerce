const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');

/**
 * @desc    Upload product images
 * @route   POST /api/uploads/products/:id
 * @access  Private (Admin/Vendor)
 */
exports.uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check ownership (only admin or the seller can upload)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Check if files exist
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    
    // Validate file types
    for (const file of files) {
      // Check file type
      if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
          success: false,
          message: 'Please upload image files only'
        });
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image size should be less than 2MB'
        });
      }
    }
    
    // Process and save each file
    const uploadedImages = [];
    
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'products',
        resource_type: 'auto'
      });
      
      // Add image to uploaded images array
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        alt: product.name,
        isPrimary: product.images.length === 0 && uploadedImages.length === 0 // First image is primary if no other images
      });
    }
    
    // Add images to product
    product.images = [...product.images, ...uploadedImages];
    await product.save();
    
    res.status(200).json({
      success: true,
      count: uploadedImages.length,
      data: product.images
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Set product image as primary
 * @route   PUT /api/uploads/products/:id/primary/:imageId
 * @access  Private (Admin/Vendor)
 */
exports.setPrimaryImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check ownership (only admin or the seller can update)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Find image by ID
    const imageIndex = product.images.findIndex(img => img._id.toString() === req.params.imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Reset all images to non-primary
    product.images.forEach(img => {
      img.isPrimary = false;
    });
    
    // Set the selected image as primary
    product.images[imageIndex].isPrimary = true;
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product.images
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete product image
 * @route   DELETE /api/uploads/products/:id/images/:imageId
 * @access  Private (Admin/Vendor)
 */
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check ownership (only admin or the seller can delete)
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Find image by ID
    const imageIndex = product.images.findIndex(img => img._id.toString() === req.params.imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Get image to delete
    const imageToDelete = product.images[imageIndex];
    
    await cloudinary.uploader.destroy(imageToDelete.publicId);
    
    // Remove image from product
    product.images.splice(imageIndex, 1);
    
    // If the deleted image was primary and there are other images, set the first one as primary
    if (imageToDelete.isPrimary && product.images.length > 0) {
      product.images[0].isPrimary = true;
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product.images
    });
  } catch (err) {
    next(err);
  }
}; 