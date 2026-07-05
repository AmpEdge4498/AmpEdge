const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  label: { type: String, trim: true }, // e.g., Home, Office
  houseNo: { type: String, trim: true },
  street: { type: String, trim: true },
  landmark: { type: String, trim: true },
  area: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: {
    type: String,
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
  },
  addressText: { type: String, trim: true }, // Full formatted address
  coordinates: {
    lat: Number,
    lng: Number,
  },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'TECHNICIAN', 'ADMIN'],
    default: 'CUSTOMER',
    index: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
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
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  // Customer specific fields — structured addresses
  addresses: [AddressSchema],
  // Push notification token
  fcmToken: {
    type: String,
    default: null,
  },
  // Phone verification state
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  // OTP rate limiting
  lastOtpRequestAt: {
    type: Date,
    default: null,
  },
  otpRetryCount: {
    type: Number,
    default: 0,
  },
  // Extra Features fields
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
  },
  authProvider: {
    type: String,
    enum: ['email', 'phone', 'google', 'firebase'],
    default: 'email',
  },
  lastLoginAt: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  deviceFingerprints: [String],
  subscriptionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
  },
  subscriptionExpiry: {
    type: Date,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
