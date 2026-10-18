import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3 className="footer-logo">Urbanshop</h3>
          <p className="footer-text">
            Curated products from trusted sellers. Purchases are completed on the seller's website.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/products">Shop</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/services">Services</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
      <p className="footer-copy">© 2026 Urbanshop · AIMLCore.com</p>
    </footer>
  );
}

export default Footer;