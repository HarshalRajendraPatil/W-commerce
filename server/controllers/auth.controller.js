const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const VendorApplication = require('../models/VendorApplication');
const Product = require('../models/Product');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer', // Only allow customer and vendor for registration
      verificationToken,
      verificationExpire
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const message = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        html: message
      });

      // Get token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Get token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user with matching token and token not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click on the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Get token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // Get token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    
    // Fields that can be updated by any user
    const allowedFields = {
      name: name,
      phone: phone,
      avatar: avatar
    };
    
    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => 
      allowedFields[key] === undefined && delete allowedFields[key]
    );
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
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
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Add/update user address
// @route   PUT /api/auth/address
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId, street, city, state, country, zipCode, isDefault } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If updating an existing address
    if (addressId) {
      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );
      
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }
      
      // Update address fields
      if (street) user.addresses[addressIndex].street = street;
      if (city) user.addresses[addressIndex].city = city;
      if (state) user.addresses[addressIndex].state = state;
      if (country) user.addresses[addressIndex].country = country;
      if (zipCode) user.addresses[addressIndex].zipCode = zipCode;
      
      // If setting as default, unset other default addresses
      if (isDefault) {
        user.addresses.forEach((addr, idx) => {
          addr.isDefault = idx === addressIndex;
        });
      } else {
        user.addresses[addressIndex].isDefault = false;
      }
    } 
    // Adding a new address
    else {
      const newAddress = {
        street,
        city,
        state,
        country,
        zipCode,
        isDefault: isDefault || false
      };
      
      // If setting as default, unset other default addresses
      if (newAddress.isDefault) {
        user.addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      // If it's the first address, make it default
      if (user.addresses.length === 0) {
        newAddress.isDefault = true;
      }
      
      user.addresses.push(newAddress);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete user address
// @route   DELETE /api/auth/address/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find address index
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === id
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault;
    
    // Remove address
    user.addresses.splice(addressIndex, 1);
    
    // If it was the default address and there are other addresses, make the first one default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user profile with extended data
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    // Get user with populated data based on role
    let userData;
    
    // Basic user data
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    userData = {
      ...user.toObject()
    };
    
    // Add role-specific data
    if (user.role === 'customer') {
      // Get order count and total spent
      const orders = await Order.find({ 
        user: req.user.id,
        status: { $nin: ['cancelled', 'refunded'] }
      });
      
      const orderCount = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      // Get wishlist count
      const wishlistCount = await Wishlist.countDocuments({ user: req.user.id });
      
      // Get review count
      const reviewCount = await Review.countDocuments({ user: req.user.id });
      
      userData.stats = {
        orderCount,
        totalSpent,
        wishlistCount,
        reviewCount
      };
    }
    else if (user.role === 'vendor') {
      // Get vendor-specific data from the vendor application
      const vendorApplication = await VendorApplication.findOne({ 
        user: req.user.id,
        status: 'approved'
      });
      
      if (vendorApplication) {
        userData.vendorInfo = {
          businessName: vendorApplication.businessName,
          businessAddress: vendorApplication.businessAddress,
          phoneNumber: vendorApplication.phoneNumber,
          description: vendorApplication.description,
          approvedDate: vendorApplication.updatedAt
        };
      }
      
      // Get product count
      const productCount = await Product.countDocuments({ 
        user: req.user.id,
        isActive: true
      });
      
      // Get total sales
      const orders = await Order.find({ 
        'items.product': { $in: await Product.find({ user: req.user.id }).distinct('_id') },
        status: { $nin: ['cancelled', 'refunded'] }
      });
      
      const totalSales = orders.reduce((sum, order) => {
        // Only count items from this vendor
        const vendorItems = order.items.filter(async (item) => {
          const product = await Product.findById(item.product);
          return product && product.user.toString() === req.user.id;
        });
        
        return sum + vendorItems.reduce((itemSum, item) => itemSum + item.total, 0);
      }, 0);
      
      userData.stats = {
        productCount,
        totalSales,
        orderCount: orders.length
      };
    }
    else if (user.role === 'admin') {
      // Admin doesn't need additional stats in profile
      userData.stats = {};
    }
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
}; 