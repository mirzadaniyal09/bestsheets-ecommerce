import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { orderAPI } from '../api';
import { formatPriceWithDecimals } from '../utils/currency';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const orderStatuses = [
        { value: 'pending', label: 'Pending', color: 'warning' },
        { value: 'processing', label: 'Processing', color: 'info' },
        { value: 'shipped', label: 'Shipped', color: 'primary' },
        { value: 'delivered', label: 'Delivered', color: 'success' },
        { value: 'cancelled', label: 'Cancelled', color: 'danger' }
    ];

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getOrder(id);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            setStatusLoading(true);
            await orderAPI.updateOrderStatus(id, { status: newStatus });
            setOrder({ ...order, status: newStatus });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setStatusLoading(false);
        }
    };

    const cancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelLoading(true);
            await orderAPI.updateOrderStatus(id, { status: 'cancelled' });
            setOrder({ ...order, status: 'cancelled' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    const deleteOrder = async () => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        try {
            await orderAPI.deleteOrder(id);
            navigate(user?.isAdmin ? '/admin' : '/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete order');
        }
    };

    const getStatusBadge = (status) => {
        const statusInfo = orderStatuses.find(s => s.value === status);
        return statusInfo ? statusInfo : { label: status, color: 'secondary' };
    };

    const canEditOrder = () => {
        return order && (order.status === 'pending' || order.status === 'processing') &&
            (user?.isAdmin || order.user === user?._id);
    };

    const canCancelOrder = () => {
        return order && order.status !== 'cancelled' && order.status !== 'delivered' &&
            (user?.isAdmin || order.user === user?._id);
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
                <Link to={user?.isAdmin ? "/admin" : "/orders"} className="btn btn-primary">
                    Back to {user?.isAdmin ? "Dashboard" : "Orders"}
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 mb-1">Order #{order._id.slice(-8).toUpperCase()}</h1>
                            <p className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-end">
                            <span className={`badge bg-${getStatusBadge(order.status).color} fs-6 me-3`}>
                                {getStatusBadge(order.status).label}
                            </span>
                            <h4 className="text-primary mb-0">{formatPriceWithDecimals(order.totalPrice)}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-warning">{error}</div>
            )}

            <div className="row">
                {/* Order Items */}
                <div className="col-lg-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Order Items</h5>
                        </div>
                        <div className="card-body">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} className="row align-items-center border-bottom py-3">
                                    <div className="col-md-2">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="img-fluid rounded"
                                            style={{ height: '80px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <Link
                                            to={`/products/${item.product}`}
                                            className="text-decoration-none"
                                        >
                                            <h6 className="mb-1">{item.name}</h6>
                                        </Link>
                                        <p className="text-muted small mb-0">
                                            Size: {item.size} | Color: {item.color}
                                        </p>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <span className="fw-semibold">Qty: {item.qty}</span>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <span className="fw-semibold">{formatPriceWithDecimals(item.price * item.qty)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Order Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {/* Admin Status Management */}
                                {user?.isAdmin && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Update Order Status (Admin Only)</label>
                                        <select
                                            className="form-select"
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(e.target.value)}
                                            disabled={statusLoading}
                                        >
                                            {orderStatuses.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        {statusLoading && (
                                            <small className="text-muted">Updating status...</small>
                                        )}
                                    </div>
                                )}

                                {/* Customer Actions */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Order Management</label>
                                    <div className="d-flex gap-2">
                                        {canCancelOrder() && (
                                            <button
                                                className="btn btn-warning"
                                                onClick={cancelOrder}
                                                disabled={cancelLoading}
                                            >
                                                {cancelLoading ? (
                                                    <span className="spinner-border spinner-border-sm me-1" />
                                                ) : (
                                                    <i className="fas fa-times me-1" />
                                                )}
                                                Cancel Order
                                            </button>
                                        )}

                                        {(user?.isAdmin || (order.user === user?._id && order.status === 'cancelled')) && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={deleteOrder}
                                            >
                                                <i className="fas fa-trash me-1" />
                                                Delete Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="col-lg-4">
                    {/* Order Summary Card */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Order Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{formatPriceWithDecimals((order.totalPrice || 0) - (order.taxPrice || 0) - (order.shippingPrice || 0))}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping:</span>
                                <span>{formatPriceWithDecimals(order.shippingPrice || 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tax:</span>
                                <span>{formatPriceWithDecimals(order.taxPrice || 0)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span className="text-primary">{formatPriceWithDecimals(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Shipping Address</h5>
                        </div>
                        <div className="card-body">
                            <address className="mb-0">
                                <strong>{order.shippingAddress?.fullName || 'N/A'}</strong><br />
                                {order.shippingAddress?.address}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                {order.shippingAddress?.country}
                            </address>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Payment Information</h5>
                        </div>
                        <div className="card-body">
                            <p className="mb-2">
                                <strong>Payment Method:</strong><br />
                                {order.paymentMethod || 'Cash on Delivery'}
                            </p>
                            <p className="mb-2">
                                <strong>Payment Status:</strong><br />
                                <span className={`badge bg-${order.isPaid ? 'success' : 'warning'}`}>
                                    {order.isPaid ? 'Paid' : 'Pending'}
                                </span>
                                {order.paidAt && (
                                    <small className="d-block text-muted mt-1">
                                        Paid on: {new Date(order.paidAt).toLocaleDateString()}
                                    </small>
                                )}
                            </p>
                            {order.paymentMethod === 'JazzCash' && order.paymentScreenshot && (
                                <div className="mb-0">
                                    <strong>Payment Screenshot:</strong><br />
                                    <div className="mt-2">
                                        <img
                                            src={order.paymentScreenshot}
                                            alt="Payment Screenshot"
                                            className="img-thumbnail"
                                            style={{ maxWidth: '300px', maxHeight: '200px', cursor: 'pointer' }}
                                            onClick={() => window.open(order.paymentScreenshot, '_blank')}
                                            title="Click to view full size"
                                        />
                                        <br />
                                        <small className="text-muted">Click image to view full size</small>
                                    </div>
                                </div>
                            )}
                            {order.paymentMethod === 'Cash on Delivery' && (
                                <div className="mb-0">
                                    <div className="alert alert-info mt-2 mb-0">
                                        <i className="fas fa-info-circle me-2"></i>
                                        <strong>Cash on Delivery:</strong> Payment will be collected upon delivery. Additional PKR 150 charges applied.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="row mt-4">
                <div className="col-12">
                    <Link to={user?.isAdmin ? "/admin" : "/orders"} className="btn btn-outline-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to {user?.isAdmin ? "Dashboard" : "Orders"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;