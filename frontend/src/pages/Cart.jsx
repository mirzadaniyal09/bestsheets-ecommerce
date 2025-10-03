import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../store/CartContext';
import { AuthContext } from '../store/AuthContext';
import { formatPriceWithDecimals } from '../utils/currency';

const Cart = () => {
    const { cartItems, cartTotal, cartItemsCount, updateQuantity, removeFromCart, loading } = useContext(CartContext);
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [updating, setUpdating] = useState({});

    // If not authenticated, show login message
    if (!isAuthenticated) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="text-center">
                            <h2>Please Login to View Cart</h2>
                            <p className="text-muted mb-4">You need to be logged in to access your shopping cart.</p>
                            <Link to="/login" className="btn btn-primary">
                                Login Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle quantity update
    const handleQuantityUpdate = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        // Find the cart item to check stock
        const cartItem = cartItems.find(item => item.product._id === productId);
        if (cartItem && newQuantity > cartItem.product.countInStock) {
            alert(`Cannot set quantity to ${newQuantity}. Only ${cartItem.product.countInStock} items available in stock.`);
            return;
        }

        try {
            setUpdating(prev => ({ ...prev, [productId]: true }));
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            alert(error.response?.data?.message || 'Failed to update quantity. Please try again.');
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Handle item removal
    const handleRemoveItem = async (productId) => {
        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
            try {
                await removeFromCart(productId);
            } catch (error) {
                console.error('Failed to remove item:', error);
                alert('Failed to remove item. Please try again.');
            }
        }
    };

    // If cart is empty
    if (!loading && cartItems.length === 0) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="text-center">
                            <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                            <h2>Your Cart is Empty</h2>
                            <p className="text-muted mb-4">Looks like you haven't added any bedsheets to your cart yet.</p>
                            <Link to="/" className="btn btn-primary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <h1 className="h2 mb-4">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Shopping Cart ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'})
                    </h1>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {/* Cart Items */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-body">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="row align-items-center border-bottom py-3">
                                        {/* Product Image */}
                                        <div className="col-md-2">
                                            <img
                                                src={item.product?.image || '/images/placeholder.jpg'}
                                                alt={item.product?.name}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '80px', objectFit: 'cover' }}
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="col-md-4">
                                            <h6 className="mb-1">
                                                <Link
                                                    to={`/products/${item.product?._id}`}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    {item.product?.name}
                                                </Link>
                                            </h6>
                                            <small className="text-muted">
                                                {item.product?.brand} | {item.product?.category}
                                            </small>
                                            <div className="mt-1">
                                                <small className="text-success">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    In Stock ({item.product?.countInStock} available)
                                                </small>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="col-md-3">
                                            <div className="input-group" style={{ maxWidth: '120px' }}>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    type="button"
                                                    onClick={() => handleQuantityUpdate(item.product._id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || updating[item.product._id]}
                                                >
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        if (value > 0) {
                                                            handleQuantityUpdate(item.product._id, value);
                                                        }
                                                    }}
                                                    min="1"
                                                    max={item.product?.countInStock}
                                                    disabled={updating[item.product._id]}
                                                />
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    type="button"
                                                    onClick={() => handleQuantityUpdate(item.product._id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product?.countInStock || updating[item.product._id]}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            {updating[item.product._id] && (
                                                <small className="text-muted">
                                                    <i className="fas fa-spinner fa-spin me-1"></i>
                                                    Updating...
                                                </small>
                                            )}
                                        </div>

                                        {/* Price & Remove */}
                                        <div className="col-md-3 text-end">
                                            <div className="mb-2">
                                                <strong>{formatPriceWithDecimals(item.price * item.quantity)}</strong>
                                                <br />
                                                <small className="text-muted">{formatPriceWithDecimals(item.price)} each</small>
                                            </div>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleRemoveItem(item.product._id)}
                                                title="Remove item"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-3">
                            <Link to="/" className="btn btn-outline-primary">
                                <i className="fas fa-arrow-left me-2"></i>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal ({cartItemsCount} items):</span>
                                    <span>{formatPriceWithDecimals(cartTotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping:</span>
                                    <span className="text-success">FREE</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tax (estimated):</span>
                                    <span>{formatPriceWithDecimals(cartTotal * 0.08)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Total:</strong>
                                    <strong>{formatPriceWithDecimals(cartTotal + (cartTotal * 0.08))}</strong>
                                </div>

                                <button
                                    className="btn btn-primary w-100 mb-2"
                                    onClick={() => navigate('/checkout')}
                                    disabled={cartItems.length === 0}
                                >
                                    <i className="fas fa-credit-card me-2"></i>
                                    Proceed to Checkout
                                </button>

                                <div className="text-center">
                                    <small className="text-muted">
                                        <i className="fas fa-shield-alt me-1"></i>
                                        Secure checkout with SSL encryption
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="card mt-3">
                            <div className="card-body">
                                <h6 className="card-title">We Accept</h6>
                                <div className="d-flex gap-2">
                                    <i className="fab fa-cc-visa fa-2x text-primary"></i>
                                    <i className="fab fa-cc-mastercard fa-2x text-warning"></i>
                                    <i className="fab fa-cc-amex fa-2x text-info"></i>
                                    <i className="fab fa-cc-paypal fa-2x text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;