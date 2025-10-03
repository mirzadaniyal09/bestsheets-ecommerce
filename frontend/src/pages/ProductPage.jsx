import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { CartContext } from '../store/CartContext';
import { AuthContext } from '../store/AuthContext';
import Rating from '../components/Rating';
import { formatPrice } from '../utils/currency';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [reviewCheckLoading, setReviewCheckLoading] = useState(false);

  const checkCanReview = async () => {
    if (!user) {
      setCanReview(null);
      return;
    }

    try {
      setReviewCheckLoading(true);
      const reviewStatus = await productAPI.canUserReview(id);
      setCanReview(reviewStatus);
    } catch (err) {
      console.error('Error checking review status:', err);
      setCanReview(null);
    } finally {
      setReviewCheckLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getProduct(id);
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || '');
        setSelectedColor(data.colors?.[0]?.name || '');

        // Fetch reviews
        const reviewsData = await productAPI.getReviews(id);
        setReviews(reviewsData);

        // Check if user can review (only if logged in)
        if (user) {
          checkCanReview();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Check review status when user changes
  useEffect(() => {
    if (user && id) {
      checkCanReview();
    } else {
      setCanReview(null);
    }
  }, [user, id]);

  const handleAddToCart = async () => {
    if (product.countInStock === 0) return;

    if (quantity > product.countInStock) {
      alert(`Cannot add ${quantity} items. Only ${product.countInStock} available in stock.`);
      setQuantity(product.countInStock);
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      // Show success message (you can implement toast notifications)
      alert('Product added to cart!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setReviewLoading(true);
      await productAPI.createReview(id, newReview);

      // Refresh reviews and review status
      const reviewsData = await productAPI.getReviews(id);
      setReviews(reviewsData);

      // Update review status
      if (user) {
        checkCanReview();
      }

      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="container py-5">
      <div className="row">
        {/* Product Images */}
        <div className="col-lg-6 mb-4">
          <div className="mb-3">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="img-fluid rounded"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/images/placeholder-bedsheet.svg';
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`img-thumbnail cursor-pointer ${selectedImage === index ? 'border-primary' : ''
                    }`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="col-lg-6">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/products">Products</a>
              </li>
              <li className="breadcrumb-item active">{product.name}</li>
            </ol>
          </nav>

          <h1 className="h2 mb-2">{product.name}</h1>
          <p className="text-muted mb-3">{product.brand}</p>

          <Rating value={product.rating} text={`${product.numReviews} reviews`} />

          <div className="my-4">
            <span className="h3 text-primary">{formatPrice(product.price)}</span>
          </div>

          <p className="mb-4">{product.description}</p>

          {/* Product Details */}
          <div className="row mb-4">
            <div className="col-sm-6">
              <strong>Material:</strong> {product.material}
            </div>
            <div className="col-sm-6">
              <strong>Thread Count:</strong> {product.threadCount}
            </div>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Size:</label>
              <select
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Color:</label>
              <div className="d-flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    className={`btn btn-outline-secondary ${selectedColor === color.name ? 'active' : ''
                      }`}
                    onClick={() => setSelectedColor(color.name)}
                  >
                    <div
                      className="me-2 d-inline-block"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color.hexCode,
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                      }}
                    ></div>
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="row mb-4">
            <div className="col-sm-3">
              <label className="form-label">Quantity:</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max={product.countInStock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-sm-9 d-flex align-items-end">
              {product.countInStock > 0 ? (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                >
                  <i className="fas fa-cart-plus me-2"></i>
                  Add to Cart
                </button>
              ) : (
                <button className="btn btn-secondary btn-lg" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-3">
            {product.countInStock > 0 ? (
              <span className="badge bg-success">
                {product.countInStock} in stock
              </span>
            ) : (
              <span className="badge bg-danger">Out of stock</span>
            )}
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-4">
              <h5>Features:</h5>
              <ul className="list-unstyled">
                {product.features.map((feature, index) => (
                  <li key={index} className="mb-1">
                    <i className="fas fa-check text-success me-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3>Customer Reviews</h3>

          {/* Write Review Form */}
          {user ? (
            reviewCheckLoading ? (
              <div className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Checking review eligibility...
                  </div>
                </div>
              </div>
            ) : canReview?.canReview ? (
              <div className="card mb-4">
                <div className="card-body">
                  <h5>Write a Review</h5>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Rating</label>
                      <select
                        className="form-select"
                        value={newReview.rating}
                        onChange={(e) =>
                          setNewReview({ ...newReview, rating: parseInt(e.target.value) })
                        }
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Comment</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({ ...newReview, comment: e.target.value })
                        }
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            ) : canReview?.alreadyReviewed ? (
              <div className="alert alert-warning">
                <i className="fas fa-check-circle me-2"></i>
                You have already reviewed this product.
              </div>
            ) : canReview?.hasEligibleOrder === false ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                You can only review products from orders that have been shipped or delivered.
                <br />
                <small>Place an order and wait for it to be shipped/delivered to leave a review.</small>
              </div>
            ) : (
              <div className="alert alert-secondary">
                <i className="fas fa-exclamation-circle me-2"></i>
                Unable to determine review eligibility. Please try again later.
              </div>
            )
          ) : (
            <div className="alert alert-info">
              <a href="/login">Login</a> to write a review
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h6>{review.name}</h6>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <Rating value={review.rating} />
                  <p className="mt-2">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;