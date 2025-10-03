const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createProductReview,
  getProductReviews,
  canUserReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', getProducts);

// @desc    Fetch products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', getProductsByCategory);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProductById);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, createProduct);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateProduct);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteProduct);

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, createProductReview);

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', getProductReviews);

// @desc    Check if user can review product
// @route   GET /api/products/:id/can-review
// @access  Private
router.get('/:id/can-review', protect, canUserReview);

module.exports = router;