const express = require('express');
const router = express.Router();
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
