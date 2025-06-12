const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      paymentMethodId
    } = req.body;
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.country || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address'
      });
    }
    
    // Validate payment method
    const validPaymentMethods = ['card', 'paypal', 'razorpay', 'cod'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment method'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images stockCount discountPercentage variants'
      });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }
    
    // Process items from cart and validate availability
    const orderItems = [];
    let itemsPrice = 0;
    
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      // Check if product exists and is available
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product in your cart no longer exists`
        });
      }
      
      if (product.stockCount < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockCount}`
        });
      }
      
      // Calculate price with any product discount
      const productPrice = product.discountPercentage > 0
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;
      
      // Get primary or first image
      const productImage = product.images && product.images.length > 0
        ? product.images.find(img => img.isPrimary)?.url || product.images[0].url
        : null;
      
      // Calculate item total
      const itemTotal = productPrice * cartItem.quantity;
      
      // Add to total price
      itemsPrice += itemTotal;
      
      // Create order item
      orderItems.push({
        product: product._id,
        name: product.name,
        image: productImage,
        quantity: cartItem.quantity,
        price: productPrice,
        selectedVariants: cartItem.selectedVariants || [],
        total: itemTotal
      });
    }
    
    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;
    
    if (couponCode) {
      // Find coupon by code, not by ID
      const coupon = await Coupon.findOne({ code: couponCode });
      
      console.log(`Coupon lookup for code ${couponCode}:`, coupon);
      
      if (!coupon || !coupon.isActive || new Date(coupon.endDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }
      
      // Check if minimum purchase requirement is met
      if (coupon?.minPurchase && itemsPrice < coupon.minPurchase) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase of $${coupon.minPurchase} required to use this coupon`
        });
      }
      
      // Check if user has already used this coupon and reached per-user limit
      if (coupon?.perUserLimit > 0) {
        const usedCount = await Order.countDocuments({
          user: req.user.id,
          coupon: coupon._id
        });
        
        if (usedCount >= coupon.perUserLimit) {
          return res.status(400).json({
            success: false,
            message: `You have reached the usage limit (${coupon.perUserLimit}) for this coupon`
          });
        }
      }
      
      // Calculate discount
      if (coupon && coupon.type === 'percentage') {
        discountAmount = (itemsPrice * coupon.value) / 100;
        
        // Apply maximum discount if specified
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon) {
        // Fixed amount discount
        discountAmount = coupon.value;
        
        // Ensure discount doesn't exceed order total
        if (discountAmount > itemsPrice) {
          discountAmount = itemsPrice;
        }
      } else {
        // No valid coupon
        discountAmount = 0;
      }
      
      // Set coupon ID only if coupon exists
      if (coupon && coupon._id) {
        couponId = coupon._id;
      }
    }
    
    // Calculate prices
    const taxRate = 0.18; // 18% tax rate (could be configurable)
    const taxPrice = parseFloat((itemsPrice * taxRate).toFixed(2));
    
    // Calculate shipping price (free shipping over $100)
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    
    // Ensure all numbers are valid
    const validItemsPrice = isNaN(itemsPrice) ? 0 : itemsPrice;
    const validTaxPrice = isNaN(taxPrice) ? 0 : taxPrice;
    const validShippingPrice = isNaN(shippingPrice) ? 0 : shippingPrice;
    const validDiscountAmount = isNaN(discountAmount) ? 0 : discountAmount;
    
    // Calculate total price with safety checks
    const totalPrice = parseFloat((validItemsPrice + validTaxPrice + validShippingPrice - validDiscountAmount).toFixed(2));
    
    // Generate unique tracking number
    const generateTrackingNumber = () => {
      const prefix = 'WC';
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${prefix}${timestamp}${random}`;
    };
    
    const trackingNumber = generateTrackingNumber();
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress, // Use shipping address as billing if not provided
      paymentMethod,
      paymentMethodId, // Store payment method ID if provided
      trackingNumber, // Auto-generated tracking number
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
      coupon: couponId,
      status: paymentMethod === 'cod' ? 'processing' : 'pending'
    });
    
    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: -item.quantity }
      });
    }
    
    // Clear cart after successful order creation
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/admin
 * @access  Private (Admin)
 */
