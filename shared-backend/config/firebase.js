const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
    };

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    throw error;
  }
};

// Get Firebase Auth instance
const getAuth = () => {
  try {
    const app = initializeFirebase();
    return admin.auth(app);
  } catch (error) {
    console.error('❌ Failed to get Firebase Auth:', error.message);
    throw error;
  }
};

// Get Firebase Firestore instance
const getFirestore = () => {
  try {
    const app = initializeFirebase();
    return admin.firestore(app);
  } catch (error) {
    console.error('❌ Failed to get Firebase Firestore:', error.message);
    throw error;
  }
};

// Get Firebase Storage instance
const getStorage = () => {
  try {
    const app = initializeFirebase();
    return admin.storage(app);
  } catch (error) {
    console.error('❌ Failed to get Firebase Storage:', error.message);
    throw error;
  }
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('❌ Failed to verify Firebase ID token:', error.message);
    throw error;
  }
};

// Send SMS using Firebase (if configured)
const sendSMS = async (phoneNumber, message) => {
  try {
    if (process.env.FIREBASE_SMS_ENABLED !== 'true') {
      throw new Error('Firebase SMS is not enabled');
    }
    
    // This would typically use a third-party SMS service
    // For now, we'll just log the SMS
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
    return { success: true, messageId: Date.now().toString() };
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message);
    throw error;
  }
};

// Send push notification
const sendPushNotification = async (token, notification) => {
  try {
    const auth = getAuth();
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };

    const response = await auth.send(message);
    console.log('✅ Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send push notification:', error.message);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  getStorage,
  verifyIdToken,
  sendSMS,
  sendPushNotification,
  admin
};
