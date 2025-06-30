const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');

/**
 * @desc    Get all users (with filtering, sorting, pagination)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res) => {
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
        { name: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // Filter by role if provided
    if (req.query.role) {
      queryObj.role = req.query.role;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    let query = User.find(queryObj)
      .select('-password')
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    // Select specific fields if requested
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    const users = await query;
    
    // Get total count for pagination
    const total = await User.countDocuments(queryObj);
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's order count
    const orderCount = await Order.countDocuments({ user: req.params.id });
    
    // Get user's total spending
    const orders = await Order.find({ 
      user: req.params.id,
      status: { $nin: ['cancelled', 'refunded'] }
    });
    const totalSpent = orders.reduce((total, order) => total + order.totalPrice, 0);
    
    // Get user's review count
    const reviewCount = await Review.countDocuments({ user: req.params.id });
    
    // Combine user data with stats
    const userData = {
      ...user._doc,
      stats: {
        orderCount,
        totalSpent,
        reviewCount
      }
    };
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
exports.updateUser = async (req, res) => {
  try {
    // Fields that can be updated by admin
    const allowedFields = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      active: req.body.active
    };
    
    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => 
      allowedFields[key] === undefined && delete allowedFields[key]
    );
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Instead of hard deletion, deactivate the user
    user.active = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User has been deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get user analytics
 * @route   GET /api/users/analytics
 * @access  Private (Admin)
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active users count
    const activeUsers = await User.countDocuments({ active: true });
    
    // Get inactive users count
    const inactiveUsers = await User.countDocuments({ active: false });
    
    // Get total orders count
    const totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get users by registration month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get top customers by order count
    const topCustomers = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { orderCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          email: '$userDetails.email',
          orderCount: 1,
          totalSpent: 1
        }
      }
    ]);
    
    // Get user activity stats
    const userActivity = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } }
      },
      {
        $group: {
          _id: '$user',
          lastOrderDate: { $max: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastOrderDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          inactiveUsers: {
            $sum: {
              $cond: [
                { $lt: ['$lastOrderDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalOrders,
        usersByRole,
        usersByMonth,
        topCustomers,
        userActivity: userActivity[0] || { activeUsers: 0, inactiveUsers: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 

exports.activateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.active = true;
  await user.save();
  res.status(200).json({ success: true, data: user });
};

exports.deactivateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.active = false;
  await user.save();
  res.status(200).json({ success: true, data: user });
};