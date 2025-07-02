const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please add a rating between 1 and 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    images: [
      {
        url: String,
        public_id: String,
        caption: String
      }
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isRejected: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String
    },
    likes: {
      type: Number,
      default: 0
    },
    usersLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    vendorResponse: {
      text: {
        type: String,
        trim: true,
        maxlength: [1000, 'Response cannot be more than 1000 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating for a product
ReviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: obj[0].averageRating.toFixed(1),
        numReviews: obj[0].numReviews
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function (next) {
  this.constructor.getAverageRating(this.product);
  next();
});

module.exports = mongoose.model('Review', ReviewSchema); 