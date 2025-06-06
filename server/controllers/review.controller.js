const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { uploadToCloudinary, removeFromCloudinary } = require('../utils/cloudinary');

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getReviews = async (req, res, next) => {
  try {
    // Build query with filters
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Filter by product if provided
    if (req.query.product) {
      queryObj.product = req.query.product;
    }

    // Filter by approved reviews for public access
    if (!req.user || (req.user && req.user.role !== 'admin')) {
      queryObj.isApproved = true;
      queryObj.isRejected = false;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    let query = Review.find(queryObj)
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .sort(req.query.sort || '-createdAt');

    // Select specific fields if requested
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    // Execute query
    const reviews = await query;
    
    // Get total count for pagination
    const total = await Review.countDocuments(queryObj);
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'product',
        select: 'name images'
      });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Hide rejected/unapproved reviews from non-admins
    if (!review.isApproved && review.isRejected && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'This review is not available'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: req.body.product
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(req.body.product);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Verify if user has purchased the product
    const verifiedPurchase = await Order.findOne({
      user: req.user.id,
      'items.product': req.body.product,
      status: 'delivered'
    });
    
    // Set verified purchase flag
    req.body.isVerifiedPurchase = !!verifiedPurchase;
    
    // Auto-approve reviews from verified purchases, others need admin approval
    req.body.isApproved = req.body.isVerifiedPurchase;

    req.body.isRejected = !req.body.isVerifiedPurchase;
    req.body.rejectionReason = 'Review submitted and pending approval';
    
    // Process images if included
    if (req.files && req.files.images) {
      const imagesArray = Array.isArray(req.files.images) 
        ? req.files.images 
        : [req.files.images];
      
      const uploadPromises = imagesArray.map(async (file) => {
        const result = await uploadToCloudinary(file.tempFilePath, 'reviews');
        return {
          url: result.secure_url,
          public_id: result.public_id,
          caption: req.body.caption || file.name
        };
      });
      
      req.body.images = await Promise.all(uploadPromises);
    }
    
    const review = await Review.create(req.body);
    
    res.status(201).json({
      success: true,
      data: review,
      message: review.isApproved 
        ? 'Review published successfully' 
        : 'Review submitted and pending approval'
    });
  } catch (err) {
    // Special handling for duplicate reviews
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    next(err);
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Make sure user owns the review or is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    // If edited by regular user, set to pending approval again
    if (req.user.role !== 'admin') {
      req.body.isApproved = false;
      req.body.isRejected = false;
    }
    
    // Handle image uploads if provided
    if (req.files && req.files.images) {
      const imagesArray = Array.isArray(req.files.images) 
        ? req.files.images 
        : [req.files.images];
      
      const uploadPromises = imagesArray.map(async (file) => {
        const result = await uploadToCloudinary(file.tempFilePath, 'reviews');
        return {
          url: result.secure_url,
          public_id: result.public_id,
          caption: req.body.caption || file.name
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      
      // Combine with existing images if they're not being replaced
      if (req.body.keepExistingImages === 'true' && review.images && review.images.length > 0) {
        req.body.images = [...review.images, ...newImages];
      } else {
        req.body.images = newImages;
      }
    }
    
    // Remove specific images if requested
    if (req.body.removeImages) {
      const imageIdsToRemove = req.body.removeImages.split(',');
      
      // Filter out images to remove
      if (review.images && review.images.length > 0) {
        req.body.images = review.images.filter(img => !imageIdsToRemove.includes(img._id.toString()));
      }
    }
    
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
      select: 'name avatar'
    });
    
    res.status(200).json({
      success: true,
      data: review,
      message: req.user.role === 'admin' || review.isApproved 
        ? 'Review updated successfully' 
        : 'Review updated and pending approval'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Make sure user owns the review or is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    // Delete any associated images from cloud storage
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        if (image.url) {
          // Extract public_id from URL
          const publicId = image.url.split('/').pop().split('.')[0];
          await removeFromCloudinary(publicId, 'reviews');
        }
      }
    }
    
    await review.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve review
 * @route   PUT /api/reviews/:id/approve
 * @access  Private (Admin)
 */
exports.approveReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        isRejected: false,
        rejectionReason: null
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject review
 * @route   PUT /api/reviews/:id/reject
 * @access  Private (Admin)
 */
exports.rejectReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        isRejected: true,
        rejectionReason: req.body.rejectionReason || 'Violated review policy'
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Like/unlike review
 * @route   POST /api/reviews/:id/like
 * @access  Private
 */
exports.likeReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user has already liked this review
    const hasLiked = review.usersLiked.some(userId => 
      userId.toString() === req.user.id
    );
    
    // If already liked, remove like
    if (hasLiked) {
      review = await Review.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { usersLiked: req.user.id },
          $inc: { likes: -1 }
        },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        liked: false,
        data: review
      });
    }
    
    // Otherwise, add like
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { usersLiked: req.user.id },
        $inc: { likes: 1 }
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      liked: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get review analytics for products
 * @route   GET /api/reviews/analytics/products/:productId
 * @access  Private (Admin/Vendor)
 */
exports.getProductReviewAnalytics = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    
    // Check if product exists
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get summary statistics
    const ratingSummary = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          verifiedPurchases: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } }
        }
      }
    ]);
    
    // Prepare complete rating distribution (1-5)
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      const found = ratingDistribution.find(item => item._id === i);
      distribution[i] = found ? found.count : 0;
    }
    
    const summary = ratingSummary.length > 0 ? ratingSummary[0] : {
      averageRating: 0,
      totalReviews: 0,
      verifiedPurchases: 0
    };
    
    // Get recent reviews
    const recentReviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    })
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'user',
        select: 'name avatar'
      });
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          averageRating: summary.averageRating ? summary.averageRating.toFixed(1) : 0,
          totalReviews: summary.totalReviews,
          verifiedPurchases: summary.verifiedPurchases,
          verifiedPercentage: summary.totalReviews > 0 
            ? ((summary.verifiedPurchases / summary.totalReviews) * 100).toFixed(1) 
            : 0
        },
        distribution,
        recentReviews
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all review metrics (admin dashboard)
 * @route   GET /api/reviews/analytics/overview
 * @access  Private (Admin)
 */
exports.getReviewAnalyticsOverview = async (req, res, next) => {
  try {
    // Get overall metrics
    const overallMetrics = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          approvedReviews: { $sum: { $cond: ['$isApproved', 1, 0] } },
          rejectedReviews: { $sum: { $cond: ['$isRejected', 1, 0] } },
          pendingReviews: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$isApproved', false] }, { $eq: ['$isRejected', false] }] }, 
                1, 
                0
              ] 
            } 
          },
          averageRating: { $avg: '$rating' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);
    
    // Get metrics by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyMetrics = await Review.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get top products by review count
    const topReviewedProducts = await Review.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$product',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $project: {
          _id: 1,
          reviewCount: 1,
          averageRating: 1,
          productName: { $arrayElemAt: ['$productDetails.name', 0] },
          productImage: { $arrayElemAt: ['$productDetails.images', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overallMetrics: overallMetrics[0] || {
          totalReviews: 0,
          approvedReviews: 0,
          rejectedReviews: 0,
          pendingReviews: 0,
          averageRating: 0,
          totalLikes: 0
        },
        monthlyMetrics,
        topReviewedProducts
      }
    });
  } catch (err) {
    next(err);
  }
}; 