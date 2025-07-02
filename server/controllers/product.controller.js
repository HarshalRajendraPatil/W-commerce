const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const cloudinary = require('../utils/cloudinary');



/**
 * @desc    Get all products with pagination, filtering, and sorting
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt'; // Default sort by newest
    
    // Build query
    const queryObj = { ...req.query };

    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q', 'search', 'minPrice', 'maxPrice', 'stockStatus', 'isFeatured'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Only filter for published products in public requests, not for admin requests
    const isAdminRequest = req.originalUrl.includes('/admin');
    if (!isAdminRequest) {
      queryObj.published = true;
    }
    
    // Search functionality (by name, SKU, or description)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
        { brand: searchRegex }
      ];
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseInt(req.query.maxPrice);
    }
    
    // Filter by category (can be name or ID)
    if (req.query.category) {
      // Try to find category by name or ID
      let category;
      if (mongoose.isValidObjectId(req.query.category)) {
        category = await Category.findById(req.query.category);
      } else {
        category = await Category.findOne({ 
          slug: req.query.category.toLowerCase() 
        });
      }
      
      if (category) {
        queryObj.category = category._id;
      }
    }

    // Filter by brand
    if (req.query.brand) {
      queryObj.brand = req.query.brand;
    }

    // Filter by discount
    if (req.query.discount) {
      queryObj.discountPercentage = { $gt: parseInt(req.query.discount) };
    }
    
    // Filter by featured status
    if (req.query.isFeatured !== undefined) {
      queryObj.isFeatured = req.query.isFeatured === 'true';
    }
    
    // Filter by stock status
    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'low') {
        queryObj.stockCount = { $lt: 10, $gt: 0 };
      } else if (req.query.stockStatus === 'out') {
        queryObj.stockCount = 0;
      } else if (req.query.stockStatus === 'in') {
        queryObj.stockCount = { $gt: 0 };
      }
    }
    
    // Advanced filtering (gt, gte, lt, lte, in)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Execute query
    let query = Product.find(JSON.parse(queryStr))
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate({ path: 'category', select: 'name slug' });
    
    // Select specific fields if requested
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Execute query
    const products = await query;
    
    // Get total count
    const total = await Product.countDocuments(JSON.parse(queryStr));
    
    // Get product status counts (for admin dashboard)
    let statusCounts = {};
    if (isAdminRequest) {
      statusCounts = {
        total: await Product.countDocuments({}),
        featured: await Product.countDocuments({ isFeatured: true }),
        outOfStock: await Product.countDocuments({ stockCount: 0 }),
        lowStock: await Product.countDocuments({ stockCount: { $lt: 10, $gt: 0 } })
      };
    }
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      pagination,
      count: products.length,
      statusCounts: isAdminRequest ? statusCounts : undefined,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all products for a vendor
 * @route   GET /api/products/vendor
 * @access  Private (Vendor)
 */
