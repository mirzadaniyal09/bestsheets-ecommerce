import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="container py-5">
            <div className="text-center">
                <div className="mb-4">
                    <i className="fas fa-check-circle fa-5x text-success"></i>
                </div>

                <h1 className="h2 text-success mb-3">Order Placed Successfully!</h1>

                <p className="lead mb-4">
                    Thank you for your order. We've received your payment and will process your bedsheets order shortly.
                </p>

                {orderId && (
                    <div className="alert alert-info d-inline-block">
                        <strong>Order ID:</strong> {orderId}
                    </div>
                )}

                <div className="mt-4">
                    <p className="mb-4">
                        A confirmation email has been sent to your registered email address with order details and tracking information.
                    </p>

                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Link to="/" className="btn btn-primary">
                            <i className="fas fa-home me-2"></i>
                            Continue Shopping
                        </Link>

                        <Link to="/profile" className="btn btn-outline-primary">
                            <i className="fas fa-user me-2"></i>
                            View Profile
                        </Link>

                        {orderId && (
                            <Link to={`/orders/${orderId}`} className="btn btn-outline-success">
                                <i className="fas fa-eye me-2"></i>
                                View Order Details
                            </Link>
                        )}
                    </div>
                </div>

                <div className="mt-5">
                    <div className="row">
                        <div className="col-lg-4 mb-3">
                            <div className="card h-100 border-0 bg-light">
                                <div className="card-body text-center">
                                    <i className="fas fa-shipping-fast fa-2x text-primary mb-3"></i>
                                    <h5>Fast Shipping</h5>
                                    <p className="small text-muted">Your order will be shipped within 1-2 business days</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 mb-3">
                            <div className="card h-100 border-0 bg-light">
                                <div className="card-body text-center">
                                    <i className="fas fa-shield-alt fa-2x text-primary mb-3"></i>
                                    <h5>Quality Guarantee</h5>
                                    <p className="small text-muted">All our bedsheets come with a quality guarantee</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 mb-3">
                            <div className="card h-100 border-0 bg-light">
                                <div className="card-body text-center">
                                    <i className="fas fa-headset fa-2x text-primary mb-3"></i>
                                    <h5>Customer Support</h5>
                                    <p className="small text-muted">Contact us anytime for order assistance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;