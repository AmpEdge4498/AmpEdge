const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorHandler');

// Escape regex special chars to prevent injection
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all users (Admin) — paginated
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user (whitelisted fields only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  // Whitelist allowed update fields — prevents mass assignment
  const allowedFields = ['name', 'email', 'phone', 'role', 'status', 'isAvailable', 'addresses'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'INACTIVE' },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: user, message: 'User deactivated' });
});

// @desc    Get dashboard stats
// @route   GET /api/v1/users/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCustomers,
    totalTechnicians,
    activeTechnicians,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    revenueResult,
    totalServices,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'CUSTOMER' }),
    User.countDocuments({ role: 'TECHNICIAN' }),
    User.countDocuments({ role: 'TECHNICIAN', status: 'ACTIVE' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'PENDING' }),
    Booking.countDocuments({ status: 'COMPLETED' }),
    Booking.countDocuments({ status: 'CANCELLED' }),
    Booking.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
    ]),
    Service.countDocuments({ isActive: true }),
    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('serviceId', 'name category')
      .populate('customerId', 'name phone')
      .lean(),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$pricing.totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, customers: totalCustomers, technicians: totalTechnicians, activeTechnicians },
      bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings, cancelled: cancelledBookings },
      revenue: { total: totalRevenue, monthly: monthlyRevenue },
      services: { total: totalServices },
      recentBookings,
    },
  });
});

// @desc    Update Technician Location
// @route   PUT /api/v1/users/location
// @access  Private (Technician)
exports.updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (req.user.role !== 'TECHNICIAN') {
    return res.status(403).json({ success: false, error: 'Only technicians can update tracking location' });
  }

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, error: 'Valid lat and lng are required' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: user.location });
});
