const express = require('express');
const router = express.Router();
const { generateDeepLink, resolveDeepLink, getQrSession } = require('../controllers/deeplink');

// Public routes
router.post('/generate', generateDeepLink);
router.post('/resolve', resolveDeepLink);
router.get('/qr/session', getQrSession);

module.exports = router;
