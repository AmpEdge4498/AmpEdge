import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const guestMode = await AsyncStorage.getItem('guestMode');
      if (guestMode === 'true') {
        setIsGuest(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setAuthToken(token);
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
        setIsGuest(false);
      }
    } catch (error) {
      console.log('Failed to load user', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (idToken, role) => {
    try {
      const res = await apiClient.post('/auth/verify-otp', { idToken, role });
      const { token, user: userData } = res.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.removeItem('guestMode');
      setAuthToken(token);
      setUser(userData);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const skipLogin = async () => {
    await AsyncStorage.setItem('guestMode', 'true');
    setIsGuest(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('guestMode');
    setAuthToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, skipLogin, loginWithOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

