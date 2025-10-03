import React, { useContext } from 'react';
import { CartContext } from '../store/CartContext';
import { Link } from 'react-router-dom';
import { formatPriceWithDecimals } from '../utils/currency';

const CartDrawer = ({ show, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        ></div>
      )}

      {/* Cart Drawer */}
      <div
        className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg ${show ? 'translate-middle-x-0' : 'translate-middle-x-100'
          }`}
        style={{
          width: '400px',
          zIndex: 1050,
          transform: show ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Shopping Cart</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>

        {/* Cart Content */}
        <div className="flex-fill overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p className="text-muted">Your cart is empty</p>
              <Link to="/" className="btn btn-primary" onClick={onClose}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="p-3">
              {cartItems.map((item) => (
                <div key={item.product._id} className="card mb-3">
                  <div className="row g-0">
                    <div className="col-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="img-fluid rounded-start"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-8">
                      <div className="card-body p-2">
                        <h6 className="card-title mb-1">
                          {item.product.name}
                        </h6>
                        <p className="card-text small text-muted mb-2">
                          {formatPriceWithDecimals(item.product.price)}
                        </p>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="input-group input-group-sm" style={{ width: '100px' }}>
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.product._id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={item.quantity}
                              min="1"
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product._id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.product._id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFromCart(item.product._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-3 border-top bg-light">
            <div className="d-flex justify-content-between mb-2">
              <strong>Total: {formatPriceWithDecimals(cartTotal)}</strong>
            </div>
            <div className="d-grid gap-2">
              <Link
                to="/cart"
                className="btn btn-outline-primary"
                onClick={onClose}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                className="btn btn-primary"
                onClick={onClose}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;