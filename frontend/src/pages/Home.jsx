import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import { logEvent } from '../api/analytics';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logEvent('page_view');
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const handleBuyNow = (product) => {
    logEvent('reseller_click', product.id);
    window.open(product.reseller_link, '_blank');
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-card">
          <div className="hero-text">
            <span className="hero-badge">New Arrivals</span>
            <h1>Discover Better Deals, All in One Place</h1>
            <p>Curated products from trusted sellers. Browse, compare, and shop with confidence — we help you find it, sellers help you get it.</p>
            <a href="/products" className="hero-cta">Shop Now</a>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
              alt="Featured product"
            />
          </div>
        </div>
      </section>

      <h2 className="section-title">Featured Collection</h2>
      <div className="collection-strip">
        {products.slice(0, 6).map((product) => (
          <div key={product.id} className="collection-card" onClick={() => handleBuyNow(product)}>
            <img
              src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/200x130?text=No+Image'}
              alt={product.title}
            />
            <p className="collection-card-name">{product.title}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">All Products</h2>

      {loading ? (
        <p className="loading-state">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products found.</p>
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

export default Home;