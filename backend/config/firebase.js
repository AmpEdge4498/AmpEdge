const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Ensure the path is absolute or resolved properly from project root
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

try {
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
  } else {
    console.warn(`[WARN] Firebase Admin NOT initialized. Provide valid FIREBASE_SERVICE_ACCOUNT_PATH in .env (Looking for: ${serviceAccountPath})`);
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const initFirebase = () => {
  return admin; // Assuming initialization runs on module load
};

module.exports = { admin, initFirebase };
