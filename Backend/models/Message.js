const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        enum: {
            values: ['product-inquiry', 'order-status', 'return-exchange', 'bulk-order', 'other'],
            message: 'Please select a valid subject'
        }
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    adminReply: {
        type: String,
        trim: true,
        maxlength: [1000, 'Reply cannot exceed 1000 characters']
    },
    repliedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ isRead: 1, createdAt: -1 });
messageSchema.index({ email: 1 });

module.exports = mongoose.model('Message', messageSchema);