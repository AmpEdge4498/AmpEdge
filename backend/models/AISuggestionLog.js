const mongoose = require('mongoose');

const AISuggestionLogSchema = new mongoose.Schema({
  bomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'BOM',
    required: true,
    index: true
  },
  bomItemIndex: {
    type: Number,
    required: true
  },
  inputQuery: {
    type: String,
    required: true
  },
  inputCategory: String,
  inputSpec: String,
  suggestedProducts: [{
    productId: { type: mongoose.Schema.ObjectId, ref: 'Product' },
    confidenceScore: Number,
    tier: String,
    wasSelected: { type: Boolean, default: false }
  }],
  selectedProductId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  },
  selectedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for analytics queries
AISuggestionLogSchema.index({ createdAt: -1 });
AISuggestionLogSchema.index({ 'suggestedProducts.wasSelected': 1 });

module.exports = mongoose.model('AISuggestionLog', AISuggestionLogSchema);
