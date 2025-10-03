import React, { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            {/* Page Header */}
            <div className="row mb-5">
                <div className="col-12 text-center">
                    <h1 className="display-4 fw-bold text-primary mb-3">Contact Us</h1>
                    <p className="lead text-muted">
                        Get in touch with us for any questions about our premium bedsheet collections
                    </p>
                </div>
            </div>

            <div className="row">
                {/* Contact Information */}
                <div className="col-lg-6 mb-5">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="card-title mb-4">
                                <i className="fas fa-info-circle text-primary me-2"></i>
                                Contact Information
                            </h3>

                            {/* Email */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-envelope text-primary me-3"></i>
                                    <h5 className="mb-0">Email</h5>
                                </div>
                                <p className="text-muted ms-4 mb-0">
                                    <a href="mailto:admin@bedsheetstore.com" className="text-decoration-none">
                                        admin@bedsheetstore.com
                                    </a>
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-phone text-primary me-3"></i>
                                    <h5 className="mb-0">Phone</h5>
                                </div>
                                <p className="text-muted ms-4 mb-0">
                                    <a href="tel:+923209571136" className="text-decoration-none">
                                        +92 320 957 1136
                                    </a>
                                </p>
                            </div>

                            {/* Instagram */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fab fa-instagram text-primary me-3"></i>
                                    <h5 className="mb-0">Instagram</h5>
                                </div>
                                <p className="text-muted ms-4 mb-0">
                                    <a
                                        href="https://instagram.com/mirza.daniyal09"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none"
                                    >
                                        @mirza.daniyal09
                                    </a>
                                </p>
                            </div>

                            {/* Business Hours */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="fas fa-clock text-primary me-3"></i>
                                    <h5 className="mb-0">Business Hours</h5>
                                </div>
                                <div className="ms-4">
                                    <p className="text-muted mb-1">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                                    <p className="text-muted mb-0">Sunday: 10:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="col-lg-6 mb-5">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body p-4">
                            <h3 className="card-title mb-4">
                                <i className="fas fa-paper-plane text-primary me-2"></i>
                                Send us a Message
                            </h3>

                            {success && (
                                <div className="alert alert-success mb-4" role="alert">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger mb-4" role="alert">
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Your Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="subject" className="form-label">Subject</label>
                                    <select
                                        className="form-select"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="product-inquiry">Product Inquiry</option>
                                        <option value="order-status">Order Status</option>
                                        <option value="return-exchange">Return/Exchange</option>
                                        <option value="bulk-order">Bulk Order</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="message" className="form-label">Message</label>
                                    <textarea
                                        className="form-control"
                                        id="message"
                                        rows="5"
                                        placeholder="Please describe your inquiry or message..."
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane me-2"></i>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card bg-light">
                        <div className="card-body text-center py-5">
                            <h3 className="text-primary mb-3">Why Choose BedSheet Store?</h3>
                            <div className="row">
                                <div className="col-lg-3 col-md-6 mb-4">
                                    <i className="fas fa-award fa-2x text-primary mb-3"></i>
                                    <h5>Premium Quality</h5>
                                    <p className="text-muted small">Only the finest materials and craftsmanship</p>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4">
                                    <i className="fas fa-shipping-fast fa-2x text-primary mb-3"></i>
                                    <h5>Fast Delivery</h5>
                                    <p className="text-muted small">Quick and secure shipping nationwide</p>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4">
                                    <i className="fas fa-headset fa-2x text-primary mb-3"></i>
                                    <h5>Customer Support</h5>
                                    <p className="text-muted small">Dedicated support for all your needs</p>
                                </div>
                                <div className="col-lg-3 col-md-6 mb-4">
                                    <i className="fas fa-undo fa-2x text-primary mb-3"></i>
                                    <h5>Easy Returns</h5>
                                    <p className="text-muted small">Hassle-free returns within 30 days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;