const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const passport = require('passport');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Middleware to check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin or moderator role required.' });
};

// Upload single file
router.post('/upload', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { folder = 'xaab-uploads', public_id, transformation } = req.body;

    // Configure upload options
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    // Add transformations for images
    if (req.file.mimetype.startsWith('image/') && transformation) {
      uploadOptions.transformation = transformation;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return res.status(500).json({ 
            message: 'Error uploading file to Cloudinary', 
            error: error.message 
          });
        }

        res.json({
          message: 'File uploaded successfully',
          file: {
            id: result.public_id,
            url: result.secure_url,
            originalName: req.file.originalname,
            size: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
            folder: result.folder,
            createdAt: result.created_at
          }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { folder = 'xaab-uploads' } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });

        uploadedFiles.push({
          id: result.public_id,
          url: result.secure_url,
          originalName: file.originalname,
          size: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
          folder: result.folder,
          createdAt: result.created_at
        });
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
      }
    }

    res.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

// Get files from Cloudinary
router.get('/files', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { 
      folder = 'xaab-uploads', 
      type = 'upload', 
      max_results = 50,
      next_cursor
    } = req.query;

    const result = await cloudinary.api.resources({
      type: type,
      prefix: folder,
      max_results: parseInt(max_results),
      next_cursor: next_cursor
    });

    res.json({
      resources: result.resources,
      next_cursor: result.next_cursor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
});

// Delete file from Cloudinary
router.delete('/:publicId', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resource_type = 'image' } = req.query;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type
    });

    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

// Generate image transformations
router.post('/transform', async (req, res) => {
  try {
    const { publicId, transformations } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const url = cloudinary.url(publicId, {
      ...transformations,
      secure: true
    });

    res.json({
      url: url,
      publicId: publicId,
      transformations: transformations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating transformation', error: error.message });
  }
});

// Get media statistics
router.get('/stats', passport.authenticate('jwt', { session: false }), requireAdminOrModerator, async (req, res) => {
  try {
    const { folder = 'xaab-uploads' } = req.query;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500
    });

    const totalFiles = result.resources.length;
    const totalSize = result.resources.reduce((sum, file) => sum + file.bytes, 0);
    
    const filesByFormat = result.resources.reduce((acc, file) => {
      acc[file.format] = (acc[file.format] || 0) + 1;
      return acc;
    }, {});

    const recentFiles = result.resources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    res.json({
      totalFiles,
      totalSize,
      filesByFormat,
      recentFiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media statistics', error: error.message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message === 'Only images and documents are allowed') {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: 'File upload error', error: error.message });
});

module.exports = router;
