const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get notifications for current user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { userId: req.user.id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false,
  });
  res.status(200).json({ success: true, count });
});

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// ── Helper: Create notification for a user ──
exports.createNotification = async (userId, title, body, type = 'SYSTEM', data = {}) => {
  try {
    await Notification.create({ userId, title, body, type, data });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// ── Helper: Notify multiple users ──
exports.createBulkNotifications = async (userIds, title, body, type = 'SYSTEM', data = {}) => {
  try {
    const docs = userIds.map((userId) => ({ userId, title, body, type, data }));
    await Notification.insertMany(docs);
  } catch (error) {
    console.error('Failed to create bulk notifications:', error.message);
  }
};
