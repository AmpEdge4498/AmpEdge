const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  body: {
    type: String,
    required: [true, 'Notification body is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['BOOKING_UPDATE', 'ORDER_UPDATE', 'PROMOTION', 'SYSTEM', 'TECHNICIAN_ASSIGNED', 'BOM_UPDATE', 'PAYMENT'],
    default: 'SYSTEM',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient user notification queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);
