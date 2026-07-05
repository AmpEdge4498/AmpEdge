const crypto = require('crypto');

// Simulated QR sessions for website-to-app connection
const qrSessions = new Map();

// @desc    Generate deep link URL
// @route   POST /api/v1/deeplink/generate
// @access  Public
exports.generateDeepLink = async (req, res, next) => {
  try {
    const { path, params } = req.body;
    
    if (!path) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }

    // Encrypt or encode parameters if necessary
    const queryString = new URLSearchParams(params || {}).toString();
    const deepLinkUrl = `ampedge://${path}${queryString ? '?' + queryString : ''}`;
    const webFallbackUrl = `https://rittickd23-alt.github.io/AmpEdge-web/${path}${queryString ? '?' + queryString : ''}`;

    res.status(200).json({
      success: true,
      deepLink: deepLinkUrl,
      fallbackUrl: webFallbackUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve deep link
// @route   POST /api/v1/deeplink/resolve
// @access  Public
exports.resolveDeepLink = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Logic to parse the deep link and return the target screen and params
    let screen = 'Home';
    let params = {};

    if (url.includes('/booking')) {
      screen = 'BookingDetails';
      // Extract serviceId
      const parts = url.split('/');
      params.serviceId = parts[parts.length - 1];
    } else if (url.includes('/product')) {
      screen = 'ProductDetail';
    } else if (url.includes('/marketplace')) {
      screen = 'MarketplaceTab';
    }

    res.status(200).json({
      success: true,
      navigation: {
        screen,
        params
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code session for website login
// @route   GET /api/v1/deeplink/qr/session
// @access  Public
exports.getQrSession = async (req, res, next) => {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // Store session with expiry (5 mins)
    qrSessions.set(sessionId, {
      status: 'pending',
      createdAt: Date.now()
    });
    
    setTimeout(() => {
      qrSessions.delete(sessionId);
    }, 5 * 60 * 1000);

    res.status(200).json({
      success: true,
      sessionId,
      qrData: `ampedge://login?session=${sessionId}`
    });
  } catch (error) {
    next(error);
  }
};
