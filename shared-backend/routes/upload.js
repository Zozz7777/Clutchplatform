const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');

// POST /api/v1/upload
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ success: false, error: 'NO_FILE_UPLOADED', message: 'No file was uploaded' });
		}

		// Validate file size (10MB limit)
		const maxSize = 10 * 1024 * 1024;
		if (req.file.size > maxSize) {
			return res.status(400).json({ success: false, error: 'FILE_TOO_LARGE', message: 'File size exceeds 10MB limit' });
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
		if (!allowedTypes.includes(req.file.mimetype)) {
			return res.status(400).json({ success: false, error: 'INVALID_FILE_TYPE', message: 'File type not allowed' });
		}

		const folderPath = 'uploads';
		const metadata = { contentType: req.file.mimetype, uploadedBy: req.user.userId };
		const result = await fileService.uploadFile(req.file.buffer, req.file.originalname, folderPath, metadata);

		if (!result.success) {
			return res.status(500).json({ success: false, error: 'FILE_UPLOAD_FAILED', message: 'Failed to upload file to Firebase Storage.' });
		}

		return res.json({ success: true, message: 'File uploaded successfully', data: result });
	} catch (error) {
		console.error('Upload error:', error);
		return res.status(500).json({ success: false, error: 'FILE_UPLOAD_FAILED', message: 'Unexpected error during upload' });
	}
});

module.exports = router;
