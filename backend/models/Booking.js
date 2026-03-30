const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  serviceId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  bomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'BOM',
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'BOM_PENDING', 'BOM_SUBMITTED', 'BOM_APPROVED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  serviceAddress: {
    addressText: { type: String, required: true },
    city: { type: String, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bomTotal: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 }
  },
  invoiceDetails: {
    invoiceUrl: String,
    generatedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
