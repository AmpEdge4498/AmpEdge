const AuditLog = require('../models/AuditLog');

exports.logAuthEvent = (action) => {
  return async (req, res, next) => {
    // Intercept response finish
    res.on('finish', async () => {
      if (!req.user && !req.firebaseUser) return;
      
      const userId = req.user ? req.user._id : (req.firebaseUser ? req.firebaseUser.uid : null);
      // Fallback for failed logins where user might be attached to req in other ways
      
      if (!userId) return;

      try {
        await AuditLog.create({
          user: userId,
          action: action,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          deviceFingerprint: req.headers['x-device-id'],
          status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
          metadata: {
            endpoint: req.originalUrl,
            method: req.method
          }
        });
      } catch (err) {
        console.error('Audit log failed:', err);
      }
    });
    
    next();
  };
};
