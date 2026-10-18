import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { logEvent } from '../api/analytics';
import { useWishlist } from '../context/WishlistContext';
import { PLACEHOLDER_IMAGE } from '../constants';
import useSeo from '../hooks/useSeo';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { isSaved, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState('loading');

  useSeo(product?.title, product?.description?.slice(0, 150));

  useEffect(() => {
    setStatus('loading');
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
        setStatus('ok');
        logEvent('product_view', id);
      })
      .catch(() => setStatus('notfound'));
    getCategories().then(setCategories).catch(() => {});
  }, [id]);

  if (status === 'loading') return <p className="loading-state">Loading product...</p>;

  if (status === 'notfound') {
    return (
      <div className="notfound">
        <h1>Oops</h1>
        <p>This product doesn't exist or is no longer available.</p>
        <Link to="/products" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const category = categories.find((c) => c.id === product.category_id);
  const saved = isSaved(product.id);

  const handleBuyNow = () => {
    logEvent('reseller_click', product.id);
    window.open(product.reseller_link, '_blank', 'noopener,noreferrer');
  };

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className="detail">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / {product.title}
      </p>

      <div className="detail-grid">
        <div>
          <img className="gallery-main" src={images[activeImage]} alt={product.title} onError={onImgError} />
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  className={`gallery-thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  onError={onImgError}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="product-category">{category?.name || 'General'}</span>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</p>

          <div className="detail-meta">
            <div><span>Location:</span> {product.location || 'Not specified'}</div>
            <div><span>Category:</span> {category?.name || 'General'}</div>
            <div><span>Availability:</span> {product.is_active ? 'Available' : 'Unavailable'}</div>
          </div>

          <p className="detail-desc">{product.description || 'No description provided.'}</p>

          <div className="detail-actions">
            <button className="btn-primary" onClick={handleBuyNow}>Buy Now</button>
            <button className="btn-outline" onClick={() => toggle(product.id)}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>

          <p className="detail-note">
            Buy Now takes you to the seller's website in a new tab. Your purchase is completed there, not on Urbanshop.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;