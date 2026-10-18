import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          {isAdmin && <Link to="/admin" className="navbar-link">Admin</Link>}
        </div>
        <div className="navbar-icons">
          {user ? (
            <>
              <Link to="/wishlist" className="navbar-pill">♡ Wishlist</Link>
              <Link to="/account" className="navbar-pill">{user.full_name || 'Account'}</Link>
              <button className="navbar-pill navbar-pill-solid" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-pill">Login</Link>
              <Link to="/signup" className="navbar-pill navbar-pill-solid">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;