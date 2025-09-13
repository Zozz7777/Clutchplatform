const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== MEDIA MANAGEMENT ROUTES ====================

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// GET /api/v1/media-management/files - Get all media files with filtering
router.get('/files', authenticateToken, async (req, res) => {
  try {
    console.log('📁 Fetching media files:', req.query);
    
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category,
      search,
      uploadedBy,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const collection = await getCollection('media_files');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (uploadedBy) query.uploadedBy = uploadedBy;
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.uploadedAt = {};
      if (startDate) query.uploadedAt.$gte = new Date(startDate);
      if (endDate) query.uploadedAt.$lte = new Date(endDate);
    }
    
    // Get files with pagination
    const files = await collection
      .find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching media files:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FILES_FAILED',
      message: 'Failed to fetch media files'
    });
  }
});

// POST /api/v1/media-management/upload - Upload media files
router.post('/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    console.log('📤 Uploading media files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'No files uploaded'
      });
    }
    
    const { category = 'general', description = '' } = req.body;
    const collection = await getCollection('media_files');
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      // Get file metadata
      const stats = await fs.stat(file.path);
      const fileType = getFileType(file.mimetype);
      
      const mediaFile = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        type: fileType,
        category,
        description,
        path: file.path,
        url: `/uploads/${file.filename}`,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        status: 'active',
        metadata: {
          dimensions: fileType === 'image' ? await getImageDimensions(file.path) : null,
          duration: fileType === 'video' ? await getVideoDuration(file.path) : null,
          pages: fileType === 'document' ? await getDocumentPages(file.path) : null
        },
        tags: [],
        downloads: 0,
        views: 0
      };
      
      const result = await collection.insertOne(mediaFile);
      uploadedFiles.push({
        id: result.insertedId,
        ...mediaFile
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length
      },
      message: 'Files uploaded successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error uploading files:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: 'Failed to upload files'
    });
  }
});

// GET /api/v1/media-management/files/:id - Get specific media file
router.get('/files/:id', authenticateToken, async (req, res) => {
  try {
    console.log('📁 Fetching media file:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('media_files');
    
    const file = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: 'Media file not found'
      });
    }
    
    // Increment view count
    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    );
    
    res.json({
      success: true,
      data: file,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching media file:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FILE_FAILED',
      message: 'Failed to fetch media file'
    });
  }
});

// PUT /api/v1/media-management/files/:id - Update media file metadata
router.put('/files/:id', authenticateToken, async (req, res) => {
  try {
    console.log('✏️ Updating media file:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const { 
      category, 
      description, 
      tags = [], 
      status 
    } = req.body;
    
    const collection = await getCollection('media_files');
    
    // Check if file exists
    const existingFile = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!existingFile) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: 'Media file not found'
      });
    }
    
    // Check permissions (only owner or admin can update)
    if (existingFile.uploadedBy !== req.user.id && !req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You do not have permission to update this file'
      });
    }
    
    // Build update object
    const updateData = { updatedAt: new Date() };
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
    if (status) updateData.status = status;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'No changes made to media file'
      });
    }
    
    // Get updated file
    const updatedFile = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({
      success: true,
      data: updatedFile,
      message: 'Media file updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating media file:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_FILE_FAILED',
      message: 'Failed to update media file'
    });
  }
});

// DELETE /api/v1/media-management/files/:id - Delete media file
router.delete('/files/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ Deleting media file:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('media_files');
    
    // Check if file exists
    const file = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: 'Media file not found'
      });
    }
    
    // Check permissions (only owner or admin can delete)
    if (file.uploadedBy !== req.user.id && !req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'You do not have permission to delete this file'
      });
    }
    
    // Delete file from filesystem
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.error('Error deleting file from filesystem:', unlinkError);
    }
    
    // Delete file record from database
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'DELETE_FAILED',
        message: 'Failed to delete media file'
      });
    }
    
    res.json({
      success: true,
      message: 'Media file deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting media file:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_FILE_FAILED',
      message: 'Failed to delete media file'
    });
  }
});

