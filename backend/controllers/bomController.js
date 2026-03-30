const BOM = require('../models/BOM');
const Booking = require('../models/Booking');

// @desc    Create BOM for a booking
// @route   POST /api/v1/bom
// @access  Private (Technician)
exports.createBOM = async (req, res) => {
  try {
    const { bookingId, items, laborCharge, technicianNotes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.technicianId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not assigned to this booking' });
    }

    // Check if BOM already exists
    const existingBOM = await BOM.findOne({ bookingId });
    if (existingBOM) {
      return res.status(400).json({ success: false, error: 'BOM already exists for this booking. Use update instead.' });
    }

    const bom = await BOM.create({
      bookingId,
      technicianId: req.user.id,
      items: items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })),
      laborCharge: laborCharge || 0,
      technicianNotes
    });

    // Link BOM to booking
    booking.bomId = bom._id;
    booking.status = 'BOM_PENDING';
    await booking.save();

    res.status(201).json({ success: true, data: bom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get BOM by booking ID
// @route   GET /api/v1/bom/booking/:bookingId
// @access  Private
exports.getBOMByBooking = async (req, res) => {
  try {
    const bom = await BOM.findOne({ bookingId: req.params.bookingId })
      .populate('technicianId', 'name phone');
    
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found for this booking' });
    }

    res.status(200).json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all my BOMs (Technician)
// @route   GET /api/v1/bom/my
// @access  Private (Technician)
exports.getMyBOMs = async (req, res) => {
  try {
    const boms = await BOM.find({ technicianId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('bookingId');
    
    res.status(200).json({ success: true, count: boms.length, data: boms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update BOM (before submission)
// @route   PUT /api/v1/bom/:id
// @access  Private (Technician)
exports.updateBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (bom.status !== 'DRAFT' && bom.status !== 'REJECTED') {
      return res.status(400).json({ success: false, error: 'Can only edit DRAFT or REJECTED BOMs' });
    }

    const { items, laborCharge, technicianNotes } = req.body;
    if (items) {
      bom.items = items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }));
    }
    if (laborCharge !== undefined) bom.laborCharge = laborCharge;
    if (technicianNotes) bom.technicianNotes = technicianNotes;
    bom.status = 'DRAFT';

    await bom.save();
    res.status(200).json({ success: true, data: bom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Submit BOM to customer
// @route   PUT /api/v1/bom/:id/submit
// @access  Private (Technician)
exports.submitBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (bom.items.length === 0) {
      return res.status(400).json({ success: false, error: 'BOM must have at least one item' });
    }

    bom.status = 'SUBMITTED';
    bom.submittedAt = new Date();
    await bom.save();

    // Update booking status
    await Booking.findByIdAndUpdate(bom.bookingId, { status: 'BOM_SUBMITTED' });

    res.status(200).json({ success: true, data: bom, message: 'BOM submitted to customer' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Customer approves BOM
// @route   PUT /api/v1/bom/:id/approve
// @access  Private (Customer)
exports.approveBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'APPROVED';
    bom.approvedAt = new Date();
    if (req.body.customerNotes) bom.customerNotes = req.body.customerNotes;
    await bom.save();

    // Update booking with BOM pricing
    const taxes = bom.grandTotal * 0.18;
    await Booking.findByIdAndUpdate(bom.bookingId, {
      status: 'BOM_APPROVED',
      'pricing.bomTotal': bom.grandTotal,
      'pricing.finalPrice': bom.grandTotal + taxes,
      'pricing.taxes': taxes
    });

    res.status(200).json({ success: true, data: bom, message: 'BOM approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Customer rejects BOM
// @route   PUT /api/v1/bom/:id/reject
// @access  Private (Customer)
exports.rejectBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'REJECTED';
    bom.rejectedAt = new Date();
    if (req.body.customerNotes) bom.customerNotes = req.body.customerNotes;
    await bom.save();

    await Booking.findByIdAndUpdate(bom.bookingId, { status: 'BOM_PENDING' });

    res.status(200).json({ success: true, data: bom, message: 'BOM rejected. Technician will revise.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
