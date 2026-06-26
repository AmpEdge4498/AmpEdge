const ChatMessage = require('../models/Chat');

// @desc    Get chat messages between two users (optionally for a booking)
// @route   GET /api/v1/chat/:otherUserId?bookingId=xxx
exports.getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.otherUserId;
    const { bookingId } = req.query;

    const filter = {
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    };
    if (bookingId) filter.bookingId = bookingId;

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark received messages as read
    await ChatMessage.updateMany(
      { senderId: otherId, receiverId: myId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send a chat message
// @route   POST /api/v1/chat
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, bookingId } = req.body;

    const message = await ChatMessage.create({
      senderId: req.user.id,
      receiverId,
      text,
      bookingId
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/v1/chat/unread
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await ChatMessage.countDocuments({
      receiverId: req.user.id,
      isRead: false
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