// GET /api/v1/media-management/files/:id/download - Download media file
router.get('/files/:id/download', authenticateToken, async (req, res) => {
  try {
    console.log('⬇️ Downloading media file:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('media_files');
    
    const file = await collection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'FILE_NOT_FOUND',
        message: 'Media file not found'
      });
    }
    
    // Increment download count
    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { downloads: 1 } }
    );
    
    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);
    
    // Stream file to response
    const fileStream = require('fs').createReadStream(file.path);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Error downloading media file:', error);
    res.status(500).json({
      success: false,
      error: 'DOWNLOAD_FAILED',
      message: 'Failed to download media file'
    });
  }
});

// GET /api/v1/media-management/analytics - Get media analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📊 Fetching media analytics');
    
    const { startDate, endDate } = req.query;
    const collection = await getCollection('media_files');
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.uploadedAt = {};
      if (startDate) dateFilter.uploadedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.uploadedAt.$lte = new Date(endDate);
    }
    
    // Get analytics
    const [
      totalFiles,
      totalSize,
      filesByType,
      filesByCategory,
      topUploaders,
      mostDownloaded,
      mostViewed
    ] = await Promise.all([
      // Total files
      collection.countDocuments(dateFilter),
      
      // Total size
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]).toArray(),
      
      // Files by type
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Files by category
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Top uploaders
      collection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$uploadedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Most downloaded files
      collection.find(dateFilter)
        .sort({ downloads: -1 })
        .limit(10)
        .toArray(),
      
      // Most viewed files
      collection.find(dateFilter)
        .sort({ views: -1 })
        .limit(10)
        .toArray()
    ]);
    
    const analytics = {
      overview: {
        totalFiles,
        totalSize: totalSize[0]?.totalSize || 0,
        avgFileSize: totalFiles > 0 ? Math.round((totalSize[0]?.totalSize || 0) / totalFiles) : 0
      },
      distribution: {
        byType: filesByType,
        byCategory: filesByCategory
      },
      topPerformers: {
        uploaders: topUploaders,
        downloaded: mostDownloaded,
        viewed: mostViewed
      }
    };
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching media analytics:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_ANALYTICS_FAILED',
      message: 'Failed to fetch media analytics'
    });
  }
});

// POST /api/v1/media-management/bulk-operations - Bulk operations on media files
router.post('/bulk-operations', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('📦 Performing bulk operations on media files');
    
    const { operation, fileIds, data } = req.body;
    
    if (!operation || !fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Operation, fileIds array, and data are required'
      });
    }
    
    const { ObjectId } = require('mongodb');
    const collection = await getCollection('media_files');
    
    const objectIds = fileIds.map(id => new ObjectId(id));
    let result;
    
    switch (operation) {
      case 'update_category':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { category: data.category, updatedAt: new Date() } }
        );
        break;
        
      case 'add_tags':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { $addToSet: { tags: { $each: data.tags } } }
        );
        break;
        
      case 'delete':
        // Get files to delete from filesystem
        const filesToDelete = await collection.find({ _id: { $in: objectIds } }).toArray();
        
        // Delete from filesystem
        for (const file of filesToDelete) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error deleting file from filesystem:', unlinkError);
          }
        }
        
        result = await collection.deleteMany({ _id: { $in: objectIds } });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_OPERATION',
          message: 'Invalid bulk operation'
        });
    }
    
    res.json({
      success: true,
      data: {
        operation,
        filesProcessed: result.modifiedCount || result.deletedCount || 0,
        totalRequested: fileIds.length
      },
      message: `Bulk operation '${operation}' completed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error performing bulk operations:', error);
    res.status(500).json({
      success: false,
      error: 'BULK_OPERATION_FAILED',
      message: 'Failed to perform bulk operations'
    });
  }
});

// Helper functions
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'document';
  return 'other';
}

async function getImageDimensions(filePath) {
  try {
    // In production, use a library like 'sharp' or 'jimp' to get image dimensions
    return { width: 1920, height: 1080 }; // Placeholder
  } catch (error) {
    return null;
  }
}

async function getVideoDuration(filePath) {
  try {
    // In production, use a library like 'ffprobe' to get video duration
    return 120; // Placeholder duration in seconds
  } catch (error) {
    return null;
  }
}

async function getDocumentPages(filePath) {
  try {
    // In production, use a library like 'pdf-parse' to get document pages
    return 10; // Placeholder page count
  } catch (error) {
    return null;
  }
}


// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} service is running`,
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item retrieved`,
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item created`,
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item updated`,
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} item deleted`,
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${routeFile.replace('.js', '')} search results`,
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
