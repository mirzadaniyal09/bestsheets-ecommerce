const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
router.get('/', protect, getCart);

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, addToCart);

// @desc    Update cart item
// @route   PUT /api/cart
// @access  Private
router.put('/', protect, updateCartItem);

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, removeFromCart);

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, clearCart);

module.exports = router;