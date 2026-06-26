const admin = require('../config/firebase');
const logger = require('./logger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Send push notification with retry logic
 * @param {string} fcmToken - Device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {string|null} Message ID or null
 */
exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return null;

  // Skip if Firebase isn't initialized
  if (!admin.apps || admin.apps.length === 0) {
    logger.debug('Firebase not initialized — skipping push notification', { title });
    return null;
  }

  const message = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    token: fcmToken,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await admin.messaging().send(message);
      logger.debug('Push notification sent', { messageId: response, title });
      return response;
    } catch (error) {
      // If token is invalid/expired, don't retry
      if (
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token'
      ) {
        logger.warn('Invalid FCM token — notification not sent', { token: fcmToken.slice(0, 10) + '...' });
        return null;
      }

      logger.warn(`Push notification attempt ${attempt}/${MAX_RETRIES} failed`, { error: error.message });

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
      }
    }
  }

  logger.error('Push notification failed after all retries', { title, token: fcmToken.slice(0, 10) + '...' });
  return null;
};

/**
 * Send push notifications to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {string} title
 * @param {string} body
 * @param {Object} data
 */
exports.sendBulkPushNotifications = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;
  if (!admin.apps || admin.apps.length === 0) return;

  const validTokens = tokens.filter(Boolean);
  if (validTokens.length === 0) return;

  const results = await Promise.allSettled(
    validTokens.map((token) => exports.sendPushNotification(token, title, body, data))
  );

  const failures = results.filter((r) => r.status === 'rejected').length;
  if (failures > 0) {
    logger.warn(`${failures}/${validTokens.length} bulk push notifications failed`);
  }
};
