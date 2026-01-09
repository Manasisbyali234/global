const express = require('express');
const multer = require('multer');
const path = require('path');

// Test the gallery upload functionality
const app = express();

// Memory storage for testing
const storage = multer.memoryStorage();

const uploadGallery = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed for gallery'), false);
    }
  },
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB limit per image for gallery
    files: 10 // Allow up to 10 files for gallery
  }
});

// Test endpoint
app.post('/test-gallery', uploadGallery.array('gallery', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    console.log(`Received ${req.files.length} files:`);
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        buffer: `${file.buffer.length} bytes`
      });
    });

    // Simulate processing files (convert to base64)
    const processedFiles = req.files.map(file => ({
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      fileName: file.originalname,
      uploadedAt: new Date()
    }));

    res.json({
      success: true,
      message: `Successfully processed ${req.files.length} files`,
      gallery: processedFiles
    });
  } catch (error) {
    console.error('Gallery upload test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 2MB per image.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Too many files. Maximum 10 images allowed.' 
      });
    }
  }
  res.status(500).json({ success: false, message: error.message });
});

console.log('Gallery upload test configuration:');
console.log('- Max files: 10');
console.log('- Max file size: 2MB per image');
console.log('- Allowed types: image/*');
console.log('- Storage: Memory (for testing)');
console.log('\nMultiple file upload functionality is ready!');

module.exports = { uploadGallery };