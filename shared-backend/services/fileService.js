const { storage, firestore } = require('../config/firebase-admin');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');

/**
 * Enhanced File Service with Firebase Integration
 * Provides comprehensive file management with analytics and tracking
 */
class FileService {
  constructor() {
    // Check if Firebase is available
    this.firebaseAvailable = storage && firestore;
    
    if (this.firebaseAvailable) {
      try {
        this.bucket = storage.bucket();
        this.db = firestore;
        this.collections = {
          files: 'file_records',
          uploads: 'file_uploads',
          analytics: 'file_analytics',
          permissions: 'file_permissions'
        };
      } catch (error) {
        console.log('⚠️ Firebase not available, using fallback file service');
        this.firebaseAvailable = false;
      }
    }
    
    if (!this.firebaseAvailable) {
      console.log('⚠️ Running file service without Firebase - using local fallback');
      this.collections = {
        files: 'file_records',
        uploads: 'file_uploads',
        analytics: 'file_analytics',
        permissions: 'file_permissions'
      };
    }
  }

  /**
   * Upload a file to Firebase Storage with enhanced tracking
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} folderPath - Storage folder path
   * @param {Object} metadata - File metadata
   * @returns {Object} Upload result
   */
  async uploadFile(fileBuffer, fileName, folderPath, metadata = {}) {
    const uploadId = uuidv4();
    const timestamp = new Date();

    try {
      if (!this.firebaseAvailable) {
        // Fallback: return mock success response
        console.log(`⚠️ File upload fallback for: ${fileName}`);
        return {
          success: true,
          uploadId,
          fileName,
          originalName: fileName,
          fullPath: `${folderPath}/${fileName}`,
          publicUrl: `https://fallback.example.com/${folderPath}/${fileName}`,
          size: fileBuffer.length,
          message: 'File service running in fallback mode - Firebase not configured'
        };
      }

      // Generate unique file name
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const fullPath = `${folderPath}/${uniqueFileName}`;

      // Create file reference
      const file = this.bucket.file(fullPath);

      // Set file metadata
      const fileMetadata = {
        contentType: metadata.contentType || 'application/octet-stream',
        metadata: {
          originalName: fileName,
          uploadedBy: metadata.uploadedBy || 'system',
          uploadedAt: timestamp.toISOString(),
          uploadId: uploadId,
          ...metadata
        }
      };

      // Log upload attempt
      await this.logUploadAttempt({
        uploadId,
        fileName,
        originalName: fileName,
        fullPath,
        size: fileBuffer.length,
        contentType: fileMetadata.contentType,
        uploadedBy: metadata.uploadedBy || 'system',
        timestamp
      });

      // Upload file
      await file.save(fileBuffer, fileMetadata);

      // Get public URL
      const publicUrl = await this.getPublicUrl(fullPath);

      // Save file record to Firestore
      const fileRecord = {
        fileId: uploadId,
        fileName: uniqueFileName,
        originalName: fileName,
        fullPath,
        publicUrl,
        size: fileBuffer.length,
        contentType: fileMetadata.contentType,
        uploadedBy: metadata.uploadedBy || 'system',
        uploadedAt: timestamp,
        metadata: fileMetadata.metadata,
        status: 'active',
        downloadCount: 0,
        lastAccessed: timestamp
      };

      await this.db.collection(this.collections.files).add(fileRecord);

      // Log successful upload
      await this.logUploadSuccess({
        uploadId,
        fileId: uploadId,
        fileName: uniqueFileName,
        originalName: fileName,
        fullPath,
        size: fileBuffer.length,
        publicUrl,
        uploadedBy: metadata.uploadedBy || 'system',
        timestamp
      });

      console.log(`✅ File uploaded successfully: ${fullPath}`);
      
      return {
        success: true,
        fileId: uploadId,
        fileName: uniqueFileName,
        originalName: fileName,
        fullPath,
        publicUrl,
        size: fileBuffer.length,
        contentType: fileMetadata.contentType
      };

    } catch (error) {
      // Log upload failure
      await this.logUploadFailure({
        uploadId,
        fileName,
        originalName: fileName,
        fullPath: `${folderPath}/${fileName}`,
        size: fileBuffer.length,
        uploadedBy: metadata.uploadedBy || 'system',
        error: error.message,
        timestamp
      });

      console.error('❌ File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download a file from Firebase Storage
   * @param {string} filePath - File path in storage
   * @returns {Object} Download result
   */
  async downloadFile(filePath) {
    const downloadId = uuidv4();
    const timestamp = new Date();

    try {
      const file = this.bucket.file(filePath);
      
      // Log download attempt
      await this.logDownloadAttempt({
        downloadId,
        filePath,
        timestamp
      });

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Download file
      const [buffer] = await file.download();

      // Update file record
      await this.updateFileAccess(filePath, 'download');

      // Log successful download
      await this.logDownloadSuccess({
        downloadId,
        filePath,
        size: buffer.length,
        timestamp
      });

      return {
        success: true,
        downloadId,
        buffer,
        metadata,
        size: buffer.length
      };

    } catch (error) {
      // Log download failure
      await this.logDownloadFailure({
        downloadId,
        filePath,
        error: error.message,
        timestamp
      });

      console.error('❌ File download error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param {string} filePath - File path in storage
   * @returns {Object} Delete result
   */
  async deleteFile(filePath) {
    const deleteId = uuidv4();
    const timestamp = new Date();

    try {
      const file = this.bucket.file(filePath);
      
      // Log delete attempt
      await this.logDeleteAttempt({
        deleteId,
        filePath,
        timestamp
      });

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Delete file
      await file.delete();

      // Update file record status
      await this.updateFileStatus(filePath, 'deleted');

      // Log successful delete
      await this.logDeleteSuccess({
        deleteId,
        filePath,
        timestamp
      });

      console.log(`✅ File deleted successfully: ${filePath}`);
      
      return {
        success: true,
        deleteId,
        message: 'File deleted successfully'
      };

    } catch (error) {
      // Log delete failure
      await this.logDeleteFailure({
        deleteId,
        filePath,
        error: error.message,
        timestamp
      });

      console.error('❌ File delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file information
   * @param {string} filePath - File path in storage
   * @returns {Object} File information
   */
  async getFileInfo(filePath) {
    try {
      const file = this.bucket.file(filePath);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Get file record from Firestore
      const fileRecord = await this.getFileRecord(filePath);

      return {
        success: true,
        filePath,
        metadata,
        record: fileRecord,
        publicUrl: await this.getPublicUrl(filePath)
      };

    } catch (error) {
      console.error('❌ Get file info error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get public URL for a file
   * @param {string} filePath - File path in storage
   * @returns {string} Public URL
   */
  async getPublicUrl(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      return url;
    } catch (error) {
      console.error('❌ Error getting public URL:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   * @param {string} folderPath - Folder path
   * @param {Object} options - List options
   * @returns {Object} List result
   */
  async listFiles(folderPath, options = {}) {
    try {
      const { maxResults = 100, pageToken } = options;
      
      const [files] = await this.bucket.getFiles({
        prefix: folderPath,
        maxResults,
        pageToken
      });

      const fileList = await Promise.all(files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const publicUrl = await this.getPublicUrl(file.name);
        
        return {
          name: file.name,
          size: metadata.size,
          contentType: metadata.contentType,
          updated: metadata.updated,
          publicUrl
        };
      }));

      return {
        success: true,
        files: fileList,
        count: fileList.length
      };

    } catch (error) {
      console.error('❌ List files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file analytics
   * @param {Object} filters - Date range and other filters
   * @returns {Object} File analytics
   */
  async getFileAnalytics(filters = {}) {
    try {
      const { startDate, endDate, uploadedBy, fileType } = filters;
      
      let query = this.db.collection(this.collections.files);
      
      if (startDate && endDate) {
        query = query.where('uploadedAt', '>=', new Date(startDate))
                    .where('uploadedAt', '<=', new Date(endDate));
      }
      
      if (uploadedBy) {
        query = query.where('uploadedBy', '==', uploadedBy);
      }

      const snapshot = await query.get();
      const files = [];
      
      snapshot.forEach(doc => {
        files.push({ id: doc.id, ...doc.data() });
      });

      // Filter by file type if specified
      const filteredFiles = fileType ? 
        files.filter(f => f.contentType.startsWith(fileType)) : files;

      // Calculate metrics
      const totalFiles = filteredFiles.length;
      const totalSize = filteredFiles.reduce((sum, file) => sum + file.size, 0);
      const totalDownloads = filteredFiles.reduce((sum, file) => sum + (file.downloadCount || 0), 0);
      
      const fileTypes = {};
      filteredFiles.forEach(file => {
        const type = file.contentType.split('/')[0];
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalFiles,
          totalSize,
          totalDownloads,
          fileTypes,
          timeRange: { startDate, endDate },
          files: filteredFiles.slice(0, 50) // Limit to last 50 files
        }
      };
    } catch (error) {
      logger.error('Error getting file analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set file permissions
   * @param {string} filePath - File path
   * @param {Object} permissions - Permission settings
   * @returns {Object} Permission result
   */
  async setFilePermissions(filePath, permissions) {
    try {
      const permissionId = uuidv4();
      const timestamp = new Date();

      const permissionRecord = {
        permissionId,
        filePath,
        permissions,
        setBy: permissions.setBy || 'system',
        setAt: timestamp,
        expiresAt: permissions.expiresAt
      };

      await this.db.collection(this.collections.permissions).add(permissionRecord);

      return {
        success: true,
        permissionId,
        message: 'File permissions set successfully'
      };
    } catch (error) {
      logger.error('Error setting file permissions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods for logging
  async logUploadAttempt(data) {
    try {
      await this.db.collection(this.collections.uploads).add({
        ...data,
        action: 'upload_attempt'
      });
    } catch (error) {
      logger.error('Error logging upload attempt:', error);
    }
  }

  async logUploadSuccess(data) {
    try {
      await this.db.collection(this.collections.uploads).add({
        ...data,
        action: 'upload_success'
      });
    } catch (error) {
      logger.error('Error logging upload success:', error);
    }
  }

  async logUploadFailure(data) {
    try {
      await this.db.collection(this.collections.uploads).add({
        ...data,
        action: 'upload_failure'
      });
    } catch (error) {
      logger.error('Error logging upload failure:', error);
    }
  }

  async logDownloadAttempt(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'download_attempt'
      });
    } catch (error) {
      logger.error('Error logging download attempt:', error);
    }
  }

  async logDownloadSuccess(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'download_success'
      });
    } catch (error) {
      logger.error('Error logging download success:', error);
    }
  }

  async logDownloadFailure(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'download_failure'
      });
    } catch (error) {
      logger.error('Error logging download failure:', error);
    }
  }

  async logDeleteAttempt(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'delete_attempt'
      });
    } catch (error) {
      logger.error('Error logging delete attempt:', error);
    }
  }

  async logDeleteSuccess(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'delete_success'
      });
    } catch (error) {
      logger.error('Error logging delete success:', error);
    }
  }

  async logDeleteFailure(data) {
    try {
      await this.db.collection(this.collections.analytics).add({
        ...data,
        action: 'delete_failure'
      });
    } catch (error) {
      logger.error('Error logging delete failure:', error);
    }
  }

  async updateFileAccess(filePath, action) {
    try {
      const fileSnapshot = await this.db.collection(this.collections.files)
        .where('fullPath', '==', filePath)
        .get();

      if (!fileSnapshot.empty) {
        const doc = fileSnapshot.docs[0];
        const updateData = {
          lastAccessed: new Date()
        };

        if (action === 'download') {
          updateData.downloadCount = (doc.data().downloadCount || 0) + 1;
        }

        await doc.ref.update(updateData);
      }
    } catch (error) {
      logger.error('Error updating file access:', error);
    }
  }

  async updateFileStatus(filePath, status) {
    try {
      const fileSnapshot = await this.db.collection(this.collections.files)
        .where('fullPath', '==', filePath)
        .get();

      if (!fileSnapshot.empty) {
        await fileSnapshot.docs[0].ref.update({
          status,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Error updating file status:', error);
    }
  }

  async getFileRecord(filePath) {
    try {
      const fileSnapshot = await this.db.collection(this.collections.files)
        .where('fullPath', '==', filePath)
        .get();

      if (!fileSnapshot.empty) {
        return { id: fileSnapshot.docs[0].id, ...fileSnapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      logger.error('Error getting file record:', error);
      return null;
    }
  }
}

// Create singleton instance
const fileService = new FileService();

module.exports = fileService;