exports.getVendorProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt'; // Default sort by newest
    
    // Build query - only get products from the authenticated vendor
    const queryObj = { seller: req.user.id };

    // Filter by status if provided
    if (req.query.published !== undefined) {
      queryObj.published = req.query.published === 'true';
    }
    
    // Filter by category
    if (req.query.category && mongoose.isValidObjectId(req.query.category)) {
      queryObj.category = req.query.category;
    }
    
    // Filter by stock status
    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'low') {
        queryObj.stockCount = { $lt: 10, $gt: 0 };
      } else if (req.query.stockStatus === 'out') {
        queryObj.stockCount = 0;
      } else if (req.query.stockStatus === 'in') {
        queryObj.stockCount = { $gt: 0 };
      }
    }
    
    // Search by name or SKU
    if (req.query.search) {
      queryObj.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const products = await Product.find(queryObj)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate({ path: 'category', select: 'name slug' });
    
    // Get total count
    const total = await Product.countDocuments(queryObj);
    
    // Get counts for different statuses (for UI filters)
    const statusCounts = {
      total: await Product.countDocuments({ seller: req.user.id }),
      published: await Product.countDocuments({ seller: req.user.id, published: true }),
      draft: await Product.countDocuments({ seller: req.user.id, published: false }),
      lowStock: await Product.countDocuments({ seller: req.user.id, stockCount: { $lt: 10, $gt: 0 } }),
      outOfStock: await Product.countDocuments({ seller: req.user.id, stockCount: 0 })
    };
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: products.length,
      statusCounts,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res, next) => {
  try {
    let query = {};
    if (mongoose.isValidObjectId(req.params.id)) {
      query._id = req.params.id;
    } else {
      query.slug = req.params.id;
    }
    
    const product = await Product.findOne(query)
      .populate({ path: 'category', select: 'name slug' })
      .populate({ path: 'seller', select: 'name' });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin/Vendor)
 */
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller ID from authenticated user
    req.body.seller = req.user.id;
    
    // Parse JSON strings for specifications, tags, and variants if they exist
    if (req.body.specifications && typeof req.body.specifications === 'string') {
      try {
        req.body.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid specifications format'
        });
      }
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format'
        });
      }
    }
    
    // Parse variants data
    if (req.body.variants && typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variants format'
        });
      }
    }
    
    // Validate category
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Handle image uploads if provided
    const images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      // Validate file types and sizes
      for (const file of files) {
        if (!file.mimetype.startsWith('image')) {
          return res.status(400).json({
            success: false,
            message: 'Please upload image files only'
          });
        }
        
        if (file.size > 2 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Image size should be less than 2MB'
          });
        }
      }
      
      // Process and upload each image
      const primaryIndex = req.body.primaryImageIndex ? parseInt(req.body.primaryImageIndex) : 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await cloudinary.uploadToCloudinary(file.tempFilePath, 'products');
        
        // Get alt text for this image if provided
        const altText = req.body[`imageAlt_${i}`] || req.body.name || 'Product image';
        
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: altText,
          isPrimary: i === primaryIndex
        });
      }
    }
    
    // Add images to request body
    if (images.length > 0) {
      req.body.images = images;
    }

    // Create the product
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Product creation error:', err);
    next(err);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin/Vendor)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
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
    
    // Validate category if updating
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    // Parse JSON strings for array fields if they are strings
    const updateData = { ...req.body };
    
    // Parse specifications if it's a string
    if (typeof updateData.specifications === 'string') {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid specifications format'
        });
      }
    }
    
    // Parse variants if it's a string
    if (typeof updateData.variants === 'string') {
      try {
        updateData.variants = JSON.parse(updateData.variants);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variants format'
        });
      }
    }
    
    // Parse tags if it's a string
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format'
        });
      }
    }
    
    // Handle existing images data if provided
    if (typeof updateData.existingImages === 'string') {
      try {
        const existingImagesData = JSON.parse(updateData.existingImages);
        
        // Update existing images with new data (alt text, primary status)
        const updatedImages = product.images.map(img => {
          const updatedImageData = existingImagesData.find(
            imgData => imgData._id === img._id.toString()
          );
          
          if (updatedImageData) {
            return {
              ...img.toObject(),
              alt: updatedImageData.alt || img.alt,
              isPrimary: updatedImageData.isPrimary || false
            };
          }
          return img;
        });
        
        product.images = updatedImages;
        
        // Remove existingImages from updateData as we've processed it
        delete updateData.existingImages;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid existing images format'
        });
      }
    }
    
    // Handle images to delete if provided
    if (typeof updateData.imagesToDelete === 'string') {
      try {
        const imagesToDelete = JSON.parse(updateData.imagesToDelete);
        
        // Filter out images that should be deleted
        product.images = product.images.filter(img => 
          !imagesToDelete.includes(img._id.toString())
        );
        
        // Delete images from cloudinary
        for (const imageId of imagesToDelete) {
          const image = product.images.find(img => img._id.toString() === imageId);
          if (image && image.publicId) {
            await cloudinary.removeFromCloudinary(image.publicId);
          }
        }
        
        // Remove imagesToDelete from updateData as we've processed it
        delete updateData.imagesToDelete;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid images to delete format'
        });
      }
    }
    
    // Handle new image uploads if provided
    if (req.files && req.files.newImages) {
      const files = Array.isArray(req.files.newImages) 
        ? req.files.newImages 
        : [req.files.newImages];
      
      // Validate file types and sizes
      for (const file of files) {
        if (!file.mimetype.startsWith('image')) {
          return res.status(400).json({
            success: false,
            message: 'Please upload image files only'
          });
        }
        
        if (file.size > 2 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Image size should be less than 2MB'
          });
        }
      }
      
      // Process and upload each new image
      const primaryIndex = req.body.primaryImageIndex 
        ? parseInt(req.body.primaryImageIndex) 
        : null;
      
      const currentImagesCount = product.images.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await cloudinary.uploadToCloudinary(file.tempFilePath, 'products');
        
        // Get alt text for this image if provided
        const altText = req.body[`imageAlt_${i}`] || product.name || 'Product image';
        
        // Check if this should be the primary image
        const isPrimary = primaryIndex === currentImagesCount + i;
        
        // If this is the new primary, set all others to false
        if (isPrimary) {
          product.images.forEach(img => {
            img.isPrimary = false;
          });
        }
        
        // Add the new image
        product.images.push({
          url: result.secure_url,
          publicId: result.public_id,
          alt: altText,
          isPrimary: isPrimary
        });
      }
      
      // Remove primaryImageIndex from updateData as we've processed it
      delete updateData.primaryImageIndex;
    }
    
    // Update the product with remaining fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'images') { // Skip images as we've handled them separately
        product[key] = updateData[key];
      }
    });
    
    // Save the updated product
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Product update error:', err);
    next(err);
  }
};

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Admin/Vendor)
 */
