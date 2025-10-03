import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../api';

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();

    // Get the search keyword from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        if (keyword) {
            searchProducts();
        } else {
            setProducts([]);
        }
    }, [keyword, location.search]);

    const searchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            // Get all products and filter them
            const data = await productAPI.getProducts();
            const allProducts = data.products || data || [];

            // Filter products by search keyword
            const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(keyword.toLowerCase()) ||
                product.brand.toLowerCase().includes(keyword.toLowerCase()) ||
                product.category.toLowerCase().includes(keyword.toLowerCase()) ||
                product.description.toLowerCase().includes(keyword.toLowerCase()) ||
                product.material?.toLowerCase().includes(keyword.toLowerCase())
            );

            setProducts(filteredProducts);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search products');
        } finally {
            setLoading(false);
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

    return (
        <div className="container py-5">
            {/* Search Results Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">Home</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Search Results
                            </li>
                        </ol>
                    </nav>

                    <h1 className="h2 mb-2">
                        Search Results for "{keyword}"
                    </h1>

                    <p className="text-muted">
                        {loading ? 'Searching...' : `Found ${products.length} result${products.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {/* Search Results */}
            {!loading && products.length === 0 && keyword ? (
                <div className="text-center py-5">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No products found</h4>
                    <p className="text-muted mb-4">
                        Sorry, we couldn't find any products matching "{keyword}".
                    </p>

                    {/* Search Suggestions */}
                    <div className="card mx-auto" style={{ maxWidth: '600px' }}>
                        <div className="card-body">
                            <h5 className="card-title">Search Suggestions:</h5>
                            <ul className="list-unstyled text-start">
                                <li>• Try different keywords</li>
                                <li>• Check your spelling</li>
                                <li>• Use more general terms (e.g., "cotton" instead of "egyptian cotton")</li>
                                <li>• Browse by category instead</li>
                            </ul>

                            <div className="mt-3">
                                <h6>Popular searches:</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to="/search?keyword=cotton" className="badge bg-primary text-decoration-none">Cotton</Link>
                                    <Link to="/search?keyword=silk" className="badge bg-primary text-decoration-none">Silk</Link>
                                    <Link to="/search?keyword=linen" className="badge bg-primary text-decoration-none">Linen</Link>
                                    <Link to="/search?keyword=bamboo" className="badge bg-primary text-decoration-none">Bamboo</Link>
                                    <Link to="/search?keyword=luxury" className="badge bg-primary text-decoration-none">Luxury</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link to="/products" className="btn btn-primary me-3">
                            Browse All Products
                        </Link>
                        <Link to="/" className="btn btn-outline-primary">
                            Back to Home
                        </Link>
                    </div>
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

            {/* Related Categories */}
            {products.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                    <h5 className="mb-3">Found in Categories</h5>
                    <div className="row">
                        {[...new Set(products.map(p => p.category))].map(category => {
                            const categoryCount = products.filter(p => p.category === category).length;
                            return (
                                <div key={category} className="col-auto mb-2">
                                    <Link
                                        to={`/category/${category.toLowerCase()}`}
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        {category} ({categoryCount})
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;