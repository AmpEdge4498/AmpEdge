/**
 * AmpEdge — Input Validation Middleware
 * Reusable validation chains using express-validator
 */
const { body, param, query, validationResult } = require('express-validator');

// Run validation and return errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ success: false, error: messages.join('. ') });
  }
  next();
};

// ── Common Validators ──

const validatePhone = () =>
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number');

const validatePhoneRequired = () =>
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number');

const validateEmail = () =>
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();

const validateEmailRequired = () =>
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();

const validatePassword = () =>
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters');

const validateObjectId = (field) =>
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`);

const validateRole = () =>
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'TECHNICIAN', 'ADMIN'])
    .withMessage('Role must be CUSTOMER, TECHNICIAN, or ADMIN');

const validatePagination = () => [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ── Address Validators ──

const validateAddress = () => [
  body('serviceAddress').notEmpty().withMessage('Service address is required'),
  body('serviceAddress.addressText').notEmpty().withMessage('Address text is required'),
  body('serviceAddress.city').notEmpty().withMessage('City is required'),
  body('serviceAddress.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('serviceAddress.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('serviceAddress.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
];

// ── Booking Validators ──

const validateBookingCreate = () => [
  body('serviceId').notEmpty().withMessage('Service ID is required').isMongoId().withMessage('Invalid service ID'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required').isISO8601().withMessage('Invalid date format'),
  ...validateAddress(),
];

// ── Auth Validators ──

const validateRegister = () => [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  validatePassword(),
  validateEmail(),
  validatePhone(),
  validateRole(),
];

const validateLogin = () => [
  validateEmailRequired(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateOtp = () => [
  body('idToken').notEmpty().withMessage('OTP token is required'),
  validateRole(),
];

module.exports = {
  handleValidation,
  validatePhone,
  validatePhoneRequired,
  validateEmail,
  validateEmailRequired,
  validatePassword,
  validateObjectId,
  validateRole,
  validatePagination,
  validateAddress,
  validateBookingCreate,
  validateRegister,
  validateLogin,
  validateOtp,
};
