const express = require('express');
const { createBooking, getBookings, getBookingById, updateBookingStatus, assignTechnician } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBookingById)
  .put(updateBookingStatus);

router.put('/:id/assign', authorize('ADMIN'), assignTechnician);

module.exports = router;
