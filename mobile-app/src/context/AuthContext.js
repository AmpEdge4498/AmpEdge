import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import apiClient, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setFirebaseUser(fbUser);
        loadUser();
      });
    } catch (e) {
      console.warn('[AuthContext] Firebase auth listener failed:', e.message);
      loadUser();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.data);
          setIsGuest(false);
        } catch (apiError) {
          console.log('[AuthContext] API /auth/me failed (backend may be offline):', apiError.message);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('[AuthContext] Failed to load user:', error.message);
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
      const fbCred = await signInWithEmailAndPassword(auth, email, password);
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
      const fbCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(fbCred.user, { displayName: name });
      const idToken = await fbCred.user.getIdToken();

      const res = await apiClient.post('/auth/firebase-login', { idToken, role });
      const { token, user: userData } = res.data;

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
      await signOut(auth);
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
