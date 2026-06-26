const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  technicianId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true,
  },
  serviceId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true,
  },
  bomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'BOM',
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'BOM_PENDING', 'BOM_SUBMITTED', 'BOM_APPROVED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  // ── Expanded Address Schema ──
  serviceAddress: {
    houseNo: { type: String, trim: true },
    street: { type: String, trim: true },
    landmark: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
    },
    addressText: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bomTotal: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
  },
  invoiceDetails: {
    invoiceUrl: String,
    generatedAt: Date,
  },
  // Customer notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for common queries
BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ technicianId: 1, status: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
