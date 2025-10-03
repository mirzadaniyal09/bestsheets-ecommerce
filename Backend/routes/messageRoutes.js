const express = require('express');
const {
    createMessage,
    getMessages,
    markAsRead,
    deleteMessage
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public route - Anyone can send a message
router.post('/', createMessage);

// Admin routes - Require authentication and admin privileges
router.get('/', protect, admin, getMessages);
router.put('/:id/read', protect, admin, markAsRead);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;