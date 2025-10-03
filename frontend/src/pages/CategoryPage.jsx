import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../api';

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productAPI.getProductsByCategory(category);
                setProducts(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

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
            <div className="mb-4">
                <h1 className="h2 text-capitalize">{category} Bedsheets</h1>
                <p className="text-muted">Explore our collection of {category.toLowerCase()} bedsheets</p>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-5">
                    <p>No products found in this category.</p>
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
        </div>
    );
};

export default CategoryPage;