const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

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
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Filter for published products only
    queryObj.published = true;
    
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

    if (req.query.brand) {
      queryObj.brand = req.query.brand;
    }

    if (req.query.discount) {
      queryObj.discountPrice = { gte: req.query.discount };
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
    
    // Create the product
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
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
    
    // Update the product
    product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
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
    
    const products = await Product.find({ featured: true, published: true })
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