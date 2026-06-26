const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all active services (public, paginated)
// @route   GET /api/v1/services
// @access  Public
exports.getServices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.city) filter.city = { $regex: escapeRegex(req.query.city), $options: 'i' };
  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    filter.name = { $regex: safe, $options: 'i' };
  }

  const [services, total] = await Promise.all([
    Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Service.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: services.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: services,
  });
});

// @desc    Get ALL services including inactive (Admin)
// @route   GET /api/v1/services/admin/all
// @access  Private/Admin
exports.getAllServicesAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    filter.name = { $regex: safe, $options: 'i' };
  }

  const services = await Service.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Public
exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.status(200).json({ success: true, data: service });
});

// @desc    Create new service
// @route   POST /api/v1/services
// @access  Private/Admin
exports.createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service });
});

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private/Admin
exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.status(200).json({ success: true, data: service });
});

// @desc    Delete service (soft delete)
// @route   DELETE /api/v1/services/:id
// @access  Private/Admin
exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.status(200).json({ success: true, data: service, message: 'Service deactivated' });
});
