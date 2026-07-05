const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { admin } = require('../config/firebase');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authorized — no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User account no longer exists' });
    }

    // Check if user is deactivated
    if (req.user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact support.' });
    }

    // Token Rotation (Sliding expiry if less than 7 days left)
    const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeToExpiry < 7 * 24 * 60 * 60) { // 7 days in seconds
      const newToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      res.setHeader('X-New-Token', newToken); // App can intercept this and update storage
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Verify Firebase Token (For critical endpoints)
exports.verifyFirebaseToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized — no Firebase token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired Firebase token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