exports.updateProductStock = async (req, res, next) => {
  try {
    const { stockCount } = req.body;

    if (stockCount === undefined || stockCount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock count'
      });
    }

    let product = await Product.findById(req.params.id);
    
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
    
    // Update the product stock
    product = await Product.findByIdAndUpdate(
      req.params.id, 
      { stockCount }, 
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update product status (published/unpublished)
 * @route   PATCH /api/products/:id/status
 * @access  Private (Admin/Vendor)
 */
exports.updateProductStatus = async (req, res, next) => {
  try {
    const { published } = req.body;

    if (published === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide published status'
      });
    }

    let product = await Product.findById(req.params.id);
    
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
    
    // Update the product status
    product = await Product.findByIdAndUpdate(
      req.params.id, 
      { published }, 
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin/Vendor)
 */
exports.deleteProduct = async (req, res, next) => {
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
        message: 'Not authorized to delete this product'
      });
    }
    
    await product.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const products = await Product.find({ isFeatured: true, published: true })
      .limit(limit)
      .sort('-createdAt')
      .populate({ path: 'category', select: 'name slug' });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    let category;
    
    // Try to find category by ID or slug
    if (mongoose.isValidObjectId(req.params.categoryId)) {
      category = await Category.findById(req.params.categoryId);
    } else {
      category = await Category.findOne({ 
        slug: req.params.categoryId.toLowerCase() 
      });
    }
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get subcategories to include their products too
    const subcategories = await Category.find({ parent: category._id });
    const categoryIds = [category._id, ...subcategories.map(c => c._id)];

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const products = await Product.find({ 
      $or: [
        { category: { $in: categoryIds } },
        { subcategories: { $in: categoryIds } }
      ],
      published: true 
    })
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt')
      .populate({ path: 'category', select: 'name slug' });
    
    const total = await Product.countDocuments({ 
      $or: [
        { category: { $in: categoryIds } },
        { subcategories: { $in: categoryIds } }
      ],
      published: true 
    });
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
exports.searchProducts = async (req, res, next) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    const searchQuery = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Search in name, description, and tags
    const products = await Product.find({
      $and: [
        { published: true },
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
          ]
        }
      ]
    })
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt')
      .populate({ path: 'category', select: 'name slug' });
    
    const total = await Product.countDocuments({
      $and: [
        { published: true },
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
          ]
        }
      ]
    });
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get product reviews
 * @route   GET /api/products/:id/reviews
 * @access  Public
 */
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get approved reviews only
    const reviews = await Review.find({ 
      product: req.params.id,
      isApproved: true,
      isRejected: false
    })
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt')
      .populate({ path: 'user', select: 'name avatar' });
    
    const total = await Review.countDocuments({ 
      product: req.params.id,
      isApproved: true,
      isRejected: false
    });
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get top rated products
 * @route   GET /api/products/top-rated
 * @access  Public
 */