exports.getOrders = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'startDate', 'endDate', 'minAmount', 'maxAmount'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Filter by status if provided
    if (req.query.status) {
      queryObj.status = req.query.status;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      queryObj.createdAt = {};
      
      if (req.query.startDate) {
        queryObj.createdAt.$gte = new Date(req.query.startDate);
        // Set time to beginning of day
        queryObj.createdAt.$gte.setHours(0, 0, 0, 0);
      }
      
      if (req.query.endDate) {
        queryObj.createdAt.$lte = new Date(req.query.endDate);
        // Set time to end of day
        queryObj.createdAt.$lte.setHours(23, 59, 59, 999);
      }
    }
    
    // Amount range filter
    if (req.query.minAmount || req.query.maxAmount) {
      queryObj.totalPrice = {};
      
      if (req.query.minAmount) {
        queryObj.totalPrice.$gte = parseFloat(req.query.minAmount);
      }
      
      if (req.query.maxAmount) {
        queryObj.totalPrice.$lte = parseFloat(req.query.maxAmount);
      }
    }
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      // First, find users that match the search term
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      // Check if search might be for an order ID
      const orderIdMatch = req.query.search.match(/^[a-f\d]{24}$/i) ? 
        { _id: req.query.search } : {};
      
      // Check if search might be for a tracking number
      const trackingNumberMatch = { trackingNumber: searchRegex };
      
      // Combine all search conditions
      const searchConditions = [
        { 'items.name': searchRegex },
        { user: { $in: userIds } },
        orderIdMatch,
        trackingNumberMatch
      ];
      
      // If original query had other conditions, we need to combine them with the search
      if (Object.keys(queryObj).length > 0) {
        queryObj.$and = [
          { $or: searchConditions },
          { ...queryObj }
        ];
      } else {
        queryObj.$or = searchConditions;
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query with population
    let query = Order.find(queryObj)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    const orders = await query;
    
    // Get total count for pagination
    const total = await Order.countDocuments(queryObj);
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'coupon',
        select: 'code discountType discountValue'
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && 
        order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin/Vendor)
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, note } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    let order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Add status history entry
    const statusUpdate = {
      status,
      updatedAt: Date.now(),
      note: note || ''
    };
    
    // Update order fields
    const updateData = {
      status,
      statusUpdates: [...order.statusUpdates, statusUpdate]
    };
    
    // Add tracking number if provided
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    // Update timestamps based on status
    if (status === 'delivered') {
      updateData.deliveredAt = Date.now();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = Date.now();
    } else if (status === 'returned') {
      updateData.returnedAt = Date.now();
    } else if (status === 'refunded') {
      updateData.refundedAt = Date.now();
    }
    
    // Update order
    order = await Order.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    // If order is cancelled or returned, restore product quantities
    if ((status === 'cancelled' || status === 'returned') && 
        (order.status !== 'cancelled' && order.status !== 'returned')) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockCount: item.quantity }
        });
      }
    }
    
    // Send email notification to customer (implementation would depend on your email service)
    // sendOrderStatusEmail(order.user.email, order, status);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled
    if (['delivered', 'returned', 'refunded', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status}`
      });
    }
    
    // Add status history entry
    const statusUpdate = {
      status: 'cancelled',
      updatedAt: Date.now(),
      note: reason || 'Cancelled by customer'
    };
    
    // Update order
    order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: Date.now(),
        statusUpdates: [...order.statusUpdates, statusUpdate],
        notes: order.notes 
          ? `${order.notes}\n\nCancellation reason: ${reason || 'Not provided'}`
          : `Cancellation reason: ${reason || 'Not provided'}`
      },
      { new: true }
    );
    
    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity }
      });
    }
    
    // Process refund if payment was made (implementation would depend on payment provider)
    if (order.isPaid) {
      // Handle refund process based on payment method
      // processRefund(order);
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get orders for logged in user
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getOrdersByUser = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter by status if provided
    const queryObj = { user: req.user.id };
    if (req.query.status) {
      queryObj.status = req.query.status;
    }
    
    const orders = await Order.find(queryObj)
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');
    
    // Get total count
    const total = await Order.countDocuments(queryObj);
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total
    };
    
    res.status(200).json({
      success: true,
      pagination,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Process payment with Razorpay
 * @route   POST /api/orders/payment
 * @access  Private
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    
    // Validate inputs
    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all payment details'
      });
    }
    
    // Get order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this order'
      });
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }
    
    // Verify Razorpay payment
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");
    
    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    // Update order based on payment status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: razorpayPaymentId,
      order_id: razorpayOrderId,
      signature: razorpaySignature,
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        paymentId: razorpayPaymentId,
        order: order
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get payment status
 * @route   GET /api/orders/:id/payment-status
 * @access  Private
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure order belongs to user or user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view payment status for this order'
      });
    }
    
    // If payment result exists, return it
    if (order.paymentResult && order.paymentResult.id) {
      return res.status(200).json({
        success: true,
        data: {
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentResult.status,
          paymentId: order.paymentResult.id
        }
      });
    }
    
    // If no payment has been processed
    res.status(200).json({
      success: true,
      data: {
        isPaid: order.isPaid,
        paymentMethod: order.paymentMethod,
        paymentStatus: 'No payment processed'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Razorpay order
 * @route   POST /api/orders/create-razorpay-order
 * @access  Private
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order ID'
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create payment for this order'
      });
    }
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), // Convert to smallest currency unit
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Track order by tracking number
 * @route   GET /api/orders/track/:trackingNumber
 * @access  Public
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tracking number'
      });
    }
    
    const order = await Order.findOne({ trackingNumber })
      .select('status trackingNumber statusUpdates shippingAddress items.name createdAt deliveredAt expectedDeliveryDate');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with this tracking number'
      });
    }
    
    // Calculate expected delivery date (7 days from order date if not set)
    const expectedDeliveryDate = order.expectedDeliveryDate || new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    res.status(200).json({
      success: true,
      data: {
        trackingNumber: order.trackingNumber,
        status: order.status,
        statusHistory: order.statusUpdates,
        expectedDeliveryDate,
        deliveredAt: order.deliveredAt,
        shippingAddress: order.shippingAddress,
        items: order.items.map(item => item.name)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get order analytics
 * @route   GET /api/orders/analytics
 * @access  Private (Admin)
 */
exports.getOrderAnalytics = async (req, res, next) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { 
            $sum: {
              $cond: [
                { $ne: ['$status', 'cancelled'] },
                '$totalPrice',
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format for frontend consumption
    const formattedDailyRevenue = dailyRevenue.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      revenue: item.revenue,
      count: item.count
    }));
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          product: { $arrayElemAt: ['$product', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          productName: '$product.name',
          productImage: { $arrayElemAt: ['$product.images', 0] }
        }
      }
    ]);
    
    // Calculate total revenue (excluding cancelled orders)
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Get orders created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get revenue from today
    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: today },
          status: { $ne: 'cancelled' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        todayOrders,
        todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            revenue: item.revenue
          };
          return acc;
        }, {}),
        dailyRevenue: formattedDailyRevenue,
        topSellingProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get vendor orders (orders containing products from the vendor)
 * @route   GET /api/orders/vendor
 * @access  Private/Vendor
 */
exports.getVendorOrders = async (req, res, next) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get all products from this vendor
    const vendorProducts = await Product.find({ seller: req.user.id }, '_id');
    const productIds = vendorProducts.map(product => product._id);
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: {
          current: page,
          total: 0,
          count: 0
        },
        data: []
      });
    }
    
    // Build filter - only include orders that contain this vendor's products
    const filter = {
      'items.product': { $in: productIds }
    };
    
    // Apply additional filters if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { trackingNumber: searchRegex },
        { 'shippingAddress.name': searchRegex },
        { 'shippingAddress.email': searchRegex }
      ];
    }
    
    // Find orders containing this vendor's products
    const orders = await Order.find(filter)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .sort(req.query.sort || '-createdAt')
      .skip(startIndex)
      .limit(limit);
    
    // Count total matching orders
    const total = await Order.countDocuments(filter);
    
    // Modify orders to only include this vendor's items and calculate vendor's revenue
    const modifiedOrders = orders.map(order => {
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
    
    // Get order counts by status (for UI filters)
    const statusCounts = {
      total: await Order.countDocuments({ 'items.product': { $in: productIds } }),
      pending: await Order.countDocuments({ 'items.product': { $in: productIds }, status: 'pending' }),
      processing: await Order.countDocuments({ 'items.product': { $in: productIds }, status: 'processing' }),
      shipped: await Order.countDocuments({ 'items.product': { $in: productIds }, status: 'shipped' }),
      delivered: await Order.countDocuments({ 'items.product': { $in: productIds }, status: 'delivered' }),
      cancelled: await Order.countDocuments({ 'items.product': { $in: productIds }, status: 'cancelled' })
    };
    
    // Pagination result
    const pagination = {
      current: page,
      total: Math.ceil(total / limit),
      count: total,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: modifiedOrders.length,
      pagination,
      statusCounts,
      data: modifiedOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor order details
 * @route   GET /api/orders/vendor/:id
 * @access  Private/Vendor
 */
exports.getVendorOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'name email phone'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order contains products from this vendor
    const vendorProducts = await Product.find({ seller: req.user.id }, '_id');
    const productIds = vendorProducts.map(product => product._id.toString());
    
    const hasVendorProducts = order.items.some(item => 
      productIds.includes(item.product.toString())
    );
    
    if (!hasVendorProducts) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }
    
    // Filter items to only include this vendor's products
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => 
      productIds.includes(item.product.toString())
    );
    
    // Calculate vendor's subtotal for this order
    orderObj.vendorSubtotal = orderObj.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    res.status(200).json({
      success: true,
      data: orderObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order item fulfillment status (for vendor)
 * @route   PATCH /api/orders/:id/fulfill
 * @access  Private/Vendor
 */
exports.updateOrderItemFulfillment = async (req, res, next) => {
  try {
    const { itemIds, fulfillmentStatus, trackingInfo } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item IDs to update'
      });
    }
    
    if (!fulfillmentStatus || !['processing', 'shipped', 'delivered'].includes(fulfillmentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid fulfillment status (processing, shipped, or delivered)'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get vendor products
    const vendorProducts = await Product.find({ seller: req.user.id }, '_id');
    const vendorProductIds = vendorProducts.map(product => product._id.toString());
    
    // Make sure all items belong to this vendor
    for (const itemId of itemIds) {
      const item = order.items.id(itemId);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item with ID ${itemId} not found in this order`
        });
      }
      
      if (!vendorProductIds.includes(item.product.toString())) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to update item with ID ${itemId}`
        });
      }
    }
    
    // Update the fulfillment status of each item
    for (const itemId of itemIds) {
      const item = order.items.id(itemId);
      item.fulfillmentStatus = fulfillmentStatus;
      
      // Add tracking info if provided and status is shipped
      if (trackingInfo && fulfillmentStatus === 'shipped') {
        item.trackingInfo = trackingInfo;
        item.shippedAt = Date.now();
      }
      
      if (fulfillmentStatus === 'delivered') {
        item.deliveredAt = Date.now();
      }
    }
    
    // Check if all items have the same status to update the overall order status
    const allItemsFulfillmentStatus = order.items.map(item => item.fulfillmentStatus);
    const isUniform = allItemsFulfillmentStatus.every(status => status === fulfillmentStatus);
    
    if (isUniform) {
      order.status = fulfillmentStatus;
      
      if (fulfillmentStatus === 'shipped') {
        order.shippedAt = Date.now();
      }
      
      if (fulfillmentStatus === 'delivered') {
        order.deliveredAt = Date.now();
      }
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}; 