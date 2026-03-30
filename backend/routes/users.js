const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, updateLocation } = require('../controllers/userController');
const { applyReferral } = require('../controllers/referralController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Admin routes
router.get('/stats', authorize('ADMIN'), getDashboardStats);
router.get('/', authorize('ADMIN'), getAllUsers);
router.route('/:id')
  .get(authorize('ADMIN'), getUserById)
  .put(authorize('ADMIN'), updateUser)
  .delete(authorize('ADMIN'), deleteUser);

// Technician routes
router.put('/location', updateLocation);

// Customer routes
router.post('/referral', applyReferral);

module.exports = router;
