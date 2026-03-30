const admin = require('../config/firebase');

/**
 * Fires a push notification to user devices directly via Firebase Cloud Messaging securely. 
 */
exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
  try {
    if (!admin.apps || admin.apps.length === 0) return; // Fallback mock during scaffolding

    const message = {
      notification: { title, body },
      data,
      token: fcmToken
    };
    
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('FCM Push Notification dispatch failed:', error.message);
  }
};
