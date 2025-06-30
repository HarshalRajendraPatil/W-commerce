const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by level if specified
    if (req.query.level) {
      query.level = parseInt(req.query.level, 10);
    }
    
    // Filter by parent if specified
    if (req.query.parent) {
      query.parent = req.query.parent === 'null' ? null : req.query.parent;
    }
    
    // Filter by featured if specified
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }
    
    // Filter by active status if specified
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    // Filter by name search
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Execute query with sorting by order
    const categories = await Category.find(query)
      .sort(req.query.sort || 'order name')
      .populate({
        path: 'parent',
        select: 'name slug'
      })
      .populate({
        path: 'subcategories',
        select: 'name slug'
      });
    
    // For admin requests, include product counts per category
    if (req.query.includeStats === 'true') {
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ category: category._id });
          const categoryObj = category.toObject();
          categoryObj.productCount = productCount;
          return categoryObj;
        })
      );
      
      return res.status(200).json({
        success: true,
        count: categoriesWithStats.length,
        data: categoriesWithStats
      });
    }
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategory = async (req, res, next) => {
  try {
    let query = {};
    
    // Check if the ID is a valid ObjectId or if it's a slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = req.params.id;
    } else {
      query.slug = req.params.id;
    }
    
    const category = await Category.findOne(query)
      .populate({
        path: 'parent',
        select: 'name slug'
      })
      .populate({
        path: 'subcategories',
        select: 'name slug'
      });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
exports.createCategory = async (req, res, next) => {
  try {
    // Handle parent field - convert 'null' string to null
    if (req.body.parent === 'null' || req.body.parent === '') {
      req.body.parent = null;
    }
    
    // Check if parent exists
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    if (req.files) {
      const result = await cloudinary.uploadToCloudinary(req.files.image.tempFilePath, 'categories');
      req.body.image = {
        publicId: result.public_id,
        url: result.secure_url
      };
    }
    
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
exports.updateCategory = async (req, res, next) => {
  try {
    // Handle parent field - convert 'null' string to null
    if (req.body.parent === 'null' || req.body.parent === '') {
      req.body.parent = null;
    }
    
    // Check if parent exists if updating parent
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      
      // Prevent circular references - parent cannot be the category itself or its child
      if (req.body.parent === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
      
      // Check if the new parent is not a child of this category
      const subcategories = await Category.find({ parent: req.params.id });
      const subcategoryIds = subcategories.map(cat => cat._id.toString());
      
      if (subcategoryIds.includes(req.body.parent)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set a subcategory as parent'
        });
      }
    }

    const categoryToUpdate = await Category.findById(req.params.id);

    if (req.files) {
      await cloudinary.removeFromCloudinary(categoryToUpdate.image.publicId);

      const result = await cloudinary.uploadToCloudinary(req.files.image.tempFilePath, 'categories');
      req.body.image = {
        publicId: result.public_id,
        url: result.secure_url
      };
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'parent',
      select: 'name slug'
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parent: req.params.id });
    
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Delete or reassign subcategories first.'
      });
    }
    
    // Check if category has products
    const products = await Product.find({ category: req.params.id });
    
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with products. Delete or reassign products first.'
      });
    }

    if (category.image.publicId) {
      await cloudinary.removeFromCloudinary(category.image.publicId);
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get featured categories
 * @route   GET /api/categories/featured
 * @access  Public
 */
exports.getFeaturedCategories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const categories = await Category.find({ 
      featured: true,
      isActive: true
    })
      .limit(limit)
      .sort('order name');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get category statistics
 * @route   GET /api/categories/:id/stats
 * @access  Private (Admin only)
 */
exports.getCategoryStats = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get product statistics
    const productCount = await Product.countDocuments({ category: category._id });
    const avgProductPrice = await Product.aggregate([
      { $match: { category: new mongoose.Types.ObjectId(category._id) } },
      { $group: { _id: null, avg: { $avg: '$price' } } }
    ]);
    
    // Get top selling products in this category
    const topProducts = await Product.find({ category: category._id })
      .sort('-soldCount')
      .limit(5)
      .select('name price images soldCount averageRating');
    
    // Get order statistics
    const orderStats = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.category': new mongoose.Types.ObjectId(category._id) } },
      { $group: {
          _id: null,
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$items.quantity' }
        }
      }
    ]);
    
    // Get monthly sales trends
    const monthlyTrends = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.category': new mongoose.Types.ObjectId(category._id) } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 12 }
    ]);
    
    // Get recent orders containing products from this category
    const recentOrders = await Order.find({
      'items.product': { $in: await Product.find({ category: category._id }).distinct('_id') }
    })
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name email')
    .select('trackingNumber totalPrice status createdAt items');
    
    res.status(200).json({
      success: true,
      data: {
        category,
        stats: {
          productCount,
          averagePrice: avgProductPrice.length > 0 ? avgProductPrice[0].avg : 0,
          sales: orderStats.length > 0 ? orderStats[0].totalSales : 0,
          orders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
          itemsSold: orderStats.length > 0 ? orderStats[0].totalItems : 0
        },
        topProducts,
        monthlyTrends,
        recentOrders
      }
    });
  } catch (err) {
    next(err);
  }
}; 