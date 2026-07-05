import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import apiClient, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; 
  }, []);

  const onAuthStateChanged = async (fbUser) => {
    setFirebaseUser(fbUser);
    loadUser();
  };

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
      } else {
        setUser(null);
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
      const res = await apiClient.post('/auth/firebase-phone-verify', { idToken, role });
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

  const loginWithEmail = async (email, password, role = 'CUSTOMER') => {
    try {
      const fbCred = await auth().signInWithEmailAndPassword(email, password);
      const idToken = await fbCred.user.getIdToken();
      
      const res = await apiClient.post('/auth/firebase-login', { idToken, role });
      const { token, user: userData } = res.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.removeItem('guestMode');
      setAuthToken(token);
      setUser(userData);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      const msg = error.code ? error.message : (error.response?.data?.error || 'Login failed');
      return { success: false, error: msg };
    }
  };

  const signupWithEmail = async (name, email, phone, password, role = 'CUSTOMER') => {
    try {
      const fbCred = await auth().createUserWithEmailAndPassword(email, password);
      await fbCred.user.updateProfile({ displayName: name });
      const idToken = await fbCred.user.getIdToken();

      const res = await apiClient.post('/auth/firebase-login', { idToken, role });
      const { token, user: userData } = res.data;

      // Update backend with extra info
      setAuthToken(token);
      await apiClient.put('/users/profile', { name, phone });
      userData.name = name;
      userData.phone = phone;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.removeItem('guestMode');
      setUser(userData);
      setIsGuest(false);
      return { success: true };
    } catch (error) {
      const msg = error.code ? error.message : (error.response?.data?.error || 'Registration failed');
      return { success: false, error: msg };
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
    try {
      await auth().signOut();
    } catch (e) {
      // Ignore firebase signout error
    }
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, firebaseUser, loading, isGuest, skipLogin, 
      loginWithOtp, loginWithEmail, signupWithEmail, logout, updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
