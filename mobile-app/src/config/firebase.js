import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyA_8Oupkphp6z4a-kkLWe4SD-fKxz17kg4',
  projectId: 'ampedge-solutions',
  storageBucket: 'ampedge-solutions.firebasestorage.app',
  appId: '1:357686846600:android:e1d9f15968e3c0825feb3d',
  messagingSenderId: '357686846600',
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized, just get the existing instance
  auth = getAuth(app);
}

export { auth };
export default app;
