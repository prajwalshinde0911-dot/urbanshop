import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { logEvent } from '../api/analytics';
import { PLACEHOLDER_IMAGE } from '../constants';
import './Product.css';

function ProductCard({ product, categoryName }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);
  const image = product.images && product.images[0] ? product.images[0] : PLACEHOLDER_IMAGE;

  const handleBuyNow = () => {
    logEvent('reseller_click', product.id);
    window.open(product.reseller_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img
          className="product-image"
          src={image}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
      </Link>
      <div className="product-info">
        <span className="product-category">{categoryName || 'General'}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>
        <p className="product-location">📍 {product.location || 'Location not specified'}</p>
        <p className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
        <div className="product-actions">
          <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
          <button
            className={`wishlist-btn ${saved ? 'saved' : ''}`}
            onClick={() => toggle(product.id)}
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>
        <p className="external-note">You'll complete your purchase on the seller's site</p>
      </div>
    </div>
  );
}

export default ProductCard;