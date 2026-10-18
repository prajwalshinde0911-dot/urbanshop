import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { getCategories } from '../api/categories';
import ProductGrid from '../components/ProductGrid';
import useSeo from '../hooks/useSeo';

function Wishlist() {
  const { items, loaded } = useWishlist();
  const [categories, setCategories] = useState([]);
  useSeo('My Wishlist');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const products = items.map((i) => i.products).filter(Boolean);

  return (
    <div className="page">
      <h1 className="page-title">My Wishlist</h1>
      <p className="page-sub">Products you've saved for later.</p>
      <p className="notice">
        This is a save-for-later list, not a shopping cart. When you click Buy Now, you complete your purchase on the seller's website.
      </p>

      {!loaded ? (
        <ProductGrid products={[]} loading pageSize={4} />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <br />
          <Link to="/products" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <ProductGrid products={products} categories={categories} />
      )}
    </div>
  );
}

export default Wishlist;