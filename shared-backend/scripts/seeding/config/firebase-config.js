const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

class FirebaseConfig {
  constructor() {
    this.app = null;
    this.storage = null;
    this.bucket = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('✅ Firebase already initialized');
        return this.app;
      }

      // Try to use existing Firebase admin configuration first
      try {
        const { initializeFirebaseAdmin } = require('../../../config/firebase-admin');
        initializeFirebaseAdmin();
        
        // Get the existing app or create a new one
        if (admin.apps.length > 0) {
          this.app = admin.app();
        } else {
          this.app = admin.initializeApp();
        }
        
        this.storage = this.app.storage();
        this.bucket = this.storage.bucket();
        this.isInitialized = true;
        
        console.log('✅ Firebase initialized using existing configuration');
        console.log(`📦 Storage bucket: ${this.bucket.name}`);
        return this.app;
      } catch (existingError) {
        console.log('⚠️  Existing Firebase config not available, trying environment variables...');
        
        // Fallback to environment variables
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
          throw new Error('Firebase credentials not found in environment variables');
        }

        // Initialize Firebase Admin SDK
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        });

        this.storage = this.app.storage();
        this.bucket = this.storage.bucket();
        this.isInitialized = true;

        console.log('✅ Firebase initialized successfully');
        console.log(`📦 Storage bucket: ${this.bucket.name}`);

        return this.app;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      throw error;
    }
  }

  async uploadLogo(filePath, destinationPath, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if file exists
      await fs.access(filePath);

      const file = this.bucket.file(destinationPath);
      
      // Set metadata
      const uploadMetadata = {
        metadata: {
          ...metadata,
          cacheControl: 'public, max-age=31536000', // 1 year cache
          contentType: 'image/png'
        }
      };

      // Upload file
      await this.bucket.upload(filePath, {
        destination: destinationPath,
        metadata: uploadMetadata
      });

      // Make file publicly accessible
      await file.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${destinationPath}`;
      
      console.log(`✅ Logo uploaded: ${destinationPath}`);
      return publicUrl;
    } catch (error) {
      console.error(`❌ Error uploading logo ${filePath}:`, error);
      throw error;
    }
  }

  async uploadLogoWithSizes(originalFilePath, brandName, sizes = [32, 64, 128, 256, 512]) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const uploadedUrls = {};
      const brandFolder = `brands/${brandName.toLowerCase().replace(/\s+/g, '-')}`;

      for (const size of sizes) {
        try {
          // Create resized image (this would require image processing library)
          // For now, we'll upload the original with size suffix
          const fileName = `${size}.png`;
          const destinationPath = `${brandFolder}/${fileName}`;
          
          const url = await this.uploadLogo(originalFilePath, destinationPath, {
            size: `${size}x${size}`,
            brand: brandName
          });
          
          uploadedUrls[size] = url;
        } catch (error) {
          console.warn(`⚠️  Failed to upload ${size}x${size} logo for ${brandName}:`, error.message);
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error(`❌ Error uploading logos for ${brandName}:`, error);
      throw error;
    }
  }

  async uploadPaymentMethodLogo(filePath, paymentMethodName) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const fileName = `${paymentMethodName.toLowerCase().replace(/\s+/g, '-')}.png`;
      const destinationPath = `payment-methods/${fileName}`;
      
      const url = await this.uploadLogo(filePath, destinationPath, {
        category: 'payment-method',
        name: paymentMethodName
      });

      return url;
    } catch (error) {
      console.error(`❌ Error uploading payment method logo for ${paymentMethodName}:`, error);
      throw error;
    }
  }

  async deleteLogo(destinationPath) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const file = this.bucket.file(destinationPath);
      await file.delete();
      
      console.log(`🗑️  Logo deleted: ${destinationPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting logo ${destinationPath}:`, error);
      throw error;
    }
  }

  async listLogos(prefix = '') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const [files] = await this.bucket.getFiles({ prefix });
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        publicUrl: `https://storage.googleapis.com/${this.bucket.name}/${file.name}`,
        createdAt: file.metadata.timeCreated
      }));
    } catch (error) {
      console.error('❌ Error listing logos:', error);
      throw error;
    }
  }

  async getLogoUrl(destinationPath) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const file = this.bucket.file(destinationPath);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error(`Logo not found: ${destinationPath}`);
      }

      return `https://storage.googleapis.com/${this.bucket.name}/${destinationPath}`;
    } catch (error) {
      console.error(`❌ Error getting logo URL for ${destinationPath}:`, error);
      throw error;
    }
  }

  async createFolder(folderPath) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Create a placeholder file to establish the folder
      const placeholderPath = `${folderPath}/.placeholder`;
      const file = this.bucket.file(placeholderPath);
      
      await file.save('', {
        metadata: {
          contentType: 'text/plain'
        }
      });

      console.log(`📁 Folder created: ${folderPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating folder ${folderPath}:`, error);
      throw error;
    }
  }

  async getStorageStats() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const [files] = await this.bucket.getFiles();
      
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        categories: {}
      };

      files.forEach(file => {
        const size = parseInt(file.metadata.size) || 0;
        stats.totalSize += size;
        
        // Categorize by folder
        const category = file.name.split('/')[0];
        if (!stats.categories[category]) {
          stats.categories[category] = { count: 0, size: 0 };
        }
        stats.categories[category].count++;
        stats.categories[category].size += size;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      throw error;
    }
  }

  async cleanupOrphanedLogos(brandNames, paymentMethodNames) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🧹 Cleaning up orphaned logos...');
      
      // Get all logo files
      const [files] = await this.bucket.getFiles();
      const orphanedFiles = [];

      for (const file of files) {
        const fileName = file.name;
        
        // Skip placeholder files
        if (fileName.includes('.placeholder')) {
          continue;
        }

        // Check if file is orphaned
        let isOrphaned = true;
        
        // Check brand logos
        for (const brandName of brandNames) {
          const brandFolder = `brands/${brandName.toLowerCase().replace(/\s+/g, '-')}`;
          if (fileName.startsWith(brandFolder)) {
            isOrphaned = false;
            break;
          }
        }

        // Check payment method logos
        if (isOrphaned) {
          for (const paymentMethodName of paymentMethodNames) {
            const paymentFileName = `payment-methods/${paymentMethodName.toLowerCase().replace(/\s+/g, '-')}.png`;
            if (fileName === paymentFileName) {
              isOrphaned = false;
              break;
            }
          }
        }

        if (isOrphaned) {
          orphanedFiles.push(fileName);
        }
      }

      // Delete orphaned files
      let deletedCount = 0;
      for (const fileName of orphanedFiles) {
        try {
          await this.deleteLogo(fileName);
          deletedCount++;
        } catch (error) {
          console.warn(`⚠️  Failed to delete orphaned file ${fileName}:`, error.message);
        }
      }

      console.log(`✅ Cleaned up ${deletedCount} orphaned logo files`);
      return { deletedCount, orphanedFiles };
    } catch (error) {
      console.error('❌ Error cleaning up orphaned logos:', error);
      throw error;
    }
  }

  async generateLogoUrls(brandName, sizes = [32, 64, 128, 256, 512]) {
    try {
      const brandFolder = `brands/${brandName.toLowerCase().replace(/\s+/g, '-')}`;
      const urls = {};

      for (const size of sizes) {
        const fileName = `${size}.png`;
        const filePath = `${brandFolder}/${fileName}`;
        
        try {
          const url = await this.getLogoUrl(filePath);
          urls[size] = url;
        } catch (error) {
          console.warn(`⚠️  Logo not found for ${brandName} at size ${size}:`, error.message);
          // Use fallback URL or null
          urls[size] = null;
        }
      }

      return urls;
    } catch (error) {
      console.error(`❌ Error generating logo URLs for ${brandName}:`, error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { status: 'not_initialized', message: 'Firebase not initialized' };
      }

      // Test bucket access
      const [exists] = await this.bucket.exists();
      
      if (exists) {
        return { status: 'healthy', message: 'Firebase Storage is accessible' };
      } else {
        return { status: 'unhealthy', message: 'Firebase Storage bucket not found' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async disconnect() {
    try {
      if (this.app) {
        await this.app.delete();
        this.app = null;
        this.storage = null;
        this.bucket = null;
        this.isInitialized = false;
        console.log('🔌 Firebase disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Firebase:', error);
      throw error;
    }
  }
}

// Create singleton instance
const firebaseConfig = new FirebaseConfig();

module.exports = firebaseConfig;
