const mongoose = require('mongoose');

const VendorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Please provide your business name'],
      trim: true
    },
    businessAddress: {
      type: String,
      required: [true, 'Please provide your business address'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VendorApplication', VendorApplicationSchema); 