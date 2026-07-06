import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

// Safely import Firebase auth - if it fails, we gracefully degrade
let firebaseAuth = null;
try {
  const authModule = require('@react-native-firebase/auth');
  firebaseAuth = authModule.default;
} catch (e) {
  console.warn('[AuthContext] Firebase Auth module failed to load:', e.message);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    let subscriber = null;
    try {
      if (firebaseAuth) {
        subscriber = firebaseAuth().onAuthStateChanged(onAuthStateChanged);
      } else {
        // Firebase not available, just load from local storage
        console.log('[AuthContext] Firebase not available, loading user from storage');
        loadUser();
      }
    } catch (e) {
      console.warn('[AuthContext] Firebase onAuthStateChanged failed:', e.message);
      loadUser();
    }
    return () => {
      if (subscriber) subscriber();
    };
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
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.data);
          setIsGuest(false);
        } catch (apiError) {
          console.log('[AuthContext] API /auth/me failed (backend may be offline):', apiError.message);
          // Don't logout on API failure - backend might just be offline
          // Show login screen instead
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('[AuthContext] Failed to load user from storage:', error.message);
      setUser(null);
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
      if (!firebaseAuth) {
        return { success: false, error: 'Firebase is not available. Please try again later.' };
      }
      const fbCred = await firebaseAuth().signInWithEmailAndPassword(email, password);
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
      if (!firebaseAuth) {
        return { success: false, error: 'Firebase is not available. Please try again later.' };
      }
      const fbCred = await firebaseAuth().createUserWithEmailAndPassword(email, password);
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
      if (firebaseAuth) {
        await firebaseAuth().signOut();
      }
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

