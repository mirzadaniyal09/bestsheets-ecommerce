import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import SearchResults from './pages/SearchResults';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-dark text-light py-4 mt-5">
              <div className="container">
                <div className="row">
                  <div className="col-md-6">
                    <h5>Bedsheet Store</h5>
                    <p className="small">
                      Premium quality bedsheets for better sleep and comfort.
                    </p>
                  </div>
                  <div className="col-md-3">
                    <h6>Quick Links</h6>
                    <ul className="list-unstyled">
                      <li><a href="/" className="text-light text-decoration-none">Home</a></li>
                      <li><a href="/products" className="text-light text-decoration-none">Products</a></li>
                      <li><a href="/contact" className="text-light text-decoration-none">Contact Us</a></li>
                    </ul>
                  </div>
                  <div className="col-md-3">
                    <h6>Categories</h6>
                    <ul className="list-unstyled">
                      <li><a href="/category/cotton" className="text-light text-decoration-none">Cotton</a></li>
                      <li><a href="/category/silk" className="text-light text-decoration-none">Silk</a></li>
                      <li><a href="/category/linen" className="text-light text-decoration-none">Linen</a></li>
                      <li><a href="/category/bamboo" className="text-light text-decoration-none">Bamboo</a></li>
                    </ul>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-12 text-center">
                    <small>&copy; 2025 Bedsheet Store. All rights reserved.</small>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;