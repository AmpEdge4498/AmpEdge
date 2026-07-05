const User = require('../models/User');

exports.verifyDeviceFingerprint = async (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  
  if (!deviceId) {
    return res.status(403).json({ success: false, error: 'Device fingerprint missing' });
  }

  // Assuming protect middleware has set req.user
  if (req.user && req.user.deviceFingerprints && req.user.deviceFingerprints.length > 0) {
    if (!req.user.deviceFingerprints.includes(deviceId)) {
      return res.status(403).json({ success: false, error: 'Unrecognized device. Please verify your identity.' });
    }
  }

  next();
};

exports.checkAccountLockout = async (req, res, next) => {
  let query = null;
  
  if (req.body.email) query = { email: req.body.email };
  if (req.body.phone) query = { phone: req.body.phone };
  
  if (query) {
    const user = await User.findOne(query);
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        success: false, 
        error: `Account temporarily locked. Try again in ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes.` 
      });
    }
  }
  
  next();
};
