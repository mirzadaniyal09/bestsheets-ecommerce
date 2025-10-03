import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { CartContext } from '../store/CartContext';
import SearchWidget from './SearchWidget';

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cartItemsCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categories = [
    'Cotton',
    'Silk',
    'Linen',
    'Microfiber',
    'Bamboo',
    'Polyester'
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-bed me-2"></i>
          BedSheet Store
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${showMobileMenu ? 'show' : ''}`}>
          {/* Search Bar */}
          <div className="mx-auto" style={{ maxWidth: '400px' }}>
            <SearchWidget />
          </div>

          <ul className="navbar-nav ms-auto">
            {/* Categories Dropdown */}
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-light"
                type="button"
                data-bs-toggle="dropdown"
                style={{ border: 'none', textDecoration: 'none' }}
              >
                Categories
              </button>
              <ul className="dropdown-menu">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      className="dropdown-item"
                      to={`/category/${category.toLowerCase()}`}
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Cart */}
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/cart">
                <i className="fas fa-shopping-cart"></i>
                <span className="ms-1 d-none d-lg-inline">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </li>

            {/* User Menu */}
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link text-light"
                  type="button"
                  data-bs-toggle="dropdown"
                  style={{ border: 'none', textDecoration: 'none' }}
                >
                  <i className="fas fa-user me-1"></i>
                  {user.name}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-user me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      <i className="fas fa-list me-2"></i>
                      My Orders
                    </Link>
                  </li>
                  {user.isAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          <i className="fas fa-cog me-2"></i>
                          Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="fas fa-user-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;