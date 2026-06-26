const Review = require('../models/Review');

// @desc    Get reviews for a product or service
// @route   GET /api/v1/reviews?targetType=PRODUCT&targetId=xxx
exports.getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, error: 'targetType and targetId are required' });
    }

    const reviews = await Review.find({ targetType, targetId }).sort({ createdAt: -1 }).limit(50);

    // Calculate average
    const stats = await Review.aggregate([
      { $match: { targetType, targetId: new (require('mongoose').Types.ObjectId)(targetId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: stats[0] || { avgRating: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/v1/reviews
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, title, comment } = req.body;

    const review = await Review.create({
      userId: req.user.id,
      targetType,
      targetId,
      rating,
      title,
      comment,
      userName: req.user.name || 'Customer'
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this item' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Only the review author or admin can delete
    if (review.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
