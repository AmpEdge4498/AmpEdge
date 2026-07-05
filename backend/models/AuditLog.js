const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'TOKEN_REFRESH', 'PASSWORD_CHANGE', 'ADMIN_ACTION'],
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  deviceFingerprint: {
    type: String,
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // 90 days in seconds
  },
});

AuditLogSchema.index({ user: 1, action: 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
