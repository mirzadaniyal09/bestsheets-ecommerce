const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Upload route for images
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve uploads first
  app.use('/uploads', express.static('uploads'));

  // Serve the frontend static files
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing for non-API routes
  app.get('*', (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Bedsheet Store API is running...',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        users: '/api/users',
        cart: '/api/cart',
        orders: '/api/orders',
        admin: '/api/admin',
        messages: '/api/messages',
      },
    });
  });
}

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

