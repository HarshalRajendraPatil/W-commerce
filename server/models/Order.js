const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
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
        name: String,
        image: String,
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity can not be less than 1']
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
        total: Number
      }
    ],
    shippingAddress: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      phone: String
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'razorpay', 'cod']
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    discountAmount: {
      type: Number,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
        'refunded'
      ],
      default: 'pending'
    },
    statusUpdates: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned',
            'refunded'
          ]
        },
        updatedAt: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ],
    trackingNumber: String,
    deliveredAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    returnedAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    notes: String
  },
  {
    timestamps: true
  }
);

// Update status history when status changes
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusUpdates.push({
      status: this.status,
      updatedAt: Date.now()
    });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema); 