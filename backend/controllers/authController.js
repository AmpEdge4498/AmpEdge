const User = require('../models/User');
const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { createNotification } = require('./notificationController');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Generate unique referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AMP';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Normalize phone number to +91XXXXXXXXXX format
const normalizePhone = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) return '+91' + cleaned;
  return cleaned; // Return as-is if format is unknown
};

// Strip sensitive fields from user object
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.otpRetryCount;
  delete obj.lastOtpRequestAt;
  return obj;
};

// @desc    Register user with email/password
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!password || !name) {
    return res.status(400).json({ success: false, error: 'Name and password are required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ success: false, error: 'Either email or phone number is required' });
  }

  // Prevent public admin registration
  const safeRole = (role === 'ADMIN') ? 'CUSTOMER' : (role || 'CUSTOMER');

  // Check if user exists by email or phone
  if (email) {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }
  }
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this phone number' });
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email ? email.toLowerCase().trim() : undefined,
    phone: normalizedPhone || undefined,
    password: hashedPassword,
    role: safeRole,
    referralCode: generateReferralCode(),
    isPhoneVerified: false,
  });

  const token = generateToken(user._id);

  // Welcome notification
  await createNotification(user._id, 'Welcome to AmpEdge! ⚡', 'Your account has been created successfully.', 'SYSTEM');

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc    Register admin (requires admin key)
// @route   POST /api/v1/auth/register-admin
// @access  Public (but requires ADMIN_REGISTRATION_KEY)
exports.registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, adminKey } = req.body;

  // Verify admin registration key
  const validAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'AmpEdgeAdmin2026';
  if (!adminKey || adminKey !== validAdminKey) {
    return res.status(403).json({ success: false, error: 'Invalid admin registration key' });
  }

  if (!password || !name) {
    return res.status(400).json({ success: false, error: 'Name and password are required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ success: false, error: 'Either email or phone is required' });
  }

  // Check duplicates
  if (email) {
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });
  }
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const exists = await User.findOne({ phone: normalizedPhone });
    if (exists) return res.status(400).json({ success: false, error: 'Phone already registered' });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email ? email.toLowerCase().trim() : undefined,
    phone: normalizedPhone || undefined,
    password: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
    referralCode: generateReferralCode(),
    isPhoneVerified: !!normalizedPhone,
  });

  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc    Login with email/password
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (!user.password) {
    return res.status(401).json({ success: false, error: 'This account uses OTP login. Please use phone login instead.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.status(200).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc    Verify Firebase OTP & Login/Register user
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: 'Please provide a valid token' });
  }

  let phone;

  // Development mock mode
  if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock-token-')) {
    const rawPhone = idToken.replace('mock-token-', '');
    phone = normalizePhone(rawPhone);
  } else {
    // Production: verify with Firebase Admin
    if (!admin.apps || admin.apps.length === 0) {
      return res.status(500).json({ success: false, error: 'Firebase Admin not initialized. Check server configuration.' });
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      phone = decodedToken.phone_number;
    } catch (fbError) {
      console.error('Firebase OTP verification failed:', fbError.message);
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP token. Please request a new OTP.' });
    }
  }

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number not found in token' });
  }

  // Prevent public admin creation via OTP
  const safeRole = (role === 'ADMIN') ? 'CUSTOMER' : (role || 'CUSTOMER');

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await User.create({
      phone,
      role: safeRole,
      referralCode: generateReferralCode(),
      isPhoneVerified: true,
    });

    await createNotification(user._id, 'Welcome to AmpEdge! ⚡', 'Your account has been created successfully.', 'SYSTEM');
  } else {
    // Update phone verification status
    if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await user.save();
    }
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
    isNewUser,
  });
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Private
exports.refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const token = generateToken(user._id);

  res.status(200).json({ success: true, token });
});

// @desc    Update FCM Push Token
// @route   PUT /api/v1/auth/fcm-token
// @access  Private
exports.updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  await User.findByIdAndUpdate(req.user.id, { fcmToken });

  res.status(200).json({ success: true, message: 'FCM token updated' });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: sanitizeUser(user) });
});
