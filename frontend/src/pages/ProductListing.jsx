import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { logEvent } from '../api/analytics';
import './ProductListing.css';

function ProductListing() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    logEvent('page_view');
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({
      search: search || undefined,
      category_id: categoryId || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      location: location || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [search, categoryId, minPrice, maxPrice, location, sortBy, sortOrder]);

  const handleBuyNow = (product) => {
    logEvent('reseller_click', product.id);
    window.open(product.reseller_link, '_blank');
  };

  return (
    <div className="listing-page">
      <h1 className="listing-title">All Products</h1>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="filter-input filter-input-small"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="filter-input filter-input-small"
        />

        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="filter-input"
        />

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          className="filter-select"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="title-asc">Name: A to Z</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-state">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products match your filters.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                className="product-image"
                src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.title}
              />
              <div className="product-info">
                <span className="product-category">{product.location || 'General'}</span>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-location">{product.location}</p>
                <p className="product-price">₹{product.price}</p>
                <div className="product-actions">
                  <button className="buy-now-btn" onClick={() => handleBuyNow(product)}>
                    Buy Now
                  </button>
                  <button className="wishlist-btn" title="Save to wishlist">♡</button>
                </div>
                <p className="external-note">You'll complete your purchase on the seller's site</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductListing;