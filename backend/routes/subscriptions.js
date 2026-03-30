const express = require('express');
const { getSubscriptions, subscribeToPlan } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSubscriptions);
router.post('/subscribe', protect, subscribeToPlan);

module.exports = router;
