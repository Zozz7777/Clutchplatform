const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const firebaseConfig = require('../config/firebase-config');
const seedingConfig = require('../config/seeding-config');

class LogoManager {
  constructor() {
    this.downloadedLogos = new Map();
    this.uploadedLogos = new Map();
    this.failedLogos = new Map();
    this.tempDir = path.join(__dirname, '../temp/logos');
  }

  async initialize() {
    try {
      // Create temp directory if it doesn't exist
      await fs.mkdir(this.tempDir, { recursive: true });
      
      // Initialize Firebase
      await firebaseConfig.initialize();
      
      console.log('✅ Logo manager initialized');
    } catch (error) {
      console.error('❌ Error initializing logo manager:', error);
      throw error;
    }
  }

  async downloadLogo(url, brandName) {
    try {
      const fileName = `${brandName.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filePath = path.join(this.tempDir, fileName);

      console.log(`📥 Downloading logo for ${brandName} from ${url}`);

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Check file size
      const fileSize = response.data.length;
      const maxSize = seedingConfig.firebase.maxLogoSize;
      
      if (fileSize > maxSize) {
        throw new Error(`Logo file too large: ${fileSize} bytes (max: ${maxSize} bytes)`);
      }

      // Save file
      await fs.writeFile(filePath, response.data);
      
      this.downloadedLogos.set(brandName, {
        url: url,
        path: filePath,
        size: fileSize,
        downloadedAt: new Date()
      });

      console.log(`✅ Logo downloaded for ${brandName}: ${fileSize} bytes`);
      return filePath;
    } catch (error) {
      console.error(`❌ Failed to download logo for ${brandName}:`, error.message);
      this.failedLogos.set(brandName, {
        url: url,
        error: error.message,
        failedAt: new Date()
      });
      throw error;
    }
  }

  async processLogo(filePath, brandName) {
    try {
      // For now, we'll just validate the file
      // In a production environment, you'd want to:
      // - Resize images to different dimensions
      // - Optimize for web
      // - Convert to different formats
      // - Add watermark or branding

      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      if (fileSize === 0) {
        throw new Error('Logo file is empty');
      }

      // Basic validation - check if it's a valid image
      const buffer = await fs.readFile(filePath);
      const isPNG = buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
      
      if (!isPNG) {
        throw new Error('Logo is not a valid PNG file');
      }

      console.log(`✅ Logo processed for ${brandName}: ${fileSize} bytes`);
      return filePath;
    } catch (error) {
      console.error(`❌ Failed to process logo for ${brandName}:`, error.message);
      throw error;
    }
  }

  async uploadLogoWithSizes(filePath, brandName) {
    try {
      if (!seedingConfig.shouldUploadLogos()) {
        console.log(`⏭️  Logo upload disabled for ${brandName}`);
        return this.generateFallbackUrls(brandName);
      }

      console.log(`📤 Uploading logos for ${brandName}`);

      const logoSizes = seedingConfig.getLogoSizes();
      const uploadedUrls = {};

      for (const size of logoSizes) {
        try {
          // In a real implementation, you'd resize the image here
          // For now, we'll upload the original with size suffix
          const fileName = `${size}.png`;
          const destinationPath = `brands/${brandName.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;
          
          const url = await firebaseConfig.uploadLogo(filePath, destinationPath, {
            size: `${size}x${size}`,
            brand: brandName,
            uploadedAt: new Date().toISOString()
          });
          
          uploadedUrls[size] = url;
          console.log(`  ✅ Uploaded ${size}x${size} logo for ${brandName}`);
        } catch (error) {
          console.warn(`  ⚠️  Failed to upload ${size}x${size} logo for ${brandName}:`, error.message);
          uploadedUrls[size] = null;
        }
      }

      this.uploadedLogos.set(brandName, {
        urls: uploadedUrls,
        uploadedAt: new Date()
      });

      return uploadedUrls;
    } catch (error) {
      console.error(`❌ Failed to upload logos for ${brandName}:`, error.message);
      return this.generateFallbackUrls(brandName);
    }
  }

  async uploadPaymentMethodLogo(filePath, paymentMethodName) {
    try {
      if (!seedingConfig.shouldUploadLogos()) {
        console.log(`⏭️  Logo upload disabled for ${paymentMethodName}`);
        return this.generatePaymentMethodFallbackUrl(paymentMethodName);
      }

      console.log(`📤 Uploading payment method logo for ${paymentMethodName}`);

      const url = await firebaseConfig.uploadPaymentMethodLogo(filePath, paymentMethodName);
      
      this.uploadedLogos.set(paymentMethodName, {
        url: url,
        uploadedAt: new Date()
      });

      console.log(`✅ Payment method logo uploaded for ${paymentMethodName}`);
      return url;
    } catch (error) {
      console.error(`❌ Failed to upload payment method logo for ${paymentMethodName}:`, error.message);
      return this.generatePaymentMethodFallbackUrl(paymentMethodName);
    }
  }

  generateFallbackUrls(brandName) {
    // Generate fallback URLs for when logo upload fails
    const logoSizes = seedingConfig.getLogoSizes();
    const fallbackUrls = {};

    for (const size of logoSizes) {
      fallbackUrls[size] = `https://via.placeholder.com/${size}x${size}/f0f0f0/666666?text=${encodeURIComponent(brandName)}`;
    }

    console.log(`🔄 Using fallback URLs for ${brandName}`);
    return fallbackUrls;
  }

  generatePaymentMethodFallbackUrl(paymentMethodName) {
    return `https://via.placeholder.com/128x64/f0f0f0/666666?text=${encodeURIComponent(paymentMethodName)}`;
  }

  async downloadAndUploadLogo(url, brandName) {
    try {
      // Download logo
      const filePath = await this.downloadLogo(url, brandName);
      
      // Process logo
      await this.processLogo(filePath, brandName);
      
      // Upload logo with different sizes
      const uploadedUrls = await this.uploadLogoWithSizes(filePath, brandName);
      
      // Clean up temp file
      await this.cleanupTempFile(filePath);
      
      return uploadedUrls;
    } catch (error) {
      console.error(`❌ Failed to download and upload logo for ${brandName}:`, error.message);
      return this.generateFallbackUrls(brandName);
    }
  }

  async downloadAndUploadPaymentMethodLogo(url, paymentMethodName) {
    try {
      // Download logo
      const filePath = await this.downloadLogo(url, paymentMethodName);
      
      // Process logo
      await this.processLogo(filePath, paymentMethodName);
      
      // Upload logo
      const uploadedUrl = await this.uploadPaymentMethodLogo(filePath, paymentMethodName);
      
      // Clean up temp file
      await this.cleanupTempFile(filePath);
      
      return uploadedUrl;
    } catch (error) {
      console.error(`❌ Failed to download and upload payment method logo for ${paymentMethodName}:`, error.message);
      return this.generatePaymentMethodFallbackUrl(paymentMethodName);
    }
  }

  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  Cleaned up temp file: ${path.basename(filePath)}`);
    } catch (error) {
      console.warn(`⚠️  Failed to cleanup temp file ${filePath}:`, error.message);
    }
  }

  async cleanupAllTempFiles() {
    try {
      const files = await fs.readdir(this.tempDir);
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        await this.cleanupTempFile(filePath);
      }
      
      console.log(`🧹 Cleaned up ${files.length} temp files`);
    } catch (error) {
      console.error('❌ Error cleaning up temp files:', error);
    }
  }

  async getLogoStats() {
    return {
      downloaded: this.downloadedLogos.size,
      uploaded: this.uploadedLogos.size,
      failed: this.failedLogos.size,
      downloadedLogos: Array.from(this.downloadedLogos.keys()),
      uploadedLogos: Array.from(this.uploadedLogos.keys()),
      failedLogos: Array.from(this.failedLogos.keys())
    };
  }

  async validateLogoUrls(urls) {
    const validUrls = {};
    const invalidUrls = {};

    for (const [size, url] of Object.entries(urls)) {
      if (!url) {
        invalidUrls[size] = 'URL is null or undefined';
        continue;
      }

      try {
        const response = await axios.head(url, { timeout: 10000 });
        if (response.status === 200) {
          validUrls[size] = url;
        } else {
          invalidUrls[size] = `HTTP ${response.status}`;
        }
      } catch (error) {
        invalidUrls[size] = error.message;
      }
    }

    return { validUrls, invalidUrls };
  }

  async batchUploadLogos(logoData) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    const maxConcurrent = seedingConfig.logoManagement.maxConcurrentUploads;
    const batches = this.chunkArray(logoData, maxConcurrent);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} logos)`);

      const batchPromises = batch.map(async (logo) => {
        try {
          if (logo.type === 'brand') {
            const urls = await this.downloadAndUploadLogo(logo.url, logo.name);
            results.successful.push({ name: logo.name, type: 'brand', urls });
          } else if (logo.type === 'payment') {
            const url = await this.downloadAndUploadPaymentMethodLogo(logo.url, logo.name);
            results.successful.push({ name: logo.name, type: 'payment', url });
          }
        } catch (error) {
          results.failed.push({ name: logo.name, type: logo.type, error: error.message });
        }
      });

      await Promise.allSettled(batchPromises);

      // Add delay between batches
      if (i < batches.length - 1) {
        await this.delay(1000);
      }
    }

    return results;
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck() {
    try {
      const firebaseHealth = await firebaseConfig.healthCheck();
      
      return {
        firebase: firebaseHealth,
        tempDir: await fs.access(this.tempDir).then(() => 'accessible').catch(() => 'not_accessible'),
        stats: await this.getLogoStats()
      };
    } catch (error) {
      return {
        error: error.message,
        stats: await this.getLogoStats()
      };
    }
  }

  async disconnect() {
    try {
      await this.cleanupAllTempFiles();
      await firebaseConfig.disconnect();
      console.log('🔌 Logo manager disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting logo manager:', error);
    }
  }
}

// Create singleton instance
const logoManager = new LogoManager();

module.exports = logoManager;
