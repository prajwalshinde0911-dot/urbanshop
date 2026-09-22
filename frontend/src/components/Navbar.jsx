import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <div className="navbar-wrapper">
      <div className="announcement-bar">
        Discover top-rated products from trusted sellers — new arrivals daily
      </div>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">Urbanshop</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/products" className="navbar-link">Shop</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
        </div>
        <div className="navbar-icons">
          <button className="navbar-icon-btn" title="Wishlist">♡</button>
          <button className="navbar-icon-btn" title="Account">👤</button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;