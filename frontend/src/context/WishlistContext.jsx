import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getWishlist());
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setItems([]);
      setLoaded(false);
    }
  }, [user, refresh]);

  const isSaved = (productId) => items.some((i) => i.product_id === productId);

  const toggle = async (productId) => {
    if (!user) {
      showToast('Please log in to save products', 'error');
      navigate('/login');
      return;
    }
    try {
      if (isSaved(productId)) {
        await removeFromWishlist(productId);
        showToast('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        showToast('Saved to wishlist');
      }
      await refresh();
    } catch {
      showToast('Could not update wishlist', 'error');
    }
  };

  return (
    <WishlistContext.Provider value={{ items, loaded, isSaved, toggle, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);