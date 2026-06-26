// Notification Service — Enhanced with Backend API + Expo Notifications Support
// Connects to backend notification API and falls back to local AsyncStorage

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

class NotificationService {
  constructor() {
    this.token = null;
    this.listeners = [];
    this.initialized = false;
  }

  // Initialize push notifications
  async initialize() {
    try {
      // In production with expo-notifications:
      // import * as Notifications from 'expo-notifications';
      // const { status } = await Notifications.requestPermissionsAsync();
      // const tokenData = await Notifications.getExpoPushTokenAsync();
      // this.token = tokenData.data;

      console.log('[Notifications] Service initialized');

      // Generate or retrieve a unique device token
      let savedToken = await AsyncStorage.getItem('pushToken');
      if (!savedToken) {
        savedToken = `device-${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await AsyncStorage.setItem('pushToken', savedToken);
      }
      this.token = savedToken;
      this.initialized = true;

      return this.token;
    } catch (error) {
      console.log('[Notifications] Init error:', error);
      return null;
    }
  }

  // Send push token to backend (call after login)
  async registerTokenWithBackend() {
    if (!this.token) return;
    try {
      await apiClient.put('/auth/fcm-token', { fcmToken: this.token });
      console.log('[Notifications] Token registered with backend');
    } catch (error) {
      console.log('[Notifications] Failed to register token:', error.message);
    }
  }

  // Register notification handlers
  onNotification(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Fetch notifications from backend API
  async fetchNotifications(page = 1, limit = 20) {
    try {
      const res = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return res.data;
    } catch (error) {
      console.log('[Notifications] Fetch error, falling back to local:', error.message);
      // Fallback to local notifications
      const history = await this.getLocalHistory();
      return { success: true, data: history, total: history.length, page: 1, pages: 1 };
    }
  }

  // Fetch unread count from backend
  async fetchUnreadCount() {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      return res.data.count || 0;
    } catch (error) {
      // Fallback to local
      return this.getLocalUnreadCount();
    }
  }

  // Mark notification as read on backend
  async markAsReadOnBackend(notificationId) {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.log('[Notifications] Mark read error:', error.message);
    }
  }

  // Mark all as read on backend
  async markAllAsReadOnBackend() {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      console.log('[Notifications] Mark all read error:', error.message);
    }
  }

  // Send local notification (for testing / offline)
  async sendLocalNotification(title, body, data = {}) {
    try {
      console.log(`[Notification] ${title}: ${body}`);

      // Save to local notification history
      const history = JSON.parse(await AsyncStorage.getItem('notificationHistory') || '[]');
      history.unshift({
        _id: `local-${Date.now()}`,
        title,
        body,
        data,
        type: data.type || 'SYSTEM',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history.slice(0, 50)));

      // Notify listeners
      this.listeners.forEach(cb => cb({ title, body, data }));
    } catch (error) {
      console.log('[Notifications] Send local error:', error);
    }
  }

  // Get local notification history
  async getLocalHistory() {
    try {
      return JSON.parse(await AsyncStorage.getItem('notificationHistory') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Mark local notification as read
  async markLocalAsRead(index) {
    try {
      const history = JSON.parse(await AsyncStorage.getItem('notificationHistory') || '[]');
      if (history[index]) {
        history[index].isRead = true;
        await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
      }
    } catch (e) { /* silent */ }
  }

  // Get local unread count
  async getLocalUnreadCount() {
    try {
      const history = JSON.parse(await AsyncStorage.getItem('notificationHistory') || '[]');
      return history.filter(n => !n.isRead).length;
    } catch (e) {
      return 0;
    }
  }

  // ── Common notification triggers ──

  async notifyBookingUpdate(bookingId, status) {
    const statusMessages = {
      'ACCEPTED': 'Your booking has been accepted by a technician!',
      'ON_THE_WAY': 'Your technician is on the way!',
      'IN_PROGRESS': 'Service is in progress.',
      'BOM_SUBMITTED': 'Bill of Materials submitted for your approval.',
      'COMPLETED': 'Service completed! Please rate your experience.',
      'CANCELLED': 'Your booking has been cancelled.',
    };

    await this.sendLocalNotification(
      'Booking Update 📋',
      statusMessages[status] || `Booking status: ${status}`,
      { type: 'BOOKING_UPDATE', bookingId }
    );
  }

  async notifyOrderUpdate(orderId, status) {
    await this.sendLocalNotification(
      'Order Update 📦',
      `Your order #${orderId} is now ${status}.`,
      { type: 'ORDER_UPDATE', orderId }
    );
  }

  async notifyPromotion(title, message) {
    await this.sendLocalNotification(title, message, { type: 'PROMOTION' });
  }
}

export default new NotificationService();
