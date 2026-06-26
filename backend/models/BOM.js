const mongoose = require('mongoose');

const AISuggestionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.ObjectId, ref: 'Product' },
  productName: String,
  brand: String,
  tier: { type: String, enum: ['BUDGET', 'MID_RANGE', 'PREMIUM'] },
  price: Number,
  confidenceScore: { type: Number, min: 0, max: 1 },
  matchReason: String,
  isAvailable: Boolean,
  tags: [String]  // "Best Value", "Premium", "AI Recommended"
}, { _id: false });

const BOMItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME', 'OTHER'],
    default: 'OTHER'
  },
  quantity: { type: Number, required: true, min: 1 },
  specification: { type: String, trim: true },
  preferredBrand: { type: String, trim: true },
  imageUrl: { type: String },
  unit: { type: String, default: 'pcs', trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  // AI Suggestion Results
  aiSuggestions: [AISuggestionSchema],
  // Customer's Final Selection
  selectedProductId: { type: mongoose.Schema.ObjectId, ref: 'Product' },
  selectedAt: { type: Date }
});

const BOMSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  items: [BOMItemSchema],
  laborCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMaterialCost: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    default: 'DRAFT'
  },
  aiSuggestionsGeneratedAt: { type: Date },
  customerNotes: { type: String },
  technicianNotes: { type: String },
  adminNotes: { type: String },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-calculate totals before save + enforce max items
BOMSchema.pre('save', function(next) {
  if (this.items.length > 25) {
    return next(new Error('Maximum 25 items allowed per BOM'));
  }
  this.totalMaterialCost = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.grandTotal = this.totalMaterialCost + this.laborCharge;
  next();
});

module.exports = mongoose.model('BOM', BOMSchema);
