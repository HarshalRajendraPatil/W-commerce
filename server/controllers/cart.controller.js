const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res) => {
  try {
    // Find cart for the current user or create a new one
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      })
      .populate('coupon', 'code discountType discountValue');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariants = [] } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Find user cart
    let cart = await Cart.findOne({ user: req.user.id });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Calculate current price (with discount if applicable)
    const price = product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price,
        selectedVariants,
        total: price * quantity
      });
    }

    // Recalculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    // Return updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      })
      .populate('coupon', 'code discountType discountValue');

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Update cart item
 * @route   PUT /api/cart/items
 * @access  Private
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stockCount < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      })
      .populate('coupon', 'code discountType discountValue');

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountPercentage images stockCount'
      })
      .populate('coupon', 'code discountType discountValue');

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = async (req, res) => {
  try {
    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear items
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discountAmount = 0;
    cart.coupon = undefined;

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 