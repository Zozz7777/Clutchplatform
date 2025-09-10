const admin = require('firebase-admin');
require('dotenv').config();

let auth = null;
let storage = null;
let firestore = null;

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    if (admin.apps.length === 0) {
      // Use the provided service account credentials
      const serviceAccount = {
        type: "service_account",
        project_id: "clutch-a2f49",
        private_key_id: "dc2f1d5226799f84cbc6e82828f5c316a497e70b",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCY8swypOgLi5+U\n50MoMnsnkx8B+JzsEgp6zrcGi/0y838JzE+9YmiJdX5YTaUAbI9KFP+50H/xuswz\nU74XKhNUVo12mbDb2zV3kc657jAzoNOdMCa6nQjbE6zozeYJYQZYSsO6iVZYZ32M\naQsWSiKv6sO4Q6r02uEkUTBrC4L3MRTS7vfdC18uvg4KEtwwGm22QVotjTkYdc/r\nf+7DOKJm275CmOFXWKcmA386Sade7j8uOavtmG2gYyC2weTb8yJmCR/5NKo0Z1FH\njatvdWTYt1cHTMytqRJUfXXUJRNHPU9a+3w7NTV+xCV15k0HkoyNC8zSC0RxWsNo\nY3fnGWpHAgMBAAECggEAKLa9F6AhKu2cadFT5a/ma6b0opww/YBh7MX5H5OFL5p0\nz0FlWpcHF8xAeTYV/bJoREKpvidb35enguRAXj8zjQhLOO55j1TfezhDjOf0SdH+\ncsHeFV/2+wZWSVSB7y42N6uTRaUIaJkH6SgPLPxIFocKWZMdv3dCZl38YwpZ7v3m\nz+5loem1/X9ESsrg+ddSUdDWdB95VPD8tztZH1rwzQoBJKIkK81w3tMSFo5TzbqK\ny2vsHQn5w9lzhxet2Lz8jQMAJIg/f75jKP25uAvEcXAgpAle1PQ2pxkjekmCHn2p\nIH2+UDTZlxQKy1rtAh9CmRGnGiNJpUlGZ7beXO5jdQKBgQDNK9gjC8bI/0FDVVHB\nF3SQsmQEpV4KeydFBg9cV16RdVDgTXSTZlJG2xUOMQwisdbyPibdc1U59HHLBY13\nAoZLlD4RaanxSKumUCxvst7k9aNyEiw+b8Rj+j+1nRG16OxuFMIbfO13gxxsZlB4\nJ915sU0KeAs20AVpXHP8BukxkwKBgQC+1u57xPkiCv0g9efTym/f1J5TgAqIpHLQ\np46xau8Kb4+EHqLwXzC7G512fjmO6v8nV8QZv/TnHlj1es3i3PiwI13gxsjnc/xA\nLvXWLAvol58faPr6DIOBqE3XDoYEJDsnKmdTbzhfsc4RkfwmX8InDXy8tH2fyOz+\nK9GTm2Jk/QKBgGqKigIo62EUq987Puj2NSGugSGofd0TdqDxNKjO9dyy/vx7PD4O\ntEr3GUf1UEfz8Zp5i9UTPv6JYU375CoYtYQpxtFj/Uu+YORMXcbjK7vZkrZ5mWAS\nyfjgypSUq8261ouTW/jKNsYI34mq176NdQTsfQUisTAVdbnwuIn3TMDhAoGAZx7S\nzRR5npibgTT/aSUJYMSOLQaSKpXZ6L+xzlK/Cj+QKE85snNtbJ2Wb5HzXjPDXioB\nr/xWxJBUd4k9OWo4A02JC82+f7rfwnrdojY41R0hAaMDgxxB70zXiu6xIgnF4Pr7\nzEzcBHGarUnaG45A5kNWdM1+2FmFHi7lV0JuX60CgYAXy3A5EfVyVEpGXRMivwRi\n2ozcdukRXlyJOxycmyRIbHIUb+rHGF9RMuDrOxg/GOB06YLdRqqkQEQY3bliPW5v\nEPF0twF8uqJnGVrQVguyIeeOeQA6vSFo3q5euaF+Fy4OSni6lqOfeLGxTLPgVBZv\nS9Dt/KHH2LEsoTK/DzcIRA==\n-----END PRIVATE KEY-----\n",
        client_email: "firebase-adminsdk-yna3z@clutch-a2f49.iam.gserviceaccount.com",
        client_id: "100297619729394765261",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-yna3z%40clutch-a2f49.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "clutch-a2f49.appspot.com",
        projectId: "clutch-a2f49"
      });

      console.log('✅ Firebase Admin SDK initialized successfully with service account');
    }

    // Cache commonly used services
    auth = admin.auth();
    storage = admin.storage();
    firestore = admin.firestore();

    return { admin, auth, storage, firestore };
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    console.log('⚠️ Running without Firebase services');
    return { admin: null, auth: null, storage: null, firestore: null };
  }
};

