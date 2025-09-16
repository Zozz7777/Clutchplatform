// Firebase Configuration for Clutch Platform
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "clutch-a2f49.firebaseapp.com",
  projectId: "clutch-a2f49",
  storageBucket: "clutch-a2f49.appspot.com",
  messagingSenderId: "915489835939",
  appId: "1:915489835939:web:8dc565ab77199d909ca816",
  measurementId: "G-E1CZCHBYNQ"
};

// Firebase Admin SDK Configuration
const adminConfig = {
  projectId: "clutch-a2f49",
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
};

// Export configurations
module.exports = {
  firebaseConfig,
  adminConfig
};
