const express = require('express');
const { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', protect, validateCoupon);

// Admin CRUD
router.route('/')
  .get(protect, authorize('ADMIN'), getAllCoupons)
  .post(protect, authorize('ADMIN'), createCoupon);

router.route('/:id')
  .put(protect, authorize('ADMIN'), updateCoupon)
  .delete(protect, authorize('ADMIN'), deleteCoupon);

module.exports = router;
