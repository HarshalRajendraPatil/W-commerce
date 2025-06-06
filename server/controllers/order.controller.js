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
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: Date.now() }
      });
      
      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }
      
      // Check if minimum purchase requirement is met
      if (coupon?.minimumPurchase && itemsPrice < coupon?.minimumPurchase) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase of $${coupon?.minimumPurchase} required to use this coupon`
        });
      }
      
      // Check if user has already used this coupon (if it's single-use)
      if (coupon?.isSingleUse) {
        const usedCoupon = await Order.findOne({
          user: req.user.id,
          coupon: coupon._id
        });
        
        if (usedCoupon) {
          return res.status(400).json({
            success: false,
            message: 'You have already used this coupon'
          });
        }
      }
      
      // Calculate discount
      if (coupon?.discountType === 'percentage') {
        discountAmount = (itemsPrice * coupon.discountValue) / 100;
        
        // Apply maximum discount if specified
        if (coupon?.maximumDiscount && discountAmount > coupon?.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        // Fixed amount discount
        discountAmount = coupon?.discountValue;
        
        // Ensure discount doesn't exceed order total
        if (discountAmount > itemsPrice) {
          discountAmount = itemsPrice;
        }
      }
      
      couponId = coupon._id;
    }
    
    // Calculate prices
    const taxRate = 0.18; // 18% tax rate (could be configurable)
    const taxPrice = parseFloat((itemsPrice * taxRate).toFixed(2));
    
    // Calculate shipping price (free shipping over $100)
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    
    // Calculate total price
    const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice - discountAmount).toFixed(2));
    
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
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Admin/Vendor)
 */
exports.getOrders = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Filter by vendor if vendor role
    if (req.user.role === 'vendor') {
      // Get products owned by vendor
      const vendorProducts = await Product.find({ seller: req.user.id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);
      
      // Filter orders containing vendor's products
      queryObj['items.product'] = { $in: productIds };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    let query = Order.find(queryObj)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    // Select specific fields if requested
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    
    const orders = await query;
    
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
    // Get total orders and revenue
    const totalStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          totalPaidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } },
          paidRevenue: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } }
        }
      }
    ]);
    
    // Get order stats by status
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    // Get orders by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get popular products from orders
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
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
          productName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          productImage: { 
            $cond: {
              if: { $gt: [{ $size: '$productDetails.images' }, 0] },
              then: { $arrayElemAt: [{ $arrayElemAt: ['$productDetails.images', 0] }, 0] },
              else: null
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: totalStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalPaidOrders: 0,
          paidRevenue: 0
        },
        ordersByStatus: statusStats,
        dailyOrders,
        popularProducts
      }
    });
  } catch (err) {
    next(err);
  }
}; 