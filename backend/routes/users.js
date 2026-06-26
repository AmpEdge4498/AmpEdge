const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, updateLocation } = require('../controllers/userController');
const { applyReferral } = require('../controllers/referralController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Technician routes (must come BEFORE /:id to avoid being caught as a param)
router.put('/location', updateLocation);

// Customer routes
router.post('/referral', applyReferral);

// Admin routes
router.get('/stats', authorize('ADMIN'), getDashboardStats);
router.get('/', authorize('ADMIN'), getAllUsers);
router.route('/:id')
  .get(authorize('ADMIN'), getUserById)
  .put(authorize('ADMIN'), updateUser)
  .delete(authorize('ADMIN'), deleteUser);

module.exports = router;
