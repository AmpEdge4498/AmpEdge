const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['PRODUCT', 'SERVICE'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate reviews for same product/service by same user
ReviewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
