const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { reverseGeocode } = require('../utils/geocoding');

const router = express.Router();

// @desc    Reverse geocode coordinates to street address
// @route   GET /api/v1/geocode/reverse?lat=X&lng=Y
// @access  Public
router.get('/reverse', asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'lat and lng query parameters are required' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ success: false, error: 'lat and lng must be valid numbers' });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, error: 'Invalid coordinate range' });
  }

  const address = await reverseGeocode(latitude, longitude);

  res.status(200).json({ success: true, data: address });
}));

module.exports = router;
