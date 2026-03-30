const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Get all users (Admin)
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'INACTIVE' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/v1/users/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalTechnicians = await User.countDocuments({ role: 'TECHNICIAN' });
    const activeTechnicians = await User.countDocuments({ role: 'TECHNICIAN', status: 'ACTIVE' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'PENDING' });
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
    const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });
    
    // Revenue calculation
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } }
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
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const totalServices = await Service.countDocuments({ isActive: true });

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('serviceId', 'name category')
      .populate('customerId', 'name phone');

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, customers: totalCustomers, technicians: totalTechnicians, activeTechnicians },
        bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings, cancelled: cancelledBookings },
        revenue: { total: totalRevenue, monthly: monthlyRevenue },
        services: { total: totalServices },
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update Technician Location
// @route   PUT /api/v1/users/location
// @access  Private (Technician)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (req.user.role !== 'TECHNICIAN') {
      return res.status(403).json({ success: false, error: 'Only technicians can update tracking location' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user.location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
