const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'TECHNICIAN', 'ADMIN'],
    default: 'CUSTOMER',
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  // Technician specific fields
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING_KYC'],
    default: 'PENDING_KYC',
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
  },
  earnings: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Number,
    default: 0
  },
  // Customer specific fields
  addresses: [{
    label: String, // e.g., Home, Office
    addressText: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  // Extra Features fields
  subscriptionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription'
  },
  subscriptionExpiry: {
    type: Date
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
