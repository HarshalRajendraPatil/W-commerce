const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be positive']
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage must be positive'],
      max: [100, 'Discount percentage cannot exceed 100'],
      default: 0
    },
    images: [
      {
        publicId: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        },
        alt: {
          type: String,
          default: ''
        },
        isPrimary: {
          type: Boolean,
          default: false
        }
      }
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please add a category']
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    variants: [
      {
        name: String,
        options: [
          {
            value: String,
            priceModifier: {
              type: Number,
              default: 0
            },
            stockCount: Number,
            sku: String
          }
        ]
      }
    ],
    stockCount: {
      type: Number,
      required: [true, 'Please add a stock count'],
      min: [0, 'Stock count must be positive'],
      default: 0
    },
    sku: {
      type: String,
      unique: true
    },
    brand: {
      type: String,
      trim: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    specifications: [
      {
        name: String,
        value: String
      }
    ],
    tags: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculated sale price
ProductSchema.virtual('salePrice').get(function () {
  if (this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Add virtual field for reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Auto-generate slug from name
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    if (!this.isNew) {
      this.slug = `${this.slug}-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema); 