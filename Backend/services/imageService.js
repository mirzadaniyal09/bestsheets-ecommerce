const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bedsheet-store',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
    ],
  },
});

const upload = multer({ storage });

// Upload single image
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Upload multiple images
const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Get optimized image URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto:good',
    format: 'auto',
  };

  const finalOptions = { ...defaultOptions, ...options };

  return cloudinary.url(publicId, finalOptions);
};

// Transform image for different sizes
const getImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150 }),
    medium: getOptimizedUrl(publicId, { width: 400, height: 300 }),
    large: getOptimizedUrl(publicId, { width: 800, height: 600 }),
    original: cloudinary.url(publicId),
  };
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  deleteImage,
  getOptimizedUrl,
  getImageVariants,
};