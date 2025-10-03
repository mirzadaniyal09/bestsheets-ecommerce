import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);

        // Fetch featured products for the bottom section
        const featuredData = await productAPI.getProducts({ limit: 8 });
        setProducts(featuredData.products || featuredData || []);

        // Fetch first product from each category for category images
        const categoryNames = ['Cotton', 'Silk', 'Linen', 'Bamboo'];
        const categoryDescriptions = {
          'Cotton': 'Soft & Breathable',
          'Silk': 'Luxury & Elegance',
          'Linen': 'Natural & Relaxed',
          'Bamboo': 'Eco-Friendly & Cool'
        };

        const categoriesWithImages = await Promise.all(
          categoryNames.map(async (categoryName) => {
            try {
              const categoryProducts = await productAPI.getProductsByCategory(categoryName);
              const firstProduct = categoryProducts[0];

              return {
                name: categoryName,
                image: firstProduct ? firstProduct.image : 'https://www.myhomedecor.pk/wp-content/uploads/2023/10/plain-bed-sheet-spring-mint.png',
                description: categoryDescriptions[categoryName],
                productCount: categoryProducts.length
              };
            } catch (error) {
              console.error(`Error fetching ${categoryName} products:`, error);
              return {
                name: categoryName,
                image: 'https://www.myhomedecor.pk/wp-content/uploads/2023/10/plain-bed-sheet-spring-mint.png',
                description: categoryDescriptions[categoryName],
                productCount: 0
              };
            }
          })
        );

        setCategories(categoriesWithImages);
        console.log('Categories with images:', categoriesWithImages);

      } catch (err) {
        console.error('Products fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Premium Bedsheets for Better Sleep
              </h1>
              <p className="lead mb-4">
                Discover our collection of luxury bedsheets made from the finest materials.
                From Egyptian cotton to pure silk, find the perfect bedding for your comfort.
              </p>
              <Link to="/products" className="btn btn-light btn-lg">
                Shop Now <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fFNob3B8ZW58MHx8MHx8fDA%3D"
                alt="Luxury Bedsheets"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Shop by Material</h2>
            <p className="text-muted">Find the perfect material for your comfort needs</p>
          </div>

          <div className="row">
            {categories.map((category) => (
              <div key={category.name} className="col-lg-3 col-md-6 mb-4">
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className="text-decoration-none"
                >
                  <div className="card category-card h-100 border-0 shadow-sm hover-shadow">
                    <div className="position-relative">
                      <img
                        src={category.image}
                        alt={`${category.name} bedsheets`}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://www.myhomedecor.pk/wp-content/uploads/2023/10/plain-bed-sheet-spring-mint.png';
                        }}
                      />
                      {category.productCount > 0 && (
                        <span className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded-start">
                          {category.productCount} products
                        </span>
                      )}
                    </div>
                    <div className="card-body text-center">
                      <h5 className="card-title text-dark">{category.name}</h5>
                      <p className="card-text text-muted">{category.description}</p>
                      <small className="text-primary">Shop Now →</small>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Featured Products</h2>
            <p className="text-muted">Our most popular bedsheet collections</p>
          </div>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found or products are still loading...</p>
              <p className="text-muted small">Debug: Products array length: {products.length}</p>
            </div>
          ) : (
            <div className="row">
              {products.map((product) => (
                <div key={product._id} className="col-lg-3 col-md-6 mb-4">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <Link to="/products" className="btn btn-primary btn-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                <h5>Free Shipping</h5>
                <p className="text-muted">Free shipping on orders over PKR 25,000</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="fas fa-undo fa-3x text-primary mb-3"></i>
                <h5>30-Day Returns</h5>
                <p className="text-muted">Easy returns within 30 days</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="fas fa-award fa-3x text-primary mb-3"></i>
                <h5>Premium Quality</h5>
                <p className="text-muted">Only the finest materials and craftsmanship</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="fas fa-headset fa-3x text-primary mb-3"></i>
                <h5>24/7 Support</h5>
                <p className="text-muted">Customer support available around the clock</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;