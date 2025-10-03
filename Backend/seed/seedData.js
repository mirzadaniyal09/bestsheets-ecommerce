const products = [
  {
    name: 'Luxury Egyptian Cotton Sheet Set',
    image: '/images/cotton-sheets.jpg',
    description: 'Premium 1000 thread count Egyptian cotton sheets for ultimate comfort and luxury.',
    brand: 'LuxurySleep',
    category: 'Cotton',
    price: 299.99,
    countInStock: 25,
    rating: 4.8,
    numReviews: 142,
    material: '100% Egyptian Cotton',
    threadCount: 1000,
    sizes: ['Queen', 'King', 'California King'],
    colors: [
      { name: 'White', hexCode: '#FFFFFF' },
      { name: 'Cream', hexCode: '#F5F5DC' },
      { name: 'Navy', hexCode: '#000080' }
    ],
    features: ['Hypoallergenic', 'Deep Pocket', 'Wrinkle Resistant'],
    slug: 'luxury-egyptian-cotton-sheet-set',
  },
  {
    name: 'Organic Bamboo Comfort Sheets',
    image: '/images/bamboo-sheets.jpg',
    description: 'Eco-friendly bamboo fiber sheets that are naturally antimicrobial and temperature regulating.',
    brand: 'EcoSleep',
    category: 'Bamboo',
    price: 199.99,
    countInStock: 30,
    rating: 4.6,
    numReviews: 89,
    material: '100% Bamboo Fiber',
    threadCount: 400,
    sizes: ['Full', 'Queen', 'King'],
    colors: [
      { name: 'Natural', hexCode: '#F5F5DC' },
      { name: 'Sage Green', hexCode: '#87A96B' }
    ],
    features: ['Temperature Regulating', 'Antimicrobial', 'Moisture Wicking'],
    slug: 'organic-bamboo-comfort-sheets',
  },
  {
    name: 'Mulberry Silk Sheet Set',
    image: '/images/silk-sheets.jpg',
    description: 'Pure mulberry silk sheets for the ultimate in luxury and skin-friendly sleeping.',
    brand: 'SilkDreams',
    category: 'Silk',
    price: 449.99,
    countInStock: 15,
    rating: 4.9,
    numReviews: 67,
    material: '100% Mulberry Silk',
    threadCount: 600,
    sizes: ['Queen', 'King'],
    colors: [
      { name: 'Champagne', hexCode: '#F7E7CE' },
      { name: 'Ivory', hexCode: '#FFFFF0' },
      { name: 'Charcoal', hexCode: '#36454F' }
    ],
    features: ['Hypoallergenic', 'Temperature Regulating', 'Anti-Aging'],
    slug: 'mulberry-silk-sheet-set',
  },
  {
    name: 'French Linen Sheet Set',
    image: '/images/linen-sheets.jpg',
    description: 'Relaxed and breathable French linen sheets perfect for a casual, comfortable bedroom.',
    brand: 'CasualComfort',
    category: 'Linen',
    price: 179.99,
    countInStock: 40,
    rating: 4.4,
    numReviews: 156,
    material: '100% French Linen',
    threadCount: 200,
    sizes: ['Twin', 'Full', 'Queen', 'King'],
    colors: [
      { name: 'Natural Flax', hexCode: '#E6D690' },
      { name: 'Stone Gray', hexCode: '#928E85' },
      { name: 'Dusty Rose', hexCode: '#DCAE96' }
    ],
    features: ['Breathable', 'Gets Softer Over Time', 'Easy Care'],
    slug: 'french-linen-sheet-set',
  },
  {
    name: 'Cooling Microfiber Sheet Set',
    image: '/images/microfiber-sheets.jpg',
    description: 'Affordable and durable microfiber sheets with cooling technology for hot sleepers.',
    brand: 'CoolSleep',
    category: 'Microfiber',
    price: 89.99,
    countInStock: 50,
    rating: 4.2,
    numReviews: 203,
    material: '100% Brushed Microfiber',
    threadCount: 1800,
    sizes: ['Twin', 'Full', 'Queen', 'King', 'California King'],
    colors: [
      { name: 'White', hexCode: '#FFFFFF' },
      { name: 'Light Blue', hexCode: '#ADD8E6' },
      { name: 'Gray', hexCode: '#808080' }
    ],
    features: ['Wrinkle Resistant', 'Fade Resistant', 'Machine Washable'],
    slug: 'cooling-microfiber-sheet-set',
  },
  {
    name: 'Premium Percale Cotton Sheets',
    image: '/images/percale-sheets.jpg',
    description: 'Crisp and cool percale weave cotton sheets for a hotel-like sleeping experience.',
    brand: 'HotelLux',
    category: 'Cotton',
    price: 159.99,
    countInStock: 35,
    rating: 4.5,
    numReviews: 98,
    material: '100% Long-Staple Cotton',
    threadCount: 400,
    sizes: ['Queen', 'King'],
    colors: [
      { name: 'Classic White', hexCode: '#FFFFFF' },
      { name: 'Soft Gray', hexCode: '#D3D3D3' }
    ],
    features: ['Breathable', 'Crisp Feel', 'Easy Care'],
    slug: 'premium-percale-cotton-sheets',
  },
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@bedsheetstore.com',
    password: 'admin123',
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
    isAdmin: false,
  },
];

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bedsheetstore');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared');

    // Hash passwords for users
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`${createdUsers.length} users imported successfully`);

    // Get the admin user to assign as owner of products
    const adminUser = createdUsers.find(user => user.isAdmin);

    // Add user field to products
    const productsWithUser = products.map(product => ({
      ...product,
      user: adminUser._id,
    }));

    // Insert products
    const createdProducts = await Product.insertMany(productsWithUser);
    console.log(`${createdProducts.length} products imported successfully`);

    console.log('Data import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('All data destroyed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error destroying data:', error.message);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}