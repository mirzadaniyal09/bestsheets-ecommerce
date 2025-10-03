import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Cotton', 'Silk', 'Linen', 'Bamboo', 'Microfiber', 'Polyester'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productAPI.getProducts();
                const allProducts = data.products || data || [];
                setProducts(allProducts);
                setFilteredProducts(allProducts);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(product =>
                product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [products, selectedCategory, sortBy, searchQuery]);

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
            {/* Page Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="h2 mb-1">All Products</h1>
                    <p className="text-muted">Explore our complete collection of premium bedsheets</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <label className="form-label fw-semibold">Search Products</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, brand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category} {category !== 'All' ? 'Bedsheets' : 'Categories'}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <label className="form-label fw-semibold">Sort By</label>
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-low">Price (Low to High)</option>
                        <option value="price-high">Price (High to Low)</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>
                <div className="col-lg-3 col-md-6 mb-3 d-flex align-items-end">
                    <div className="w-100">
                        <div className="bg-light p-3 rounded text-center">
                            <div className="fw-bold text-primary">{filteredProducts.length}</div>
                            <small className="text-muted">Products Found</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>No products found</h4>
                    <p className="text-muted">
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try adjusting your search or filters.'
                            : 'No products available at the moment.'
                        }
                    </p>
                    {(searchQuery || selectedCategory !== 'All') && (
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="row">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="col-lg-3 col-md-6 mb-4">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}

            {/* Category Statistics */}
            {filteredProducts.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                    <h5 className="mb-3">Products by Category</h5>
                    <div className="row">
                        {categories.filter(cat => cat !== 'All').map(category => {
                            const count = products.filter(p =>
                                p.category.toLowerCase() === category.toLowerCase()
                            ).length;

                            return count > 0 ? (
                                <div key={category} className="col-lg-2 col-md-4 col-6 mb-3">
                                    <div
                                        className={`card text-center cursor-pointer ${selectedCategory === category ? 'border-primary' : ''
                                            }`}
                                        onClick={() => setSelectedCategory(category)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-body py-3">
                                            <div className="fw-bold text-primary">{count}</div>
                                            <small className="text-muted">{category}</small>
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;