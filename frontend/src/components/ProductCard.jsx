import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { formatPriceWithDecimals } from '../utils/currency';
import { CartContext } from '../store/CartContext';
import { AuthContext } from '../store/AuthContext';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    if (product.countInStock === 0) return;

    try {
      setIsAdding(true);

      // Use default values for quick add to cart from product cards
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Queen';
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'White';

      await addToCart({
        productId: product._id,
        quantity: 1,
        size: defaultSize,
        color: defaultColor,
      });

      // Show success message (you can implement toast notifications)
      alert('Product added to cart!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card h-100 product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={imageError ? '/images/placeholder-bedsheet.svg' : product.image}
          className="card-img-top"
          alt={product.name}
          style={{ height: '250px', objectFit: 'cover' }}
          onError={handleImageError}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <Link to={`/products/${product._id}`} className="text-decoration-none">
          <h5 className="card-title text-dark">{product.name}</h5>
        </Link>
        <p className="card-text text-muted small">{product.brand}</p>

        <div className="mt-auto">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="h5 mb-0 text-primary">{formatPriceWithDecimals(product.price)}</span>
            {product.countInStock > 0 ? (
              <small className="text-success">
                <i className="fas fa-check-circle me-1"></i>
                In Stock
              </small>
            ) : (
              <small className="text-danger">
                <i className="fas fa-times-circle me-1"></i>
                Out of Stock
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer bg-transparent">
        <div className="d-flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="btn btn-outline-primary flex-fill btn-sm"
          >
            View Details
          </Link>
          {product.countInStock > 0 && (
            <button
              className="btn btn-primary flex-fill btn-sm"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart me-1"></i>
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;