// Ensure initialization on module load so consumers can destructure exports safely
try {
  const result = initializeFirebaseAdmin();
  auth = result.auth;
  storage = result.storage;
  firestore = result.firestore;
} catch (e) {
  // Leave initialization to first consumer call if env is missing during build
}

// Get Firebase Auth instance
const getAuth = () => {
  if (!auth) {
    const result = initializeFirebaseAdmin();
    auth = result.auth;
  }
  return auth;
};

// Get Firebase Storage instance
const getStorage = () => {
  if (!storage) {
    const result = initializeFirebaseAdmin();
    storage = result.storage;
  }
  return storage;
};

// Get Firebase Firestore instance
const getFirestore = () => {
  if (!firestore) {
    const result = initializeFirebaseAdmin();
    firestore = result.firestore;
  }
  return firestore;
};

// Send SMS OTP via Firebase Phone Auth
const sendSMSOTP = async (phoneNumber, otp, purpose = 'verification') => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Store OTP in cache for verification
    const { getRedisClient } = require('./redis');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis client not available');
    }

    const otpKey = `otp:${formattedPhone}:${purpose}`;
    await redisClient.setex(otpKey, 600, JSON.stringify({
      otp,
      purpose,
      phoneNumber: formattedPhone,
      createdAt: new Date().toISOString(),
      attempts: 0
    }));

    console.log(`✅ OTP prepared for Firebase Phone Auth: ${formattedPhone}`);
    
    return {
      success: true,
      provider: 'firebase',
      phoneNumber: formattedPhone,
      expiresIn: 600,
      message: 'Firebase Phone Auth will send the verification code'
    };
  } catch (error) {
    console.error('❌ Firebase SMS OTP error:', error);
    throw error;
  }
};

// Verify SMS OTP
const verifySMSOTP = async (phoneNumber, otp, purpose = 'verification') => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Get OTP from cache
    const { getRedisClient } = require('./redis');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis client not available');
    }

    const otpKey = `otp:${formattedPhone}:${purpose}`;
    const storedOTPData = await redisClient.get(otpKey);
    
    if (!storedOTPData) {
      throw new Error('OTP expired or not found');
    }

    const storedOTP = JSON.parse(storedOTPData);
    
    if (storedOTP.attempts >= 3) {
      await redisClient.del(otpKey);
      throw new Error('Too many verification attempts');
    }

    // Increment attempts
    storedOTP.attempts++;
    await redisClient.setex(otpKey, 600, JSON.stringify(storedOTP));

    if (storedOTP.otp === otp) {
      // OTP verified successfully, remove from cache
      await redisClient.del(otpKey);
      console.log(`✅ OTP verified successfully for ${formattedPhone}`);
      return { success: true, verified: true };
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    throw error;
  }
};

// Format phone number for Firebase
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (Egypt: +20)
  if (!cleaned.startsWith('20')) {
    cleaned = '20' + cleaned;
  }
  
  // Add + prefix for Firebase
  return '+' + cleaned;
};

// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Health check for Firebase Admin
const healthCheck = async () => {
  try {
    if (!auth) {
      const result = initializeFirebaseAdmin();
      auth = result.auth;
    }
    
    if (!auth) {
      return {
        status: 'disabled',
        message: 'Firebase Admin SDK is not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    // Test Firebase connection
    await auth.listUsers(1);
    
    return {
      status: 'healthy',
      message: 'Firebase Admin SDK is working correctly',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  initializeFirebaseAdmin,
  getAuth,
  getStorage,
  getFirestore,
  sendSMSOTP,
  verifySMSOTP,
  formatPhoneNumber,
  generateOTP,
  healthCheck,
  auth: () => getAuth(),
  storage: () => getStorage(),
  firestore: () => getFirestore(),
  // Export initialized services for consumers like fileService
  storage,
  firestore
};
