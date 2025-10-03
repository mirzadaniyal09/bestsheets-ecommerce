# Bedsheet Store

A full-stack e-commerce application for selling premium bedsheets and bedding accessories. Built with Node.js, Express, MongoDB, and React.

## 🛏️ Features

### Customer Features
- **Product Browsing**: Browse bedsheets by category (Cotton, Silk, Linen, Bamboo, etc.)
- **Product Search**: Search products by name, brand, or material
- **Product Details**: View detailed product information, images, and reviews
- **Shopping Cart**: Add products to cart, update quantities, and manage items
- **User Authentication**: Register, login, and manage user profiles
- **Secure Checkout**: Multiple payment options (Stripe, PayPal)
- **Order Tracking**: View order history and track shipments
- **Product Reviews**: Rate and review purchased products

### Admin Features
- **Dashboard**: Overview of sales, orders, and user statistics
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts
- **Inventory Tracking**: Monitor stock levels

### Technical Features
- **Responsive Design**: Mobile-first, fully responsive UI
- **Image Management**: Cloud-based image storage with Cloudinary
- **Email Notifications**: Automated emails for orders and account updates
- **Security**: JWT authentication, password hashing, input validation
- **API Documentation**: RESTful API with comprehensive endpoints

## 🚀 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Stripe** - Payment processing
- **PayPal** - Alternative payment method
- **SendGrid** - Email service
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Context API** - State management
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
bedsheet-store/
├─ backend/
│  ├─ config/
│  │  └─ db.js                 # Database connection
│  ├─ controllers/             # Route controllers
│  │  ├─ authController.js
│  │  ├─ productController.js
│  │  ├─ userController.js
│  │  ├─ cartController.js
│  │  ├─ orderController.js
│  │  ├─ adminController.js
│  │  └─ reviewController.js
│  ├─ models/                  # Database models
│  │  ├─ User.js
│  │  ├─ Product.js
│  │  ├─ Order.js
│  │  ├─ Cart.js
│  │  └─ Review.js
│  ├─ routes/                  # API routes
│  │  ├─ authRoutes.js
│  │  ├─ productRoutes.js
│  │  ├─ userRoutes.js
│  │  ├─ cartRoutes.js
│  │  ├─ orderRoutes.js
│  │  └─ adminRoutes.js
│  ├─ services/                # External services
│  │  ├─ imageService.js       # Cloudinary integration
│  │  ├─ paymentService.js     # Stripe/PayPal
│  │  └─ emailService.js       # SendGrid/SMTP
│  ├─ middleware/              # Custom middleware
│  │  ├─ auth.js
│  │  ├─ admin.js
│  │  ├─ errorHandler.js
│  │  └─ validate.js
│  ├─ utils/                   # Utility functions
│  │  ├─ paginator.js
│  │  └─ slugify.js
│  ├─ seed/                    # Database seeding
│  │  └─ seedData.js
│  ├─ server.js               # Main server file
│  └─ .env                    # Environment variables
│
├─ frontend/
│  ├─ public/
│  │  ├─ index.html
│  │  └─ manifest.json
│  ├─ src/
│  │  ├─ api/                  # API helpers
│  │  │  ├─ api.js
│  │  │  └─ index.js
│  │  ├─ components/           # Reusable components
│  │  │  ├─ ProductCard.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ SearchWidget.jsx
│  │  │  ├─ CartDrawer.jsx
│  │  │  └─ Rating.jsx
│  │  ├─ pages/                # Page components
│  │  │  ├─ Home.jsx
│  │  │  ├─ ProductPage.jsx
│  │  │  ├─ CategoryPage.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ Checkout.jsx
│  │  │  ├─ OrderSuccess.jsx
│  │  │  ├─ Profile.jsx
│  │  │  └─ Admin/             # Admin pages
│  │  ├─ store/                # State management
│  │  │  ├─ AuthContext.js
│  │  │  └─ CartContext.js
│  │  ├─ App.jsx
│  │  ├─ App.css
│  │  └─ index.jsx
│  └─ package.json
│
├─ docker-compose.yml
├─ README.md
└─ .gitignore
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bedsheet-store
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables in .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   # Make sure MongoDB is running
   cd backend
   npm run seed  # Optional: seed with sample data
   ```

### Docker Setup

1. **Using Docker Compose**
   ```bash
   # Create environment file
   cp .env.example .env
   # Configure your environment variables
   
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop all services
   docker-compose down
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bedsheet-store
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@bedsheetstore.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Product Endpoints
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/myorders` - Get user orders
- `PUT /api/orders/:id/pay` - Update order payment status

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Prepare production environment**
   ```bash
   # Update environment variables for production
   cp .env.production .env
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Backend Deployment**
   ```bash
   cd backend
   npm install --production
   npm run build
   npm start
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve the build folder with a static server
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@bedsheetstore.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues](https://github.com/username/bedsheet-store/issues)

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the CSS framework
- [Font Awesome](https://fontawesome.com/) for icons
- [Cloudinary](https://cloudinary.com/) for image management
- [Stripe](https://stripe.com/) for payment processing
- [SendGrid](https://sendgrid.com/) for email services