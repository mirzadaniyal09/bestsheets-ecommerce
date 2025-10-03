const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserOrders,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', protect, getUserOrders);

module.exports = router;