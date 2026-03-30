const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Setup Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Amount in paise
    const amount = Math.round(booking.pricing.totalPrice * 100);

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
    };

    // If using mock keys, we skip actual API call and simulate order creation
    if (process.env.RAZORPAY_KEY_ID === 'your_razorpay_test_key_id' || !process.env.RAZORPAY_KEY_ID) {
      const mockOrder = { id: `order_mock_${Date.now()}`, amount, currency: 'INR' };
      
      await Payment.create({
        bookingId,
        customerId: req.user.id,
        razorpayOrderId: mockOrder.id,
        amount: booking.pricing.totalPrice,
      });

      return res.status(200).json({ success: true, data: mockOrder, mock: true });
    }

    const order = await razorpay.orders.create(options);
    
    // Create payment intent record
    await Payment.create({
      bookingId,
      customerId: req.user.id,
      razorpayOrderId: order.id,
      amount: booking.pricing.totalPrice,
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify Payment Signature
// @route   POST /api/v1/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // For mock mode bypass
    if (process.env.RAZORPAY_KEY_ID === 'your_razorpay_test_key_id' || !process.env.RAZORPAY_KEY_ID) {
       await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'SUCCESS', razorpayPaymentId: razorpay_payment_id || 'mock_payment_id' }
      );
      return res.status(200).json({ success: true, message: 'Payment verified successfully (Mock)' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'SUCCESS', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
      );
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'FAILED' });
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
