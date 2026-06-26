const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/unread', protect, getUnreadCount);
router.get('/:otherUserId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
