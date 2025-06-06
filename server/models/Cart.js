const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity can not be less than 1'],
          default: 1
        },
        price: {
          type: Number,
          required: true
        },
        selectedVariants: [
          {
            name: String,
            value: String
          }
        ],
        total: {
          type: Number
        }
      }
    ],
    totalItems: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    discountAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Calculate totals before saving
CartSchema.pre('save', function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    item.total = item.price * item.quantity;
  });

  // Calculate cart totals
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + item.total, 0);

  // Apply discount if coupon exists
  if (this.discountAmount > 0) {
    this.totalPrice -= this.discountAmount;
    // Ensure total is not negative
    if (this.totalPrice < 0) {
      this.totalPrice = 0;
    }
  }

  next();
});

module.exports = mongoose.model('Cart', CartSchema); 