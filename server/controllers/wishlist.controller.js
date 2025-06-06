const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
exports.getWishlist = async (req, res) => {
  try {
    // Find wishlist for the current user or create a new one
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products',
        select: 'name price discountPercentage images averageRating numReviews stockCount'
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        user: req.user.id, 
        products: [],
        name: 'My Wishlist'
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find user wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId],
        name: 'My Wishlist'
      });
    } else {
      // Check if product already in wishlist
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    // Return updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products',
        select: 'name price discountPercentage images averageRating numReviews stockCount'
      });

    res.status(200).json({
      success: true,
      data: updatedWishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Private
 */
exports.isInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    // If no wishlist, product is not in wishlist
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }

    // Check if product is in wishlist
    const isInWishlist = wishlist.products.includes(productId);

    res.status(200).json({
      success: true,
      inWishlist: isInWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product
    wishlist.products = wishlist.products.filter(
      product => product.toString() !== productId
    );

    await wishlist.save();

    // Return updated wishlist
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products',
        select: 'name price discountPercentage images averageRating numReviews stockCount'
      });

    res.status(200).json({
      success: true,
      data: updatedWishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
exports.clearWishlist = async (req, res) => {
  try {
    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Clear products
    wishlist.products = [];

    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 