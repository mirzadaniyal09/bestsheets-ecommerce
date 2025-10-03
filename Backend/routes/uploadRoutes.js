const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../services/imageService');
const { protect, admin } = require('../middleware/auth');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private/Admin
router.post('/single', protect, admin, uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', protect, admin, uploadMultiple('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      message: 'Images uploaded successfully',
      images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;