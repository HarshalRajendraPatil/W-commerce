const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const categoryCount = await Category.countDocuments();
    const reviewCount = await Review.countDocuments();
    const couponCount = await Coupon.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ stockCount: { $lt: 10 } });
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'processing' });
    
    // Get today's orders and revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({ 
      createdAt: { $gte: today },
      status: { $ne: 'cancelled' }
    });
    const todayRevenue = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    res.status(200).json({
      success: true,
      data: {
        userCount,
        productCount,
        orderCount,
        categoryCount,
        reviewCount,
        couponCount,
        totalRevenue,
        lowStockProducts,
        pendingOrders,
        todayOrders: todayOrders.length,
        todayRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get vendor dashboard statistics
 * @route   GET /api/dashboard/vendor/stats
 * @access  Private/Vendor
 */
exports.getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get vendor's product count
    const productCount = await Product.countDocuments({ seller: vendorId });
    
    // Get products with low stock
    const lowStockProducts = await Product.countDocuments({ 
      seller: vendorId,
      stockCount: { $lt: 10 }
    });
    
    // Find all orders containing vendor's products
    // First get all vendor products
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    // Then find orders with these products
    const orders = await Order.find({
      'items.product': { $in: productIds },
      status: { $ne: 'cancelled' }
    });
    
    // Calculate vendor's total revenue and order count
    let totalRevenue = 0;
    let totalOrderCount = 0;
    const processedOrderIds = new Set();
    
    orders.forEach(order => {
      let orderRevenue = 0;
      
      // Only count items from this vendor
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          orderRevenue += item.price * item.quantity;
        }
      });
      
      if (orderRevenue > 0) {
        totalRevenue += orderRevenue;
        if (!processedOrderIds.has(order._id.toString())) {
          totalOrderCount++;
          processedOrderIds.add(order._id.toString());
        }
      }
    });
    
    // Get today's orders and revenue for vendor
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
    
    let todayRevenue = 0;
    let todayOrderCount = 0;
    const todayProcessedOrderIds = new Set();
    
    todayOrders.forEach(order => {
      let orderRevenue = 0;
      
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          orderRevenue += item.price * item.quantity;
        }
      });
      
      if (orderRevenue > 0) {
        todayRevenue += orderRevenue;
        if (!todayProcessedOrderIds.has(order._id.toString())) {
          todayOrderCount++;
          todayProcessedOrderIds.add(order._id.toString());
        }
      }
    });
    
    // Get review count for vendor products
    const reviewCount = await Review.countDocuments({
      product: { $in: productIds }
    });
    
    // Get average product rating
    const reviewStats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);
    
    const averageRating = reviewStats.length > 0 ? reviewStats[0].averageRating : 0;
    
    res.status(200).json({
      success: true,
      data: {
        productCount,
        orderCount: totalOrderCount,
        totalRevenue,
        lowStockProducts,
        reviewCount,
        averageRating,
        todayOrders: todayOrderCount,
        todayRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get sales statistics
 * @route   GET /api/dashboard/sales
 * @access  Private/Admin
 */
exports.getSalesStats = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate, endDate;
    const currentDate = new Date();
    
    // Set time period based on query param
    switch (period) {
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
    }
    
    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: currentDate },
      status: { $ne: 'cancelled' }
    }).sort('createdAt');
    
    // Group orders by day
    const salesByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = {
          count: 0,
          revenue: 0
        };
      }
      salesByDay[date].count += 1;
      salesByDay[date].revenue += order.totalAmount;
    });
    
    // Convert to array format for frontend charts
    const salesData = Object.keys(salesByDay).map(date => ({
      date,
      orders: salesByDay[date].count,
      revenue: salesByDay[date].revenue
    }));
    
    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get vendor sales statistics
 * @route   GET /api/dashboard/vendor/sales
 * @access  Private/Vendor
 */
