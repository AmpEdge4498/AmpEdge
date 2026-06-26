const express = require('express');
const router = express.Router();
const {
  verifyOtp, getMe, register, login,
  registerAdmin, refreshToken, updateFcmToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister, validateLogin, validateOtp, handleValidation,
} = require('../middleware/validate');

// Public routes
router.post('/verify-otp', validateOtp(), handleValidation, verifyOtp);
router.post('/register', validateRegister(), handleValidation, register);
router.post('/register-admin', registerAdmin);
router.post('/login', validateLogin(), handleValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/refresh-token', protect, refreshToken);
router.put('/fcm-token', protect, updateFcmToken);

module.exports = router;
