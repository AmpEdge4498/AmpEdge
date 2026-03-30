const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledTime, serviceAddress } = req.body;
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const basePrice = service.basePrice;
    const taxes = basePrice * 0.18;
    const totalPrice = basePrice + taxes;

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      scheduledTime,
      serviceAddress,
      pricing: { basePrice, taxes, totalPrice, bomTotal: 0, finalPrice: totalPrice }
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get bookings (role-filtered)
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user.id;
    } else if (req.user.role === 'TECHNICIAN') {
      filter = {
        $or: [
          { technicianId: req.user.id },
          { status: 'PENDING', technicianId: null },
          { status: 'PENDING', technicianId: { $exists: false } }
        ]
      };
    }
    // Admin sees all — no filter

    // Admin filters
    if (req.user.role === 'ADMIN') {
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        // Will search by booking ID
      }
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name category basePrice')
      .populate('customerId', 'name phone')
      .populate('technicianId', 'name phone')
      .populate('bomId');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('customerId', 'name phone email')
      .populate('technicianId', 'name phone')
      .populate('bomId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id
// @access  Private (Technician/Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (req.user.role === 'TECHNICIAN' && status === 'ACCEPTED') {
      booking.technicianId = req.user.id;
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Assign technician to booking (Admin)
// @route   PUT /api/v1/bookings/:id/assign
// @access  Private/Admin
exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'TECHNICIAN') {
      return res.status(400).json({ success: false, error: 'Invalid technician' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { technicianId, status: 'ACCEPTED' },
      { new: true }
    ).populate('serviceId', 'name category')
     .populate('customerId', 'name phone')
     .populate('technicianId', 'name phone');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
