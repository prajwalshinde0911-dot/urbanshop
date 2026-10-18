import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { logEvent } from '../api/analytics';
import ProductGrid from '../components/ProductGrid';
import { PLACEHOLDER_IMAGE } from '../constants';
import useSeo from '../hooks/useSeo';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useSeo('Home', 'Discover curated products from trusted sellers on Urbanshop.');

  useEffect(() => {
    logEvent('page_view');
    getCategories().then(setCategories).catch(() => {});
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-card">
          <div className="hero-text">
            <span className="hero-badge">New Arrivals</span>
            <h1>Discover Better Deals, All in One Place</h1>
            <p>
              Curated products from trusted sellers. Browse, compare, and shop with confidence. We help you find it, sellers help you get it.
            </p>
            <Link to="/products" className="hero-cta">Shop Now</Link>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
              alt="Featured product"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <>
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-row">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.id}`} className="category-chip">
                {c.name}
              </Link>
            ))}
          </div>
        </>
      )}

      {products.length > 0 && (
        <>
          <h2 className="section-title">Featured Collection</h2>
          <div className="collection-strip">
            {products.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="collection-card">
                <img
                  src={p.images && p.images[0] ? p.images[0] : PLACEHOLDER_IMAGE}
                  alt={p.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <p className="collection-card-name">{p.title}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">All Products</h2>
      <ProductGrid products={products} categories={categories} loading={loading} pageSize={6} />
    </div>
  );
}

export default Home;