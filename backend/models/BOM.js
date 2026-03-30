const mongoose = require('mongoose');

const BOMItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pcs', trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
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

// Auto-calculate totals before save
BOMSchema.pre('save', function(next) {
  this.totalMaterialCost = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.grandTotal = this.totalMaterialCost + this.laborCharge;
  next();
});

module.exports = mongoose.model('BOM', BOMSchema);
