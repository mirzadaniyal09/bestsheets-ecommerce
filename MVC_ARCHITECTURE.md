# BestSheets E-commerce Website - Complete MVC Architecture

## 📋 Table of Contents
- [Overview](#overview)
- [Models (Backend Data Layer)](#models-backend-data-layer)
- [Views (Frontend React Components)](#views-frontend-react-components)
- [Controllers (Backend Logic Layer)](#controllers-backend-logic-layer)
- [Routes & API Endpoints](#routes--api-endpoints)
- [Middleware & Services](#middleware--services)
- [Database Schema](#database-schema)
- [Frontend State Management](#frontend-state-management)
- [API Integration Layer](#api-integration-layer)

---

## 🏗️ Overview

**BestSheets** is a full-stack e-commerce application built with:
- **Frontend**: React.js with Context API for state management
- **Backend**: Node.js + Express.js RESTful API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: MVC (Model-View-Controller) pattern

---

## 🗃️ Models (Backend Data Layer)

### 1. **User Model** (`/Backend/models/User.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  isAdmin: Boolean (default: false),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Product Model** (`/Backend/models/Product.js`)
```javascript
{
  user: ObjectId (ref: 'User', required), // Product creator/admin
  name: String (required),
  image: String (required),
  images: [String], // Multiple product images
  brand: String (required),
  category: String (required, enum: ['Cotton', 'Silk', 'Linen', 'Microfiber', 'Bamboo', 'Polyester']),
  description: String (required),
  reviews: [reviewSchema],
  rating: Number (default: 0),
  numReviews: Number (default: 0),
  price: Number (required, default: 0),
  countInStock: Number (required, default: 0),
  sizes: [String] (enum: ['Twin', 'Full', 'Queen', 'King', 'California King']),
  colors: [{
    name: String,
    hexCode: String
  }],
  material: String (required),
  threadCount: Number,
  care: String (default: 'Machine wash cold, tumble dry low'),
  features: [String], // ['Hypoallergenic', 'Wrinkle-resistant', etc.]
  slug: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **Order Model** (`/Backend/models/Order.js`)
```javascript
{
  user: ObjectId (ref: 'User', required),
  orderItems: [{
    name: String (required),
    qty: Number (required),
    image: String (required),
    price: Number (required),
    product: ObjectId (ref: 'Product', required)
  }],
  shippingAddress: {
    address: String (required),
    city: String (required),
    postalCode: String (required),
    country: String (required)
  },
  paymentMethod: String (required),
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: Number (default: 0.0),
  shippingPrice: Number (default: 0.0),
  totalPrice: Number (default: 0.0),
  isPaid: Boolean (default: false),
  paidAt: Date,
  isDelivered: Boolean (default: false),
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **Cart Model** (`/Backend/models/Cart.js`)
```javascript
{
  user: ObjectId (ref: 'User', required),
  items: [{
    product: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1),
    size: String,
    color: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **Review Model** (`/Backend/models/Review.js`)
```javascript
{
  name: String (required),
  rating: Number (required, 1-5),
  comment: String (required),
  user: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 👁️ Views (Frontend React Components)

### **Pages** (`/frontend/src/pages/`)

#### 1. **Home.jsx**
- Landing page with featured products
- Category browsing sections
- Hero banner and promotional content
- Product grid with filtering

#### 2. **ProductPage.jsx**
- Individual product details
- Image gallery with zoom
- Product specifications (material, thread count, sizes, colors)
- Customer reviews and ratings
- Add to cart functionality

#### 3. **CategoryPage.jsx**
- Products filtered by category
- Sorting and filtering options
- Pagination for product listings

#### 4. **Login.jsx & Register.jsx**
- User authentication forms
- Form validation and error handling
- JWT token management

#### 5. **Profile.jsx**
- User account management
- Order history
- Address and personal information updates

#### 6. **Checkout.jsx**
- Shopping cart review
- Shipping address form
- Payment method selection
- Order summary and confirmation

#### 7. **AdminDashboard.jsx**
- Complete admin panel with tabs:
  - Overview: Statistics and analytics
  - Products: CRUD operations for products
  - Add Product: Comprehensive product creation form
- Category-based product management
- Real-time inventory tracking

#### 8. **OrderSuccess.jsx**
- Order confirmation page
- Order details display
- Next steps information

### **Components** (`/frontend/src/components/`)

#### 1. **Navbar.jsx**
- Site navigation with authentication state
- Shopping cart icon with item count
- Admin access for authorized users
- Responsive mobile menu

#### 2. **ProductCard.jsx**
- Reusable product display card
- Product image with error handling
- Price, rating, and stock status
- Quick action buttons

#### 3. **CartDrawer.jsx**
- Sliding cart sidebar
- Item quantity management
- Remove items functionality
- Checkout navigation

#### 4. **Rating.jsx**
- Star rating display component
- Interactive rating input for reviews
- Average rating calculations

#### 5. **SearchWidget.jsx**
- Product search functionality
- Real-time search suggestions
- Category filtering integration

---

## 🎛️ Controllers (Backend Logic Layer)

### 1. **Authentication Controller** (`/Backend/controllers/authController.js`)
```javascript
// User registration and login
- registerUser(req, res)
- loginUser(req, res)
- getUserProfile(req, res)
- updateUserProfile(req, res)
- logoutUser(req, res)
```

### 2. **Product Controller** (`/Backend/controllers/productController.js`)
```javascript
// Product CRUD operations
- getProducts(req, res)          // Get paginated products
- getProductById(req, res)       // Get single product
- getProductsByCategory(req, res) // Get products by category
- createProduct(req, res)        // Admin: Create new product
- updateProduct(req, res)        // Admin: Update product
- deleteProduct(req, res)        // Admin: Delete product
```

### 3. **Cart Controller** (`/Backend/controllers/cartController.js`)
```javascript
// Shopping cart management
- getCart(req, res)             // Get user's cart
- addToCart(req, res)           // Add item to cart
- updateCartItem(req, res)      // Update item quantity
- removeFromCart(req, res)      // Remove item from cart
- clearCart(req, res)           // Empty cart
```

### 4. **Order Controller** (`/Backend/controllers/orderController.js`)
```javascript
// Order processing
- createOrder(req, res)         // Create new order
- getOrderById(req, res)        // Get order details
- getUserOrders(req, res)       // Get user's order history
- updateOrderToPaid(req, res)   // Mark order as paid
- updateOrderToDelivered(req, res) // Admin: Mark as delivered
- getAllOrders(req, res)        // Admin: Get all orders
```

### 5. **Review Controller** (`/Backend/controllers/reviewController.js`)
```javascript
// Product reviews
- createProductReview(req, res)  // Create product review
- getProductReviews(req, res)    // Get product reviews
- updateReview(req, res)         // Update user's review
- deleteReview(req, res)         // Delete review
```

### 6. **User Controller** (`/Backend/controllers/userController.js`)
```javascript
// User management
- getUsers(req, res)            // Admin: Get all users
- getUserById(req, res)         // Admin: Get user by ID
- updateUser(req, res)          // Admin: Update user
- deleteUser(req, res)          // Admin: Delete user
```

### 7. **Admin Controller** (`/Backend/controllers/adminController.js`)
```javascript
// Administrative functions
- getDashboardStats(req, res)   // Get dashboard statistics
- getOrderStatistics(req, res)  // Get order analytics
- getUserStatistics(req, res)   // Get user analytics
- getProductStatistics(req, res) // Get product analytics
```

---

## 🛣️ Routes & API Endpoints

### **Authentication Routes** (`/Backend/routes/authRoutes.js`)
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
GET    /api/auth/profile      - Get user profile (Protected)
PUT    /api/auth/profile      - Update user profile (Protected)
POST   /api/auth/logout       - User logout
```

### **Product Routes** (`/Backend/routes/productRoutes.js`)
```
GET    /api/products                    - Get all products (Public)
GET    /api/products/:id               - Get single product (Public)
GET    /api/products/category/:category - Get products by category (Public)
POST   /api/products                   - Create product (Admin)
PUT    /api/products/:id               - Update product (Admin)
DELETE /api/products/:id               - Delete product (Admin)
POST   /api/products/:id/reviews       - Create review (Protected)
GET    /api/products/:id/reviews       - Get product reviews (Public)
```

### **Cart Routes** (`/Backend/routes/cartRoutes.js`)
```
GET    /api/cart              - Get user cart (Protected)
POST   /api/cart              - Add to cart (Protected)
PUT    /api/cart              - Update cart item (Protected)
DELETE /api/cart/:productId   - Remove from cart (Protected)
DELETE /api/cart              - Clear cart (Protected)
```

### **Order Routes** (`/Backend/routes/orderRoutes.js`)
```
GET    /api/orders                 - Get all orders (Admin)
POST   /api/orders                 - Create order (Protected)
GET    /api/orders/myorders        - Get user orders (Protected)
GET    /api/orders/:id             - Get order by ID (Protected)
PUT    /api/orders/:id/pay         - Update order to paid (Protected)
PUT    /api/orders/:id/deliver     - Update order to delivered (Admin)
```

### **User Routes** (`/Backend/routes/userRoutes.js`)
```
GET    /api/users              - Get all users (Admin)
GET    /api/users/:id          - Get user by ID (Admin)
PUT    /api/users/:id          - Update user (Admin)
DELETE /api/users/:id          - Delete user (Admin)
GET    /api/users/profile      - Get user profile (Protected)
PUT    /api/users/profile      - Update user profile (Protected)
```

### **Admin Routes** (`/Backend/routes/adminRoutes.js`)
```
GET    /api/admin/dashboard    - Get dashboard stats (Admin)
GET    /api/admin/users        - Get all users (Admin)
GET    /api/admin/orders       - Get all orders (Admin)
GET    /api/admin/stats        - Get system statistics (Admin)
```

---

## ⚙️ Middleware & Services

### **Middleware** (`/Backend/middleware/`)

#### 1. **Authentication Middleware** (`auth.js`)
```javascript
- protect()     // Verify JWT token
- admin()       // Verify admin privileges
```

#### 2. **Error Handler** (`errorHandler.js`)
```javascript
- notFound()         // 404 error handler
- errorHandler()     // Global error handler
```

#### 3. **Validation Middleware** (`validate.js`)
```javascript
- validateProduct()  // Product data validation
- validateUser()     // User data validation
- validateOrder()    // Order data validation
```

### **Services** (`/Backend/services/`)

#### 1. **Email Service** (`emailService.js`)
- Order confirmation emails
- Password reset emails
- Welcome emails

#### 2. **Payment Service** (`paymentService.js`)
- Payment processing integration
- Transaction verification
- Refund handling

#### 3. **Image Service** (`imageService.js`)
- Image upload handling
- Image optimization
- Image storage management

### **Utilities** (`/Backend/utils/`)

#### 1. **Slugify** (`slugify.js`)
- URL-friendly string generation
- Product slug creation

#### 2. **Paginator** (`paginator.js`)
- Result pagination logic
- Page calculation utilities

---

## 🗄️ Database Schema

### **Collections in MongoDB:**
1. **users** - User accounts and profiles
2. **products** - Product catalog with details
3. **orders** - Customer orders and transactions
4. **carts** - User shopping carts
5. **reviews** - Product reviews and ratings (embedded in products)

### **Relationships:**
- User → Orders (One-to-Many)
- User → Cart (One-to-One)
- Product → Reviews (One-to-Many, embedded)
- Order → Products (Many-to-Many through orderItems)
- Cart → Products (Many-to-Many through items)

---

## 🔄 Frontend State Management

### **Context Providers** (`/frontend/src/store/`)

#### 1. **AuthContext.js**
```javascript
// Global authentication state
{
  user: Object,           // Current user data
  token: String,          // JWT authentication token
  isAuthenticated: Boolean,
  login: Function,        // Login action
  logout: Function,       // Logout action
  register: Function      // Registration action
}
```

#### 2. **CartContext.js**
```javascript
// Shopping cart state
{
  cartItems: Array,       // Cart items array
  cartCount: Number,      // Total items count
  cartTotal: Number,      // Total price
  addToCart: Function,    // Add item action
  removeFromCart: Function, // Remove item action
  updateQuantity: Function, // Update quantity action
  clearCart: Function     // Clear cart action
}
```

---

## 🔌 API Integration Layer

### **API Configuration** (`/frontend/src/api/`)

#### 1. **api.js** - Axios Configuration
```javascript
// Base API setup with interceptors
- Request interceptor: Adds JWT token
- Response interceptor: Handles authentication errors
- Base URL configuration
- Global error handling
```

#### 2. **index.js** - API Methods
```javascript
// Organized API calls by domain
- authAPI: Authentication endpoints
- productAPI: Product operations
- cartAPI: Cart management
- orderAPI: Order processing
- userAPI: User management
- adminAPI: Administrative functions
```

---

## 📱 Application Flow

### **User Journey:**
1. **Landing** → Home.jsx displays featured products
2. **Browse** → CategoryPage.jsx or ProductPage.jsx for details
3. **Shop** → Add items to cart via CartContext
4. **Authenticate** → Login.jsx or Register.jsx
5. **Checkout** → Checkout.jsx processes order
6. **Confirm** → OrderSuccess.jsx shows confirmation

### **Admin Journey:**
1. **Login** → Admin authentication via Login.jsx
2. **Dashboard** → AdminDashboard.jsx with overview
3. **Manage** → CRUD operations on products
4. **Monitor** → View statistics and analytics

---

## 🔧 Development Setup

### **Backend Dependencies:**
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables",
  "nodemon": "Development auto-restart"
}
```

### **Frontend Dependencies:**
```json
{
  "react": "UI library",
  "react-router-dom": "Client-side routing",
  "axios": "HTTP client",
  "bootstrap": "CSS framework",
  "react-scripts": "Build tools"
}
```

---

## 🚀 Deployment Architecture

### **Production Structure:**
- **Frontend**: React build served via static hosting
- **Backend**: Node.js API server
- **Database**: MongoDB Atlas or self-hosted
- **Images**: Local storage or CDN integration
- **Environment**: Separate dev/staging/production configs

---

