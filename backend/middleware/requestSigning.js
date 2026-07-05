const crypto = require('crypto');

// In-memory store for nonces (use Redis in prod)
const usedNonces = new Set();
const SIGNING_SECRET = process.env.REQUEST_SIGNING_SECRET || 'AmpEdgeReqSecret2026';

// Clean up nonces every 10 minutes to prevent memory leak
setInterval(() => {
  usedNonces.clear();
}, 10 * 60 * 1000);

exports.verifyRequestSignature = (req, res, next) => {
  const signature = req.headers['x-request-signature'];
  const timestamp = req.headers['x-request-timestamp'];
  const nonce = req.headers['x-request-nonce'];

  if (!signature || !timestamp || !nonce) {
    return res.status(403).json({ success: false, error: 'Missing security headers' });
  }

  // Prevent Replay Attacks: Check timestamp (must be within 5 mins)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  if (Math.abs(currentTime - requestTime) > 5 * 60 * 1000) {
    return res.status(403).json({ success: false, error: 'Request expired' });
  }

  // Prevent Replay Attacks: Check Nonce
  if (usedNonces.has(nonce)) {
    return res.status(403).json({ success: false, error: 'Duplicate request detected' });
  }
  usedNonces.add(nonce);

  // Validate Signature
  // payload = URI + method + body + timestamp + nonce
  const payload = `${req.originalUrl}:${req.method}:${JSON.stringify(req.body || {})}:${timestamp}:${nonce}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(403).json({ success: false, error: 'Invalid request signature' });
  }

  next();
};
