const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    name: {
      type: String,
      default: 'My Wishlist'
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate products in wishlist
WishlistSchema.methods.addProduct = function (productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
  return this.save();
};

// Remove product from wishlist
WishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (product) => product.toString() !== productId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('Wishlist', WishlistSchema); 