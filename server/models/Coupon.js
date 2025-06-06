const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type']
    },
    value: {
      type: Number,
      required: [true, 'Please add a discount value']
    },
    minPurchase: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an expiration date']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        usedCount: {
          type: Number,
          default: 1
        },
        lastUsed: {
          type: Date,
          default: Date.now
        }
      }
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Add a method to check if coupon is valid
CouponSchema.methods.isValid = function (userId, cartTotal) {
  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }

  // Check if coupon is expired
  const now = new Date();
  if (now < this.startDate || now > this.endDate) {
    return { valid: false, message: 'Coupon is expired or not yet active' };
  }

  // Check usage limit
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }

  // Check minimum purchase requirement
  if (cartTotal < this.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase amount of $${this.minPurchase} required`
    };
  }

  // Check per user limit
  if (userId && this.perUserLimit > 0) {
    const userUsage = this.usedBy.find(
      (usage) => usage.user.toString() === userId.toString()
    );
    if (userUsage && userUsage.usedCount >= this.perUserLimit) {
      return {
        valid: false,
        message: 'You have reached the usage limit for this coupon'
      };
    }
  }

  // Calculate discount
  let discount = 0;
  if (this.type === 'percentage') {
    discount = (cartTotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.value;
    if (discount > cartTotal) {
      discount = cartTotal;
    }
  }

  return {
    valid: true,
    discount,
    message: 'Coupon applied successfully'
  };
};

module.exports = mongoose.model('Coupon', CouponSchema); 