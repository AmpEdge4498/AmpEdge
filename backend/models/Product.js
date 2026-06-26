const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [150, 'Name can not be more than 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  tier: {
    type: String,
    enum: ['BUDGET', 'MID_RANGE', 'PREMIUM'],
    default: 'MID_RANGE'
  },
  category: {
    type: String,
    enum: ['WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME'],
    default: 'WIRING_MATERIALS'
  },
  specifications: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  stock: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  popularity: {
    type: Number,
    default: 0
  },
  // Computed field for AI search — combined text for keyword matching
  searchText: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-compute searchText before save for AI keyword matching
ProductSchema.pre('save', function(next) {
  const parts = [
    this.name,
    this.brand,
    this.description,
    this.specifications,
    ...(this.tags || [])
  ].filter(Boolean);
  this.searchText = parts.join(' ').toLowerCase();
  next();
});

// Text index for efficient search
ProductSchema.index({ searchText: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
