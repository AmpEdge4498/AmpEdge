const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');

// Sign JWT token
const getSignedJwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedJwtToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      }
    });
};

// @desc    Login/Register user using Firebase ID token (Google/Email)
// @route   POST /api/v1/auth/firebase-login
// @access  Public
exports.firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, role = 'CUSTOMER', fingerprint } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Please provide an idToken' });
    }

    if (!admin.apps.length) {
       return res.status(500).json({ success: false, error: 'Firebase Admin not configured' });
    }

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, phone_number, name } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Find by email or phone just in case
      let existingUser = null;
      if (email) existingUser = await User.findOne({ email });
      if (!existingUser && phone_number) existingUser = await User.findOne({ phone: phone_number });
      
      if (existingUser) {
        // Link account
        existingUser.firebaseUid = uid;
        existingUser.authProvider = 'firebase';
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = await User.create({
          name: name || (email ? email.split('@')[0] : 'User'),
          email,
          phone: phone_number,
          firebaseUid: uid,
          role,
          authProvider: 'firebase'
        });
      }
    }

    // Update login stats
    user.lastLoginAt = Date.now();
    user.loginAttempts = 0;
    if (fingerprint && !user.deviceFingerprints.includes(fingerprint)) {
      user.deviceFingerprints.push(fingerprint);
    }
    await user.save();

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// @desc    Verify Firebase phone OTP and login
// @route   POST /api/v1/auth/firebase-phone-verify
// @access  Public
exports.firebasePhoneVerify = async (req, res, next) => {
  try {
    const { idToken, role = 'CUSTOMER', fingerprint } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Please provide an idToken' });
    }

    if (!admin.apps.length) {
       return res.status(500).json({ success: false, error: 'Firebase Admin not configured' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    if (!phone_number) {
      return res.status(400).json({ success: false, error: 'Token does not contain a phone number' });
    }

    // Check if user exists by phone or firebaseUid
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { phone: phone_number }] });

    if (!user) {
      // Create new user
      user = await User.create({
        phone: phone_number,
        firebaseUid: uid,
        role,
        authProvider: 'phone',
        isPhoneVerified: true
      });
    } else {
      user.firebaseUid = uid;
      user.isPhoneVerified = true;
      user.authProvider = 'phone';
    }

    // Security stats
    user.lastLoginAt = Date.now();
    user.loginAttempts = 0;
    if (fingerprint && !user.deviceFingerprints.includes(fingerprint)) {
      user.deviceFingerprints.push(fingerprint);
    }
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Firebase phone verify error:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired phone verification token' });
  }
};
