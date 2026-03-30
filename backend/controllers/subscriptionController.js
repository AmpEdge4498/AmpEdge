const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Get all subscriptions
// @route   GET /api/v1/subscriptions
// @access  Public
exports.getSubscriptions = async (req, res) => {
  try {
    const plans = await Subscription.find({ isActive: true });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Subscribe user to plan (B2B)
// @route   POST /api/v1/subscriptions/subscribe
// @access  Private
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Subscription.findById(planId);
    
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    // Instantly activate 30 days access block for architecture template.
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const user = await User.findByIdAndUpdate(req.user.id, {
      subscriptionId: plan._id,
      subscriptionExpiry: expiry
    }, { new: true });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
