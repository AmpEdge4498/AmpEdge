const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    enum: ['REPAIR', 'INSTALLATION', 'EMERGENCY', 'COMMERCIAL'],
    required: true,
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price'],
  },
  estimatedDuration: {
    type: Number, // In minutes
    required: true,
    default: 60
  },
  city: {
    type: String,
    trim: true,
    index: true, // For scalable multi-city geo lookups
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
