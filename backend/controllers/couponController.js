const Coupon = require('../models/Coupon');
const Service = require('../models/Service');

// @desc    Get all coupons (Admin)
// @route   GET /api/v1/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/v1/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon, message: 'Coupon deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Validate and calculate coupon discount
// @route   POST /api/v1/coupons/validate
// @access  Private (Customer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, serviceId } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (now > coupon.validUntil || now < coupon.validFrom) {
      return res.status(400).json({ success: false, error: 'Coupon is not currently valid' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit has been reached' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, error: 'Target service not found' });

    if (service.basePrice < coupon.minOrderValue) {
      return res.status(400).json({ success: false, error: `Minimum order value of ₹${coupon.minOrderValue} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'FLAT') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (service.basePrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    const newBasePrice = Math.max(0, service.basePrice - discountAmount);
    const taxes = newBasePrice * 0.18;
    const finalPrice = newBasePrice + taxes;

    res.status(200).json({
      success: true,
      data: {
        couponId: coupon._id,
        originalBase: service.basePrice,
        discountApplied: discountAmount,
        newBasePrice,
        taxes,
        finalPrice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
