import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../store/AuthContext';
import { productAPI, orderAPI } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { formatPriceWithDecimals } from '../utils/currency';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchProducts();
        fetchOrders(); // Always fetch orders for the count display
    }, [user, navigate]);

    // Separate effect to handle tab changes and refresh orders/messages if needed
    useEffect(() => {
        if (activeTab === 'orders' && !ordersLoading && orders.length === 0) {
            fetchOrders();
        }
        if (activeTab === 'messages' && !messagesLoading) {
            fetchMessages();
        }
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getProducts();
            setProducts(data.products || data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const data = await orderAPI.getAllOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            setMessagesLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setMessages(data || []);
            } else {
                console.error('Failed to fetch messages:', data.message);
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    const markMessageAsRead = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages/${messageId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update the message in the state
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId ? { ...msg, isRead: true } : msg
                ));
            }
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the message from the state
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
                alert('Message deleted successfully');
            } else {
                const data = await response.json();
                alert('Failed to delete message: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateOrderStatus(orderId, { status: newStatus });
            // Refresh orders after update
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status: ' + (error.response?.data?.message || error.message));
        }
    };

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

    const handleDeleteProduct = async (productId) => {
        try {
            console.log('Attempting to delete product:', productId);
            const response = await productAPI.deleteProduct(productId);
            console.log('Delete response:', response);

            await fetchProducts(); // Refresh the product list
            setShowDeleteModal(null);

            // Show success message
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Delete product error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
            alert('Error deleting product: ' + errorMessage);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setActiveTab('add-product');
    };

    const handleProductCreated = () => {
        fetchProducts();
        setEditingProduct(null);
        setActiveTab('products');
        alert('Product saved successfully!');
    };

    if (!user || !user.isAdmin) {
        return null;
    }

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

    return (
        <div className="container-fluid py-4">
            <h1 className="h3 mb-4">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Products
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {products.length}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-box fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        In Stock
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {products.reduce((sum, product) => sum + (product.countInStock || 0), 0)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Categories
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {new Set(products.map(p => p.category)).size}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-tags fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Average Price
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {products.length > 0 ? formatPriceWithDecimals(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length) : formatPriceWithDecimals(0)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-rupee-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Distribution Chart */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Category Distribution</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {['Cotton', 'Silk', 'Linen', 'Bamboo', 'Microfiber', 'Polyester'].map((category, index) => {
                                    const categoryProducts = products.filter(p => p.category === category);
                                    const count = categoryProducts.length;
                                    const percentage = products.length > 0 ? ((count / products.length) * 100).toFixed(1) : 0;
                                    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];

                                    return (
                                        <div key={category} className="col-md-2 text-center mb-3">
                                            <div className={`text-${colors[index]} mb-2`}>
                                                <i className="fas fa-bed fa-2x"></i>
                                            </div>
                                            <h6 className="mb-1">{category}</h6>
                                            <p className="mb-0">
                                                <span className="h5">{count}</span><br />
                                                <small className="text-muted">{percentage}%</small>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <i className={`fas fa-shopping-cart me-1 ${ordersLoading ? 'fa-spin' : ''}`}></i>
                        Orders ({ordersLoading ? '...' : orders.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <i className="fas fa-envelope me-1"></i>Messages
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'add-product' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add-product')}
                    >
                        <i className="fas fa-plus me-1"></i>Add Product
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow mb-4">
                            <div className="card-header py-3">
                                <h6 className="m-0 font-weight-bold text-primary">Welcome to Admin Dashboard</h6>
                            </div>
                            <div className="card-body">
                                <p>Welcome to the Admin Dashboard! Here you can manage your bedsheet store.</p>
                                <div className="row">
                                    <div className="col-md-4">
                                        <h6>Quick Actions</h6>
                                        <ul>
                                            <li>View and manage products</li>
                                            <li>Monitor inventory</li>
                                            <li>Check product categories</li>
                                        </ul>
                                    </div>
                                    <div className="col-md-4">
                                        <h6>First Product by Category</h6>
                                        {['Cotton', 'Silk', 'Linen', 'Bamboo', 'Microfiber', 'Polyester'].map(category => {
                                            const categoryProducts = products.filter(p => p.category === category);
                                            const firstProduct = categoryProducts[0];
                                            const count = categoryProducts.length;

                                            return (
                                                <div key={category} className="border-bottom py-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="badge bg-secondary me-2">{category}</span>
                                                        <small className="text-muted">({count} total)</small>
                                                    </div>
                                                    {firstProduct ? (
                                                        <small className="d-block mt-1 text-truncate">
                                                            <i className="fas fa-arrow-right me-1 text-primary"></i>
                                                            {firstProduct.name} - {formatPriceWithDecimals(firstProduct.price)}
                                                        </small>
                                                    ) : (
                                                        <small className="d-block mt-1 text-muted">
                                                            <i className="fas fa-plus me-1"></i>
                                                            No products yet
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="col-md-4">
                                        <h6>Recent Products</h6>
                                        {products.slice(0, 3).map((product) => (
                                            <div key={product._id} className="border-bottom py-2">
                                                <small>
                                                    <span className="badge bg-info me-2">{product.category}</span>
                                                    {product.name} - {formatPriceWithDecimals(product.price)}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        <h6 className="m-0 font-weight-bold text-primary">Products Management</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setActiveTab('add-product');
                                    }}
                                >
                                    <i className="fas fa-plus me-2"></i>Add New Product
                                </button>

                                <div className="d-flex align-items-center">
                                    <label className="me-2">Filter by Category:</label>
                                    <select
                                        className="form-select"
                                        style={{ width: 'auto' }}
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Cotton">Cotton</option>
                                        <option value="Silk">Silk</option>
                                        <option value="Linen">Linen</option>
                                        <option value="Bamboo">Bamboo</option>
                                        <option value="Microfiber">Microfiber</option>
                                        <option value="Polyester">Polyester</option>
                                    </select>
                                </div>
                            </div>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(product => categoryFilter === 'All' || product.category === categoryFilter)
                                        .map((product) => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img
                                                        src={product.image || '/images/placeholder-bedsheet.svg'}
                                                        alt={product.name}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        className="rounded"
                                                        onError={(e) => {
                                                            e.target.src = '/images/placeholder-bedsheet.svg';
                                                        }}
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>
                                                    <span className="badge bg-secondary">{product.category}</span>
                                                </td>
                                                <td>{formatPriceWithDecimals(product.price)}</td>
                                                <td>
                                                    <span className={`badge ${product.countInStock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {product.countInStock}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-1">{product.rating || 0}</span>
                                                        <i className="fas fa-star text-warning"></i>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-primary me-2"
                                                        onClick={() => handleEditProduct(product)}
                                                        title="Edit Product"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => setShowDeleteModal(product)}
                                                        title="Delete Product"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                                <h6 className="m-0 font-weight-bold text-primary">Order Management</h6>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={fetchOrders}
                                        disabled={ordersLoading}
                                        title="Refresh Orders"
                                    >
                                        <i className={`fas fa-sync-alt ${ordersLoading ? 'fa-spin' : ''}`}></i>
                                        {ordersLoading ? ' Refreshing...' : ' Refresh'}
                                    </button>
                                    <span className={`badge ${ordersLoading ? 'bg-secondary' : 'bg-primary'}`}>
                                        {ordersLoading ? 'Loading...' : `${orders.length} Total Orders`}
                                    </span>
                                </div>
                            </div>
                            <div className="card-body">
                                {ordersLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading orders...</span>
                                        </div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                        <h5>No Orders Yet</h5>
                                        <p className="text-muted">Customer orders will appear here when they start purchasing.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Date</th>
                                                    <th>Items</th>
                                                    <th>Total</th>
                                                    <th>Payment</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>
                                                            <code>#{order._id.slice(-8).toUpperCase()}</code>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{order.user?.name || 'Unknown'}</strong>
                                                                <br />
                                                                <small className="text-muted">{order.user?.email}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-secondary">
                                                                {order.orderItems?.length || 0} items
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong className="text-success">
                                                                {formatPriceWithDecimals(order.totalPrice || 0)}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <span className={`badge ${order.paymentMethod === 'Cash on Delivery' ? 'bg-warning' : order.paymentMethod === 'JazzCash' ? 'bg-info' : 'bg-primary'}`}>
                                                                    {order.paymentMethod || 'N/A'}
                                                                </span>
                                                                {order.paymentMethod === 'JazzCash' && order.paymentScreenshot && (
                                                                    <div className="mt-1">
                                                                        <button
                                                                            className="btn btn-link btn-sm p-0 text-decoration-none"
                                                                            onClick={() => window.open(order.paymentScreenshot, '_blank')}
                                                                            title="View Payment Screenshot"
                                                                        >
                                                                            <i className="fas fa-image text-success me-1"></i>
                                                                            <small>Screenshot</small>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className={`form-select form-select-sm badge ${getStatusBadgeClass(order.status)}`}
                                                                value={order.status || 'pending'}
                                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                                style={{
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <Link
                                                                to={`/orders/${order._id}`}
                                                                className="btn btn-outline-primary btn-sm"
                                                            >
                                                                <i className="fas fa-eye me-1"></i>
                                                                View Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Order Summary Statistics */}
                                {orders.length > 0 && (
                                    <div className="row mt-4 pt-3 border-top">
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-warning">
                                                    {orders.filter(o => o.status === 'pending').length}
                                                </div>
                                                <small className="text-muted">Pending</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-info">
                                                    {orders.filter(o => o.status === 'processing').length}
                                                </div>
                                                <small className="text-muted">Processing</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-primary">
                                                    {orders.filter(o => o.status === 'shipped').length}
                                                </div>
                                                <small className="text-muted">Shipped</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-success">
                                                    {orders.filter(o => o.status === 'delivered').length}
                                                </div>
                                                <small className="text-muted">Delivered</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                                <h6 className="m-0 font-weight-bold text-primary">Customer Messages</h6>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={fetchMessages}
                                        disabled={messagesLoading}
                                        title="Refresh Messages"
                                    >
                                        <i className={`fas fa-sync-alt ${messagesLoading ? 'fa-spin' : ''}`}></i>
                                        {messagesLoading ? ' Refreshing...' : ' Refresh'}
                                    </button>
                                    <span className={`badge ${messagesLoading ? 'bg-secondary' : 'bg-info'}`}>
                                        {messagesLoading ? 'Loading...' : `${messages.length} Total Messages`}
                                    </span>
                                    <span className="badge bg-warning">
                                        {messages.filter(msg => !msg.isRead).length} Unread
                                    </span>
                                </div>
                            </div>
                            <div className="card-body">
                                {messagesLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading messages...</span>
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-envelope-open fa-3x text-muted mb-3"></i>
                                        <h5>No Messages Yet</h5>
                                        <p className="text-muted">Customer messages will appear here when they contact you through the contact form.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Status</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Subject</th>
                                                    <th>Message</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {messages
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                                                    .map((message) => (
                                                        <tr key={message._id} className={!message.isRead ? 'table-warning' : ''}>
                                                            <td>
                                                                <span className={`badge ${message.isRead ? 'bg-success' : 'bg-warning'}`}>
                                                                    {message.isRead ? (
                                                                        <>
                                                                            <i className="fas fa-check-circle me-1"></i>
                                                                            Read
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-exclamation-circle me-1"></i>
                                                                            Unread
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <strong>{message.name}</strong>
                                                            </td>
                                                            <td>
                                                                <a href={`mailto:${message.email}`} className="text-decoration-none">
                                                                    <i className="fas fa-envelope me-1"></i>
                                                                    {message.email}
                                                                </a>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info">
                                                                    {message.subject.charAt(0).toUpperCase() + message.subject.slice(1).replace('-', ' ')}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                    {message.message}
                                                                </div>
                                                                {message.message.length > 50 && (
                                                                    <button
                                                                        className="btn btn-link btn-sm p-0 mt-1"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target={`#messageModal-${message._id}`}
                                                                    >
                                                                        <small>Read more...</small>
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {new Date(message.createdAt).toLocaleDateString()}
                                                                    <br />
                                                                    <small className="text-muted">
                                                                        {new Date(message.createdAt).toLocaleTimeString()}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="btn-group" role="group">
                                                                    {!message.isRead && (
                                                                        <button
                                                                            className="btn btn-outline-success btn-sm"
                                                                            onClick={() => markMessageAsRead(message._id)}
                                                                            title="Mark as Read"
                                                                        >
                                                                            <i className="fas fa-check"></i>
                                                                        </button>
                                                                    )}
                                                                    <a
                                                                        href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0A%0AThank you for contacting BestSheets! %0A%0ARegarding your message:%0A"${message.message}"%0A%0A[Your response here]%0A%0ABest regards,%0ABestSheets Customer Service%0APhone: 03209571136%0AEmail: daniyal.basheer@bestsheets.pk`}
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        title="Reply via Email"
                                                                    >
                                                                        <i className="fas fa-reply"></i>
                                                                    </a>
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={() => deleteMessage(message._id)}
                                                                        title="Delete Message"
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>

                                        {/* Message Detail Modals */}
                                        {messages.map((message) => (
                                            <div key={`modal-${message._id}`} className="modal fade" id={`messageModal-${message._id}`} tabIndex="-1">
                                                <div className="modal-dialog modal-lg">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h5 className="modal-title">
                                                                Message from {message.name}
                                                                <span className={`badge ms-2 ${message.isRead ? 'bg-success' : 'bg-warning'}`}>
                                                                    {message.isRead ? 'Read' : 'Unread'}
                                                                </span>
                                                            </h5>
                                                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                                        </div>
                                                        <div className="modal-body">
                                                            <div className="row mb-3">
                                                                <div className="col-sm-3"><strong>Name:</strong></div>
                                                                <div className="col-sm-9">{message.name}</div>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <div className="col-sm-3"><strong>Email:</strong></div>
                                                                <div className="col-sm-9">
                                                                    <a href={`mailto:${message.email}`}>{message.email}</a>
                                                                </div>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <div className="col-sm-3"><strong>Subject:</strong></div>
                                                                <div className="col-sm-9">
                                                                    <span className="badge bg-info">
                                                                        {message.subject.charAt(0).toUpperCase() + message.subject.slice(1).replace('-', ' ')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <div className="col-sm-3"><strong>Date:</strong></div>
                                                                <div className="col-sm-9">
                                                                    {new Date(message.createdAt).toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <div className="col-sm-3"><strong>Message:</strong></div>
                                                                <div className="col-sm-9">
                                                                    <div className="border rounded p-3 bg-light">
                                                                        {message.message.split('\n').map((line, index) => (
                                                                            <React.Fragment key={index}>
                                                                                {line}
                                                                                {index < message.message.split('\n').length - 1 && <br />}
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="modal-footer">
                                                            {!message.isRead && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-success"
                                                                    onClick={() => markMessageAsRead(message._id)}
                                                                    data-bs-dismiss="modal"
                                                                >
                                                                    <i className="fas fa-check me-1"></i>
                                                                    Mark as Read
                                                                </button>
                                                            )}
                                                            <a
                                                                href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0A%0AThank you for contacting BestSheets! %0A%0ARegarding your message:%0A"${message.message}"%0A%0A[Your response here]%0A%0ABest regards,%0ABestSheets Customer Service%0APhone: 03209571136%0AEmail: daniyal.basheer@bestsheets.pk`}
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-reply me-1"></i>
                                                                Reply via Email
                                                            </a>
                                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Message Summary Statistics */}
                                {messages.length > 0 && (
                                    <div className="row mt-4 pt-3 border-top">
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-warning">
                                                    {messages.filter(m => !m.isRead).length}
                                                </div>
                                                <small className="text-muted">Unread Messages</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-info">
                                                    {messages.filter(m => m.subject === 'product-inquiry').length}
                                                </div>
                                                <small className="text-muted">Product Inquiries</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-primary">
                                                    {messages.filter(m => m.subject === 'order-status').length}
                                                </div>
                                                <small className="text-muted">Order Status</small>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <div className="h4 text-success">
                                                    {messages.filter(m => m.subject === 'bulk-order').length}
                                                </div>
                                                <small className="text-muted">Bulk Orders</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'add-product' && (
                <ProductForm
                    product={editingProduct}
                    onSuccess={handleProductCreated}
                    onCancel={() => setActiveTab('products')}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{showDeleteModal.name}</strong>?</p>
                                <p className="text-muted">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteProduct(showDeleteModal._id)}
                                >
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Product Form Component for Adding/Editing Products
const ProductForm = ({ product, onSuccess, onCancel }) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        description: product?.description || '',
        image: product?.image || '',
        brand: product?.brand || '',
        category: product?.category || 'Cotton',
        countInStock: product?.countInStock || '',
        material: product?.material || '',
        threadCount: product?.threadCount || '',
        sizes: product?.sizes || [],
        colors: product?.colors || [{ name: '', hexCode: '#000000' }],
        features: product?.features || [''],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ['Cotton', 'Silk', 'Linen', 'Bamboo', 'Microfiber', 'Polyester'];
    const availableSizes = ['Twin', 'Full', 'Queen', 'King', 'California King'];

    // Category-specific image suggestions
    const categoryImages = {
        'Cotton': '/images/cotton-sheets.jpg',
        'Silk': '/images/silk-sheets.jpg',
        'Linen': '/images/linen-sheets.jpg',
        'Bamboo': '/images/bamboo-sheets.jpg',
        'Microfiber': '/images/microfiber-sheets.jpg',
        'Polyester': '/images/percale-sheets.jpg'
    };

    // Category-specific default materials
    const categoryMaterials = {
        'Cotton': '100% Cotton',
        'Silk': '100% Mulberry Silk',
        'Linen': '100% French Linen',
        'Bamboo': '100% Bamboo Fiber',
        'Microfiber': '100% Brushed Microfiber',
        'Polyester': '100% Polyester'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto-fill image and material when category changes
        if (name === 'category' && !formData.image && !isEditing) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                image: categoryImages[value] || '',
                material: categoryMaterials[value] || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSizeChange = (size) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handleColorChange = (index, field, value) => {
        const newColors = [...formData.colors];
        newColors[index][field] = value;

        // Auto-generate hex code when color name changes
        if (field === 'name' && value.trim()) {
            newColors[index]['hexCode'] = getColorFromName(value);
        }

        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    // Color name to hex mapping
    const getColorFromName = (colorName) => {
        const colorMap = {
            // Basic colors
            'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000', 'blue': '#0000FF',
            'green': '#008000', 'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
            'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',

            // Bedsheet specific colors
            'cream': '#F5F5DC', 'ivory': '#FFFFF0', 'beige': '#F5F5DC', 'navy': '#000080',
            'burgundy': '#800020', 'maroon': '#800000', 'teal': '#008080', 'sage': '#9CAF88',
            'lavender': '#E6E6FA', 'blush': '#DE5D83', 'charcoal': '#36454F', 'silver': '#C0C0C0',
            'gold': '#FFD700', 'rose': '#FF007F', 'coral': '#FF7F50', 'mint': '#98FB98',
            'taupe': '#483C32', 'slate': '#708090', 'pearl': '#EAE0C8', 'champagne': '#F7E7CE',
            'platinum': '#E5E4E2', 'bronze': '#CD7F32', 'copper': '#B87333', 'steel': '#4682B4',
            'smoke': '#738276', 'sand': '#C2B280', 'stone': '#928E85', 'cloud': '#C7C9CC',
            'mist': '#C5C5C5', 'fog': '#D6D6D6', 'ash': '#B2BEB5', 'dove': '#6D6875',
            'opal': '#A8C3BC', 'jade': '#00A86B', 'emerald': '#50C878', 'sapphire': '#0F52BA',
            'ruby': '#E0115F', 'amber': '#FFBF00', 'topaz': '#FFC87C', 'onyx': '#353839',
            'diamond': '#B9F2FF', 'crystal': '#A7D8DE'
        };

        const name = colorName.toLowerCase().trim();
        return colorMap[name] || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    };

    const addColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, { name: '', hexCode: '#000000' }]
        }));
    };

    const removeColor = (index) => {
        if (formData.colors.length > 1) {
            setFormData(prev => ({
                ...prev,
                colors: prev.colors.filter((_, i) => i !== index)
            }));
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        if (formData.features.length > 1) {
            setFormData(prev => ({
                ...prev,
                features: prev.features.filter((_, i) => i !== index)
            }));
        }
    };

    // Handle image file upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
                setFormData(prev => ({ ...prev, image: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset image preview when form is reset
    const resetImagePreview = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name || !formData.brand || !formData.category || !formData.description || !formData.price || formData.countInStock === '') {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                countInStock: parseInt(formData.countInStock),
                threadCount: formData.threadCount ? parseInt(formData.threadCount) : undefined,
                slug: generateSlug(formData.name),
                colors: formData.colors.filter(color => color.name && color.hexCode),
                features: formData.features.filter(feature => feature.trim()),
                rating: product?.rating || 0,
                numReviews: product?.numReviews || 0,
            };

            console.log('Submitting product data:', productData);

            let result;
            if (isEditing) {
                result = await productAPI.updateProduct(product._id, productData);
                console.log('Update result:', result);
            } else {
                result = await productAPI.createProduct(productData);
                console.log('Create result:', result);
            }

            onSuccess();
        } catch (err) {
            console.error('Submit error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save product';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h6>
                <button className="btn btn-secondary btn-sm" onClick={onCancel}>
                    <i className="fas fa-arrow-left me-1"></i>Back to Products
                </button>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label">Product Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label">Brand *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">Price (PKR) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-control"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <small className="form-text text-muted">
                                    Selecting a category will auto-suggest image and material
                                </small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">Stock Count *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="countInStock"
                                    value={formData.countInStock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label">Product Image</label>

                                {/* Image Preview */}
                                {(imagePreview || formData.image) && (
                                    <div className="mb-2">
                                        <img
                                            src={imagePreview || formData.image}
                                            alt="Product preview"
                                            className="img-thumbnail"
                                            style={{ maxHeight: '150px', maxWidth: '200px' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger ms-2"
                                            onClick={resetImagePreview}
                                        >
                                            <i className="fas fa-trash"></i> Remove
                                        </button>
                                    </div>
                                )}

                                {/* File Upload Option */}
                                <div className="mb-2">
                                    <label className="form-label small">Upload from Computer:</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                {/* URL Input Option */}
                                <div className="mb-2">
                                    <label className="form-label small">Or enter Image URL:</label>
                                    <div className="input-group">
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            placeholder="/images/product-name.jpg"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setFormData(prev => ({ ...prev, image: categoryImages[formData.category] }))}
                                            title="Use category default image"
                                        >
                                            <i className="fas fa-image"></i> Use Category Image
                                        </button>
                                    </div>
                                </div>

                                <small className="form-text text-muted">
                                    Upload an image file or enter a URL. Leave blank to use category default image.
                                </small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="mb-3">
                                <label className="form-label">Material</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="material"
                                    value={formData.material}
                                    onChange={handleChange}
                                    placeholder="e.g., 100% Cotton"
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="mb-3">
                                <label className="form-label">Thread Count</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="threadCount"
                                    value={formData.threadCount}
                                    onChange={handleChange}
                                    placeholder="e.g., 400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Available Sizes</label>
                        <div className="row">
                            {availableSizes.map(size => (
                                <div key={size} className="col-md-2">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`size-${size}`}
                                            checked={formData.sizes.includes(size)}
                                            onChange={() => handleSizeChange(size)}
                                        />
                                        <label className="form-check-label" htmlFor={`size-${size}`}>
                                            {size}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Colors</label>
                        <small className="form-text text-muted mb-2 d-block">
                            Enter color name and the hex code will be auto-generated. You can also manually adjust the color picker.
                        </small>
                        {formData.colors.map((color, index) => (
                            <div key={index} className="row mb-2 align-items-center">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Navy Blue, Cream, Sage"
                                        value={color.name}
                                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="color"
                                            className="form-control form-control-color me-2"
                                            value={color.hexCode}
                                            onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                                            style={{ width: '50px', height: '38px' }}
                                        />
                                        <span className="small text-muted">{color.hexCode}</span>
                                    </div>
                                </div>
                                <div className="col-md-1">
                                    <div
                                        className="border rounded"
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            backgroundColor: color.hexCode
                                        }}
                                        title={`${color.name} - ${color.hexCode}`}
                                    ></div>
                                </div>
                                <div className="col-md-4">
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm me-2"
                                        onClick={() => removeColor(index)}
                                        disabled={formData.colors.length === 1}
                                    >
                                        Remove
                                    </button>
                                    {index === formData.colors.length - 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={addColor}
                                        >
                                            Add Color
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Features</label>
                        {formData.features.map((feature, index) => (
                            <div key={index} className="row mb-2">
                                <div className="col-md-8">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Feature description"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm me-2"
                                        onClick={() => removeFeature(index)}
                                        disabled={formData.features.length === 1}
                                    >
                                        Remove
                                    </button>
                                    {index === formData.features.length - 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={addFeature}
                                        >
                                            Add Feature
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-secondary me-2"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;