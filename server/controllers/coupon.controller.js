const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

/**
 * @desc    Get all coupons (with filtering, sorting, pagination)
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
exports.getCoupons = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { code: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      queryObj.isActive = req.query.isActive === 'true';
    }
    
    // Filter by type if provided
    if (req.query.type) {
      queryObj.type = req.query.type;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    let query = Coupon.find(queryObj)
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    // Select specific fields if requested
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    const coupons = await query;
    
    // Get total count for pagination
    const total = await Coupon.countDocuments(queryObj);
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get single coupon
 * @route   GET /api/coupons/:id
 * @access  Private (Admin)
 */
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
exports.createCoupon = async (req, res) => {
  try {
    // Check if coupon with the same code already exists
    const existingCoupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists'
      });
    }
    
    // Create new coupon
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase() // Ensure code is uppercase
    });
    
    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private (Admin)
 */
exports.updateCoupon = async (req, res) => {
  try {
    // If updating code, ensure it's uppercase
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
      
      // Check if the new code conflicts with an existing one
      const existingCoupon = await Coupon.findOne({ 
        code: req.body.code,
        _id: { $ne: req.params.id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'A coupon with this code already exists'
        });
      }
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin)
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    await coupon.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get coupon usage analytics
 * @route   GET /api/coupons/analytics
 * @access  Private (Admin)
 */
exports.getCouponAnalytics = async (req, res) => {
  try {
    // Get total coupons count
    const totalCoupons = await Coupon.countDocuments();
    
    // Get active coupons count
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      endDate: { $gte: new Date() }
    });
    
    // Get expired coupons count
    const expiredCoupons = await Coupon.countDocuments({ 
      endDate: { $lt: new Date() }
    });
    
    // Get inactive coupons (manually deactivated)
    const inactiveCoupons = await Coupon.countDocuments({
      isActive: false,
      endDate: { $gte: new Date() }
    });
    
    // Get coupons by type
    const couponsByType = await Coupon.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get most used coupons
    const mostUsedCoupons = await Coupon.find()
      .sort('-usedCount')
      .limit(5);
    
    // Get total discount amount from orders
    const orders = await Order.find({ coupon: { $exists: true, $ne: null } });
    const totalDiscountAmount = orders.reduce((total, order) => total + (order.discountAmount || 0), 0);
    
    // Get monthly coupon usage
    const monthlyCouponUsage = await Order.aggregate([
      { $match: { coupon: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 },
          totalDiscount: { $sum: "$discountAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format monthly data
    const monthlyData = monthlyCouponUsage.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: monthNames[item._id.month - 1],
        year: item._id.year,
        label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count,
        discount: item.totalDiscount
      };
    });
    
    // Get coupons expiring soon (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const expiringSoonCoupons = await Coupon.find({
      isActive: true,
      endDate: { $gte: today, $lte: nextWeek }
    }).sort('endDate');
    
    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        inactiveCoupons,
        couponsByType: couponsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        mostUsedCoupons,
        expiringSoonCoupons,
        totalDiscountAmount,
        monthlyCouponUsage: monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching coupon analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Validate coupon
 * @route   POST /api/coupons/validate
 * @access  Private
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a coupon code'
      });
    }
    
    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }
    
    // Check minimum purchase requirement
    if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum purchase of $${coupon.minPurchase}`
      });
    }
    
    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }
    
    // Check per-user limit
    if (coupon.perUserLimit > 0) {
      const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user.id);
      
      if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this coupon the maximum number of times'
        });
      }
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    
    if (coupon.type === 'percentage') {
      discountAmount = (cartTotal * coupon.value) / 100;
      
      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed amount discount
      discountAmount = coupon.value;
      
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountAmount: discountAmount.toFixed(2),
        discountType: coupon.type
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/coupons/apply
 * @access  Private
 */
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate coupon
    const validationResult = coupon.isValid(req.user.id, cart.totalPrice);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }
    
    // Apply coupon to cart
    cart.coupon = coupon._id;
    cart.discountAmount = validationResult.discount;
    
    await cart.save();
    
    // Return updated cart with populated fields
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      })
      .populate('coupon', 'code type value');
    
    res.status(200).json({
      success: true,
      message: validationResult.message,
      data: updatedCart
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/coupons/remove
 * @access  Private
 */
exports.removeCoupon = async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove coupon
    cart.coupon = undefined;
    cart.discountAmount = 0;
    
    await cart.save();
    
    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      });
    
    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get individual coupon stats
 * @route   GET /api/coupons/:id/stats
 * @access  Private (Admin)
 */
exports.getCouponStats = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    // Find orders that used this coupon
    const orders = await Order.find({ coupon: coupon._id })
      .populate('user', 'name email')
      .sort('-createdAt');
    
    // Calculate basic stats
    const usageCount = orders.length;
    const totalDiscountAmount = orders.reduce((total, order) => total + (order.discountAmount || 0), 0);
    const averageDiscount = usageCount > 0 ? totalDiscountAmount / usageCount : 0;
    const totalOrderValue = orders.reduce((total, order) => total + order.totalPrice, 0);
    
    // Calculate usage by user
    const userUsage = {};
    for (const order of orders) {
      if (order.user) {
        const userId = order.user._id.toString();
        if (!userUsage[userId]) {
          userUsage[userId] = {
            user: {
              _id: userId,
              name: order.user.name,
              email: order.user.email
            },
            count: 0,
            totalDiscount: 0
          };
        }
        userUsage[userId].count += 1;
        userUsage[userId].totalDiscount += order.discountAmount || 0;
      }
    }
    
    // Sort users by usage count
    const topUsers = Object.values(userUsage)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get usage over time
    const usageOverTime = await Order.aggregate([
      { $match: { coupon: coupon._id } },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 },
          discount: { $sum: "$discountAmount" }
        }
      },
      { $sort: { "_id.date": 1 } },
      { $limit: 30 } // Last 30 data points
    ]);
    
    const timeData = usageOverTime.map(item => ({
      date: item._id.date,
      count: item.count,
      discount: item.discount
    }));
    
    // Get recent orders
    const recentOrders = orders.slice(0, 5).map(order => ({
      _id: order._id,
      orderId: order._id.toString().substring(order._id.toString().length - 6),
      user: order.user ? {
        name: order.user.name,
        email: order.user.email
      } : null,
      date: order.createdAt,
      total: order.totalPrice,
      discount: order.discountAmount || 0
    }));
    
    res.status(200).json({
      success: true,
      data: {
        usageCount,
        totalDiscountAmount,
        averageDiscount,
        totalOrderValue,
        discountPercentage: totalOrderValue > 0 ? (totalDiscountAmount / totalOrderValue) * 100 : 0,
        topUsers,
        recentOrders,
        usageOverTime: timeData
      }
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 