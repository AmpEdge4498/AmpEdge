const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { createNotification } = require('./notificationController');
const { sendPushNotification } = require('../utils/firebaseMessaging');
const { reverseGeocode } = require('../utils/geocoding');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Customer)
exports.createBooking = asyncHandler(async (req, res) => {
  const { serviceId, scheduledTime, serviceAddress, notes } = req.body;

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }

  // Validate address
  if (!serviceAddress || !serviceAddress.addressText || !serviceAddress.lat || !serviceAddress.lng) {
    return res.status(400).json({
      success: false,
      error: 'Complete service address with addressText, lat, and lng is required',
    });
  }

  // Auto-fill address fields via reverse geocoding if not provided
  let finalAddress = { ...serviceAddress };
  if (!finalAddress.city || !finalAddress.street) {
    try {
      const geocoded = await reverseGeocode(finalAddress.lat, finalAddress.lng);
      finalAddress = {
        ...finalAddress,
        street: finalAddress.street || geocoded.street || '',
        area: finalAddress.area || geocoded.area || '',
        city: finalAddress.city || geocoded.city || '',
        state: finalAddress.state || geocoded.state || '',
        pincode: finalAddress.pincode || geocoded.pincode || '',
        addressText: finalAddress.addressText || geocoded.formattedAddress || '',
      };
    } catch (err) {
      console.error('Geocoding failed during booking creation:', err.message);
    }
  }

  // Calculate pricing
  const basePrice = service.basePrice;
  const taxes = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + taxes;

  const booking = await Booking.create({
    customerId: req.user.id,
    serviceId,
    scheduledTime,
    serviceAddress: finalAddress,
    notes: notes || '',
    pricing: { basePrice, taxes, totalPrice, bomTotal: 0, finalPrice: totalPrice },
  });

  // Notify customer
  await createNotification(
    req.user.id,
    'Booking Confirmed! 📋',
    `Your ${service.name} service booking has been placed. We'll assign a technician soon.`,
    'BOOKING_UPDATE',
    { bookingId: booking._id }
  );

  // Notify admins
  const admins = await User.find({ role: 'ADMIN' }).select('_id fcmToken');
  for (const admin of admins) {
    await createNotification(
      admin._id,
      'New Booking Received 🔔',
      `New ${service.name} booking from ${req.user.name || req.user.phone || 'a customer'}.`,
      'BOOKING_UPDATE',
      { bookingId: booking._id }
    );
    if (admin.fcmToken) {
      await sendPushNotification(admin.fcmToken, 'New Booking', `${service.name} booking received`);
    }
  }

  // Populate and return
  const populatedBooking = await Booking.findById(booking._id)
    .populate('serviceId', 'name category basePrice')
    .populate('customerId', 'name phone');

  res.status(201).json({ success: true, data: populatedBooking });
});

// @desc    Get bookings (role-filtered, paginated)
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let filter = {};

  if (req.user.role === 'CUSTOMER') {
    filter.customerId = req.user.id;
  } else if (req.user.role === 'TECHNICIAN') {
    filter = {
      $or: [
        { technicianId: req.user.id },
        { status: 'PENDING', technicianId: null },
        { status: 'PENDING', technicianId: { $exists: false } },
      ],
    };
  }
  // Admin sees all — no filter

  // Admin filters
  if (req.user.role === 'ADMIN') {
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter['serviceAddress.city'] = { $regex: req.query.city, $options: 'i' };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('serviceId', 'name category basePrice')
      .populate('customerId', 'name phone email')
      .populate('technicianId', 'name phone')
      .populate('bomId')
      .lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('serviceId')
    .populate('customerId', 'name phone email addresses')
    .populate('technicianId', 'name phone')
    .populate('bomId');

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // Authorization check: customer can only see own bookings
  if (req.user.role === 'CUSTOMER' && booking.customerId._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Not authorized to view this booking' });
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id
// @access  Private (Technician/Admin)
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // If technician is accepting
  if (req.user.role === 'TECHNICIAN' && status === 'ACCEPTED') {
    booking.technicianId = req.user.id;
  }

  const oldStatus = booking.status;
  booking.status = status;
  await booking.save();

  // Send notification to customer on status change
  if (oldStatus !== status) {
    const statusMessages = {
      'ACCEPTED': 'Your booking has been accepted by a technician! ✅',
      'ON_THE_WAY': 'Your technician is on the way! 🚗',
      'IN_PROGRESS': 'Service is in progress. ⚡',
      'BOM_SUBMITTED': 'Bill of Materials submitted for your approval. 📋',
      'BOM_APPROVED': 'BOM has been approved! Work will proceed. ✅',
      'COMPLETED': 'Service completed! Please rate your experience. ⭐',
      'CANCELLED': 'Your booking has been cancelled. ❌',
    };

    const notifBody = statusMessages[status] || `Booking status updated to ${status}`;
    await createNotification(
      booking.customerId,
      'Booking Update 🔔',
      notifBody,
      'BOOKING_UPDATE',
      { bookingId: booking._id, status }
    );

    // Push notification
    const customer = await User.findById(booking.customerId);
    if (customer?.fcmToken) {
      await sendPushNotification(customer.fcmToken, 'Booking Update', notifBody);
    }
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Assign technician to booking (Admin)
// @route   PUT /api/v1/bookings/:id/assign
// @access  Private/Admin
exports.assignTechnician = asyncHandler(async (req, res) => {
  const { technicianId } = req.body;

  const technician = await User.findById(technicianId);
  if (!technician || technician.role !== 'TECHNICIAN') {
    return res.status(400).json({ success: false, error: 'Invalid technician' });
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { technicianId, status: 'ACCEPTED' },
    { new: true }
  )
    .populate('serviceId', 'name category')
    .populate('customerId', 'name phone')
    .populate('technicianId', 'name phone');

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // Notify technician
  await createNotification(
    technicianId,
    'New Job Assigned! 🔧',
    `You have been assigned a ${booking.serviceId?.name || 'service'} job.`,
    'TECHNICIAN_ASSIGNED',
    { bookingId: booking._id }
  );

  if (technician.fcmToken) {
    await sendPushNotification(technician.fcmToken, 'New Job', 'You have been assigned a new job');
  }

  // Notify customer
  await createNotification(
    booking.customerId._id,
    'Technician Assigned! ✅',
    `${technician.name || 'A technician'} has been assigned to your booking.`,
    'TECHNICIAN_ASSIGNED',
    { bookingId: booking._id }
  );

  res.status(200).json({ success: true, data: booking });
});
