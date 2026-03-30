const User = require('../models/User');
const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Verify Firebase OTP & Login/Register user
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { idToken, role } = req.body; // idToken from Firebase Client Auth
    
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Please provide a valid token' });
    }

    let phone;
    
    // In development/test mode without a valid service account, we'll allow a mock bypass if provided
    // This is STRICTLY for the scaffolding phase to allow API testing without Firebase setup
    if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock-token-')) {
        phone = idToken.replace('mock-token-', '+91'); // e.g. mock-token-9876543210 -> +919876543210
    } else {
        // Verify token with Firebase Admin
        if (!admin.apps || admin.apps.length === 0) {
           return res.status(500).json({ success: false, error: 'Firebase Admin not initialized on server' });
        }
        
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        phone = decodedToken.phone_number;
    }

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number not found in token' });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // If not, create user (Signup)
    if (!user) {
      user = await User.create({
        phone,
        role: role || 'CUSTOMER' // Defaults to customer
      });
    }

    // Generate our own JWT for session management
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired OTP token' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
