import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { CartContext } from '../store/CartContext';
import { orderAPI } from '../api';
import { formatPrice, formatPriceWithDecimals } from '../utils/currency';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reorderLoading, setReorderLoading] = useState(null);
    const { isAuthenticated, user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchOrders();
        }
    }, [isAuthenticated, user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getUserOrders();
            setOrders(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (order) => {
        try {
            setReorderLoading(order._id);

            // Add all items from the order to cart
            for (const item of order.orderItems) {
                await addToCart({
                    productId: item.product,
                    quantity: item.qty,
                    size: item.size,
                    color: item.color,
                });
            }

            alert('All items from this order have been added to your cart!');
        } catch (error) {
            console.error('Error reordering:', error);
            alert('Failed to reorder some items. Please try adding them manually.');
        } finally {
            setReorderLoading(null);
        }
    };

    // If not authenticated, show login message
    if (!isAuthenticated) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="text-center">
                            <h2>Please Login to View Orders</h2>
                            <p className="text-muted mb-4">You need to be logged in to access your order history.</p>
                            <Link to="/login" className="btn btn-primary">
                                Login Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading orders...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={fetchOrders}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty orders state
    if (orders.length === 0) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="text-center">
                            <i className="fas fa-shopping-bag fa-4x text-muted mb-3"></i>
                            <h2>No Orders Yet</h2>
                            <p className="text-muted mb-4">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                            <Link to="/" className="btn btn-primary">
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-warning';
            case 'processing':
                return 'bg-info';
            case 'shipped':
                return 'bg-primary';
            case 'delivered':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h2">
                            <i className="fas fa-shopping-bag me-2"></i>
                            My Orders ({orders.length})
                        </h1>
                        <Link to="/" className="btn btn-outline-primary">
                            <i className="fas fa-plus me-2"></i>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    {orders.map((order) => (
                        <div key={order._id} className="card mb-3">
                            <div className="card-header">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <h6 className="mb-0">
                                            Order #{order._id?.slice(-8).toUpperCase()}
                                        </h6>
                                        <small className="text-muted">
                                            Placed on {formatDate(order.createdAt)}
                                        </small>
                                    </div>
                                    <div className="col-md-6 text-md-end">
                                        <span className={`badge ${getStatusBadgeClass(order.status)} me-2`}>
                                            {order.status || 'pending'}
                                        </span>
                                        <strong>{formatPriceWithDecimals(order.totalPrice)}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Order Items */}
                                    <div className="col-md-8">
                                        <h6 className="mb-3">Order Items</h6>
                                        {order.orderItems?.map((item, index) => (
                                            <div key={index} className="d-flex align-items-center mb-2">
                                                <img
                                                    src={item.image || '/images/placeholder.jpg'}
                                                    alt={item.name}
                                                    className="rounded me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">{item.name}</div>
                                                    <small className="text-muted">
                                                        Qty: {item.qty} × {formatPrice(item.price)} = {formatPriceWithDecimals(item.qty * item.price)}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Details */}
                                    <div className="col-md-4">
                                        <h6 className="mb-3">Order Summary</h6>
                                        <div className="small mb-2">
                                            <div className="d-flex justify-content-between">
                                                <span>Subtotal:</span>
                                                <span>{formatPriceWithDecimals(order.itemsPrice)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Shipping:</span>
                                                <span>{formatPriceWithDecimals(order.shippingPrice || 0)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Tax:</span>
                                                <span>{formatPriceWithDecimals(order.taxPrice || 0)}</span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between fw-bold">
                                                <span>Total:</span>
                                                <span>{formatPriceWithDecimals(order.totalPrice)}</span>
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shippingAddress && (
                                            <div className="mt-3">
                                                <h6 className="small">Shipping Address:</h6>
                                                <div className="small text-muted">
                                                    {order.shippingAddress.address}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                                    {order.shippingAddress.country}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="border-top pt-3 mt-3">
                                    <div className="d-flex gap-2">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="fas fa-eye me-1"></i>
                                            View Details
                                        </Link>

                                        {order.status?.toLowerCase() === 'pending' && (
                                            <button className="btn btn-outline-danger btn-sm">
                                                <i className="fas fa-times me-1"></i>
                                                Cancel Order
                                            </button>
                                        )}

                                        {order.status?.toLowerCase() === 'delivered' && (
                                            <button
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => handleReorder(order)}
                                                disabled={reorderLoading === order._id}
                                            >
                                                {reorderLoading === order._id ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                        Reordering...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-redo me-1"></i>
                                                        Reorder
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination would go here if needed */}
            {orders.length > 10 && (
                <div className="row mt-4">
                    <div className="col-12">
                        <nav aria-label="Orders pagination">
                            <ul className="pagination justify-content-center">
                                <li className="page-item disabled">
                                    <span className="page-link">Previous</span>
                                </li>
                                <li className="page-item active">
                                    <span className="page-link">1</span>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link">Next</span>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;