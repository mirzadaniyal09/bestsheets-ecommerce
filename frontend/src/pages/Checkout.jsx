import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../store/CartContext';
import { AuthContext } from '../store/AuthContext';
import { orderAPI } from '../api';
import { formatPriceWithDecimals, getFreeShippingThreshold } from '../utils/currency';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        phoneNumber: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const handleScreenshotUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentScreenshot(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setScreenshotPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getShippingPrice = () => {
        return paymentMethod === 'Cash on Delivery' ? 600 : 450; // PKR 600 for COD, PKR 450 for JazzCash
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate JazzCash screenshot requirement
        if (paymentMethod === 'JazzCash' && !paymentScreenshot) {
            setError('Please upload a payment screenshot for JazzCash payment.');
            setLoading(false);
            return;
        }

        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.product.name,
                    qty: item.quantity,
                    image: item.product.image,
                    price: item.product.price,
                    product: item.product._id,
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice: cartTotal,
                taxPrice: cartTotal * 0.08, // 8% tax
                shippingPrice: getShippingPrice(),
                totalPrice: cartTotal + (cartTotal * 0.08) + getShippingPrice(),
                paymentScreenshot: paymentScreenshot ? await convertFileToBase64(paymentScreenshot) : null,
            };

            const order = await orderAPI.createOrder(orderData);
            await clearCart();
            navigate('/order-success', { state: { orderId: order._id } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning text-center">
                    Please log in to continue with checkout.
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-info text-center">
                    Your cart is empty. Add some items before checkout.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Checkout</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                <div className="col-lg-8">
                    <form onSubmit={handleSubmit}>
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Shipping Address</h5>
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label htmlFor="address" className="form-label">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="address"
                                            name="address"
                                            value={shippingAddress.address}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="city"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="postalCode"
                                            name="postalCode"
                                            value={shippingAddress.postalCode}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={shippingAddress.phoneNumber}
                                            onChange={handleAddressChange}
                                            placeholder="03XXXXXXXXX"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Payment Method</h5>

                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentMethod"
                                        id="cod"
                                        value="Cash on Delivery"
                                        checked={paymentMethod === 'Cash on Delivery'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="cod">
                                        <strong>Cash on Delivery</strong>
                                        <small className="text-muted d-block">Pay when your order arrives (+PKR 150 extra charges)</small>
                                    </label>
                                </div>

                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="paymentMethod"
                                        id="jazzcash"
                                        value="JazzCash"
                                        checked={paymentMethod === 'JazzCash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="jazzcash">
                                        <strong>JazzCash</strong>
                                        <small className="text-muted d-block">Mobile wallet payment</small>
                                    </label>
                                </div>

                                {paymentMethod === 'JazzCash' && (
                                    <div className="border rounded p-3 mb-3 bg-light">
                                        <h6 className="text-primary">JazzCash Payment Details</h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p className="mb-1"><strong>Account Number:</strong></p>
                                                <p className="text-primary">03209571136</p>
                                                <p className="mb-1"><strong>Account Name:</strong></p>
                                                <p className="text-primary">Daniyal Basheer</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="mb-2"><strong>Instructions:</strong></p>
                                                <ol className="small text-muted">
                                                    <li>Send payment to the above JazzCash number</li>
                                                    <li>Take a screenshot of the payment</li>
                                                    <li>Upload the screenshot below</li>
                                                </ol>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="paymentScreenshot" className="form-label">
                                                <strong className="text-danger">*</strong> Upload Payment Screenshot
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="paymentScreenshot"
                                                accept="image/*"
                                                onChange={handleScreenshotUpload}
                                                required={paymentMethod === 'JazzCash'}
                                            />
                                            <small className="text-muted">Please upload a clear screenshot of your JazzCash payment</small>
                                        </div>

                                        {screenshotPreview && (
                                            <div className="mt-3">
                                                <p className="mb-2"><strong>Screenshot Preview:</strong></p>
                                                <img
                                                    src={screenshotPreview}
                                                    alt="Payment Screenshot"
                                                    className="img-thumbnail"
                                                    style={{ maxWidth: '300px', maxHeight: '200px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Order Summary</h5>

                            {cartItems.map((item) => (
                                <div key={item.product._id} className="d-flex justify-content-between mb-2">
                                    <span>{item.product.name} x {item.quantity}</span>
                                    <span>{formatPriceWithDecimals(item.product.price * item.quantity)}</span>
                                </div>
                            ))}

                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{formatPriceWithDecimals(cartTotal)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tax (8%):</span>
                                <span>{formatPriceWithDecimals(cartTotal * 0.08)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping:</span>
                                <span>{formatPriceWithDecimals(getShippingPrice())}</span>
                            </div>
                            {paymentMethod === 'Cash on Delivery' && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-muted">- Base Shipping: PKR 450.00</span>
                                    <span></span>
                                </div>
                            )}
                            {paymentMethod === 'Cash on Delivery' && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-muted">- COD Charges: PKR 150.00</span>
                                    <span></span>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between h5">
                                <span>Total:</span>
                                <span>{formatPriceWithDecimals(cartTotal + (cartTotal * 0.08) + getShippingPrice())}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;