exports.getVendorSalesStats = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { period } = req.query;
    let startDate;
    const currentDate = new Date();
    
    // Get vendor's product IDs
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Set time period based on query param
    switch (period) {
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
    }
    
    // Get orders in date range containing vendor's products
    const orders = await Order.find({
      'items.product': { $in: productIds },
      createdAt: { $gte: startDate, $lte: currentDate },
      status: { $ne: 'cancelled' }
    }).sort('createdAt');
    
    // Group orders by day, only counting revenue from vendor's products
    const salesByDay = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!salesByDay[date]) {
        salesByDay[date] = {
          count: 0,
          revenue: 0
        };
      }
      
      let orderContainsVendorProduct = false;
      let vendorRevenueFromOrder = 0;
      
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          orderContainsVendorProduct = true;
          vendorRevenueFromOrder += item.price * item.quantity;
        }
      });
      
      if (orderContainsVendorProduct) {
        salesByDay[date].count += 1;
        salesByDay[date].revenue += vendorRevenueFromOrder;
      }
    });
    
    // Convert to array format for frontend charts
    const salesData = Object.keys(salesByDay).map(date => ({
      date,
      orders: salesByDay[date].count,
      revenue: salesByDay[date].revenue
    }));
    
    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching vendor sales stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get top selling products
 * @route   GET /api/dashboard/top-products
 * @access  Private/Admin
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Aggregate to find top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          totalSold: 1,
          revenue: 1,
          image: { $arrayElemAt: ['$productDetails.images', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get vendor's top selling products
 * @route   GET /api/dashboard/vendor/top-products
 * @access  Private/Vendor
 */
exports.getVendorTopProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit = 5 } = req.query;
    
    // Get vendor's product IDs
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Aggregate to find top selling products for this vendor
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.product': { $in: productIds } } },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          totalSold: 1,
          revenue: 1,
          image: { $arrayElemAt: ['$productDetails.images', 0] }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Error fetching vendor top products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get recent orders
 * @route   GET /api/dashboard/recent-orders
 * @access  Private/Admin
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get vendor's recent orders
 * @route   GET /api/dashboard/vendor/recent-orders
 * @access  Private/Vendor
 */
exports.getVendorRecentOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit = 10 } = req.query;
    
    // Get vendor's product IDs
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Find orders containing vendor's products
    const recentOrders = await Order.find({
      'items.product': { $in: productIds }
    })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('user', 'name email');
    
    // Modify the orders to include only this vendor's items
    const modifiedOrders = recentOrders.map(order => {
      const orderObj = order.toObject();
      
      // Filter items to only include this vendor's products
      orderObj.items = orderObj.items.filter(item => 
        productIds.some(id => id.toString() === item.product.toString())
      );
      
      // Calculate vendor's subtotal for this order
      orderObj.vendorSubtotal = orderObj.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      return orderObj;
    });
    
    res.status(200).json({
      success: true,
      data: modifiedOrders
    });
  } catch (error) {
    console.error('Error fetching vendor recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/dashboard/user-stats
 * @access  Private/Admin
 */
exports.getUserStats = async (req, res) => {
  try {
    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get user registration by month for the last year
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format for frontend consumption
    const formattedUsersByMonth = usersByMonth.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      users: item.count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        newUsers,
        usersByMonth: formattedUsersByMonth
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get low stock products
 * @route   GET /api/dashboard/vendor/low-stock
 * @access  Private/Vendor
 */
exports.getVendorLowStockProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit = 10 } = req.query;
    
    // Find vendor's products with low stock
    const lowStockProducts = await Product.find({
      seller: vendorId,
      stockCount: { $lt: 10 }
    })
    .sort('stockCount')
    .limit(parseInt(limit))
    .select('name stockCount price images');
    
    res.status(200).json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching vendor low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get recent reviews for vendor products
 * @route   GET /api/dashboard/vendor/recent-reviews
 * @access  Private/Vendor
 */
exports.getVendorRecentReviews = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit = 5 } = req.query;
    
    // Get vendor's product IDs
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Find recent reviews for vendor's products
    const recentReviews = await Review.find({
      product: { $in: productIds }
    })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('user', 'name avatar')
    .populate('product', 'name images');
    
    res.status(200).json({
      success: true,
      data: recentReviews
    });
  } catch (error) {
    console.error('Error fetching vendor recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get vendor analytics data
 * @route   GET /api/dashboard/vendor/analytics
 * @access  Private/Vendor
 */
exports.getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get time frame from query (defaults to 30 days)
    const timeFrame = req.query.timeFrame || '30days';
    let startDate = new Date();
    
    switch (timeFrame) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get all products from this vendor
    const vendorProducts = await Product.find({ seller: vendorId }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          sales: {
            data: [],
            total: 0,
            growth: 0
          },
          orders: {
            data: [],
            total: 0,
            growth: 0
          },
          products: {
            total: 0,
            published: 0,
            outOfStock: 0
          },
          topProducts: [],
          revenueByCategory: []
        }
      });
    }
    
    // Get orders containing vendor's products within the time frame
    const orders = await Order.find({
      'items.product': { $in: productIds },
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    }).sort('createdAt');
    
    // Calculate revenue and order counts for each day
    const salesByDay = {};
    const productSales = {};
    const categorySales = {};
    let totalRevenue = 0;
    let totalOrders = 0;
    
    // Keep track of processed order IDs to avoid counting the same order twice
    const processedOrderIds = new Set();
    
    for (const order of orders) {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!salesByDay[date]) {
        salesByDay[date] = {
          revenue: 0,
          orders: 0
        };
      }
      
      let orderRevenueForVendor = 0;
      let orderContainsVendorProduct = false;
      
      // Only count items from this vendor
      for (const item of order.items) {
        if (productIds.some(id => id.equals(item.product))) {
          orderContainsVendorProduct = true;
          orderRevenueForVendor += item.price * item.quantity;
          
          // Track sales by product
          const productId = item.product.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              revenue: 0,
              quantity: 0,
              name: item.name,
              image: item.image
            };
          }
          
          productSales[productId].revenue += item.price * item.quantity;
          productSales[productId].quantity += item.quantity;
          
          // If we have category info, track sales by category
          const product = await Product.findById(item.product).populate('category', 'name');
          if (product && product.category) {
            const categoryId = product.category._id.toString();
            const categoryName = product.category.name;
            
            if (!categorySales[categoryId]) {
              categorySales[categoryId] = {
                revenue: 0,
                orders: 0,
                name: categoryName
              };
            }
            
            categorySales[categoryId].revenue += item.price * item.quantity;
          }
        }
      }
      
      if (orderContainsVendorProduct) {
        salesByDay[date].revenue += orderRevenueForVendor;
        totalRevenue += orderRevenueForVendor;
        
        if (!processedOrderIds.has(order._id.toString())) {
          salesByDay[date].orders += 1;
          totalOrders += 1;
          processedOrderIds.add(order._id.toString());
          
          // Increment category order count (only once per order)
          for (const item of order.items) {
            if (productIds.some(id => id.equals(item.product))) {
              const product = await Product.findById(item.product).populate('category', 'name');
              if (product && product.category) {
                const categoryId = product.category._id.toString();
                categorySales[categoryId].orders += 1;
                break; // Only count the category once per order
              }
            }
          }
        }
      }
    }
    
    // Calculate growth by comparing to previous period
    const calculateGrowth = async (currentPeriodStart, metricType) => {
      const previousPeriodStart = new Date(currentPeriodStart);
      const timeDiff = new Date() - currentPeriodStart;
      previousPeriodStart.setTime(previousPeriodStart.getTime() - timeDiff);
      
      const previousPeriodOrders = await Order.find({
        'items.product': { $in: productIds },
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
        status: { $ne: 'cancelled' }
      });
      
      let previousPeriodRevenue = 0;
      let previousPeriodOrderCount = 0;
      const processedIds = new Set();
      
      for (const order of previousPeriodOrders) {
        let orderRevenueForVendor = 0;
        let containsVendorProduct = false;
        
        for (const item of order.items) {
          if (productIds.some(id => id.equals(item.product))) {
            containsVendorProduct = true;
            orderRevenueForVendor += item.price * item.quantity;
          }
        }
        
        if (containsVendorProduct) {
          previousPeriodRevenue += orderRevenueForVendor;
          
          if (!processedIds.has(order._id.toString())) {
            previousPeriodOrderCount += 1;
            processedIds.add(order._id.toString());
          }
        }
      }
      
      if (metricType === 'revenue') {
        return previousPeriodRevenue === 0
          ? 100 // If previous period had 0 revenue, consider it 100% growth
          : parseFloat((((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(2));
      } else {
        return previousPeriodOrderCount === 0
          ? 100 // If previous period had 0 orders, consider it 100% growth
          : parseFloat((((totalOrders - previousPeriodOrderCount) / previousPeriodOrderCount) * 100).toFixed(2));
      }
    };
    
    const revenueGrowth = await calculateGrowth(startDate, 'revenue');
    const orderGrowth = await calculateGrowth(startDate, 'orders');
    
    // Format sales data for charts
    const salesData = Object.keys(salesByDay).map(date => ({
      date,
      revenue: salesByDay[date].revenue,
      orders: salesByDay[date].orders
    }));
    
    // Get top selling products
    const topProducts = Object.keys(productSales)
      .map(id => ({
        id,
        ...productSales[id]
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Format category sales data
    const revenueByCategory = Object.keys(categorySales)
      .map(id => ({
        id,
        ...categorySales[id]
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // Get product stats
    const productStats = {
      total: await Product.countDocuments({ seller: vendorId }),
      published: await Product.countDocuments({ seller: vendorId, published: true }),
      outOfStock: await Product.countDocuments({ seller: vendorId, stockCount: 0 })
    };
    
    res.status(200).json({
      success: true,
      data: {
        sales: {
          data: salesData,
          total: totalRevenue,
          growth: revenueGrowth
        },
        orders: {
          data: salesData,
          total: totalOrders,
          growth: orderGrowth
        },
        products: productStats,
        topProducts,
        revenueByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 