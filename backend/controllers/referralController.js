const User = require('../models/User');

// @desc    Apply Referral Code
// @route   POST /api/v1/users/referral
// @access  Private
exports.applyReferral = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (req.user.referredBy) {
      return res.status(400).json({ success: false, error: 'Referral code already applied prior' });
    }

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer || referrer._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Invalid or self-owned referral code' });
    }

    // Award ₹100 wallet balance to both users
    referrer.walletBalance += 100;
    await referrer.save();

    const user = await User.findByIdAndUpdate(req.user.id, {
      referredBy: referrer._id,
      $inc: { walletBalance: 100 }
    }, { new: true });

    res.status(200).json({ success: true, message: 'Referral applied! ₹100 credits mapped to wallet.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