exports.getTopRatedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const products = await Product.find({ 
      published: true,
      averageRating: { $gte: 4 }
    })
      .limit(limit)
      .sort('-averageRating -numReviews')
      .populate({ path: 'category', select: 'name slug' });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get related products (same category)
 * @route   GET /api/products/:id/related
 * @access  Public
 */
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Find products in the same category, excluding the current product
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      published: true
    })
      .limit(limit)
      .populate({ path: 'category', select: 'name slug' });
    
    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      data: relatedProducts
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle product featured status
 * @route   PATCH /api/products/:id/featured
 * @access  Private (Admin only)
 */
exports.toggleFeaturedStatus = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Only admin can set featured status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update featured status'
      });
    }
    
    // Toggle the featured status
    product = await Product.findByIdAndUpdate(
      req.params.id, 
      { isFeatured: !product.isFeatured }, 
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get detailed statistics for a specific product
 * @route   GET /api/products/:id/stats
 * @access  Private (Vendor)
 */
exports.getProductStats = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists and belongs to the vendor
    const product = await Product.findOne({
      _id: productId,
      seller: req.user.id
    }).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to view it'
      });
    }
    
    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { 
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);
    
    // Get recent reviews
    const recentReviews = await Review.find({ product: productId })
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name avatar');
    
    // Get order statistics for this product
    const Order = mongoose.model('Order');
    const orderStats = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': new mongoose.Types.ObjectId(productId) } },
      { 
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);
    
    // Get monthly sales data for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Order.aggregate([
      { $unwind: '$items' },
      { 
        $match: { 
          'items.product': new mongoose.Types.ObjectId(productId),
          'createdAt': { $gte: sixMonthsAgo },
          'status': { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly sales data
    const formattedMonthlySales = monthlySales.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      sales: item.totalSales,
      quantity: item.totalQuantity
    }));
    
    // Get inventory history
    // This would require a separate collection to track inventory changes
    // For now, we'll just return the current stock level
    
    // Compile all stats
    const productStats = {
      basicInfo: {
        id: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        stockCount: product.stockCount,
        category: product.category,
        published: product.published,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images
      },
      reviewStats: reviewStats.length > 0 ? {
        totalReviews: reviewStats[0].totalReviews,
        averageRating: reviewStats[0].averageRating,
        ratingDistribution: {
          5: reviewStats[0].rating5,
          4: reviewStats[0].rating4,
          3: reviewStats[0].rating3,
          2: reviewStats[0].rating2,
          1: reviewStats[0].rating1
        }
      } : {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      recentReviews,
      orderStats: orderStats.length > 0 ? {
        totalOrders: orderStats[0].totalOrders,
        totalQuantitySold: orderStats[0].totalQuantitySold,
        totalRevenue: orderStats[0].totalRevenue
      } : {
        totalOrders: 0,
        totalQuantitySold: 0,
        totalRevenue: 0
      },
      monthlySales: formattedMonthlySales
    };
    
    res.status(200).json({
      success: true,
      data: productStats
    });
  } catch (err) {
    next(err);
  }
}; 