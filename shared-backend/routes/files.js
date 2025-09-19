/**
 * Files Routes
 * Handles file upload, download, and management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// POST /api/v1/files/upload - Upload a file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const filesCollection = await getCollection('files');
    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user?.id || 'unknown',
      uploadedAt: new Date(),
      status: 'active'
    };
    
    const result = await filesCollection.insertOne(fileData);
    
    res.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: fileData.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

// GET /api/v1/files/:fileId/download - Download a file
router.get('/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const filesCollection = await getCollection('files');
    
    const file = await filesCollection.findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({ success: false, error: 'File not found on disk' });
    }
    
    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ success: false, error: 'Failed to download file' });
  }
});

// GET /api/v1/files - Get list of files
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filesCollection = await getCollection('files');
    const { limit = 50, offset = 0 } = req.query;
    
    const files = await filesCollection
      .find({ status: 'active' })
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();
    
    res.json({
      success: true,
      data: files.map(file => ({
        id: file._id.toString(),
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch files' });
  }
});

// DELETE /api/v1/files/:fileId - Delete a file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const filesCollection = await getCollection('files');
    
    const file = await filesCollection.findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Delete file from disk
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.warn('Could not delete file from disk:', error);
    }
    
    // Mark as deleted in database
    await filesCollection.updateOne(
      { _id: fileId },
      { $set: { status: 'deleted', deletedAt: new Date() } }
    );
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

module.exports = router;
