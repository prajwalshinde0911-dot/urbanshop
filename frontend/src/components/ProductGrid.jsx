import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import './Product.css';

function ProductGrid({ products, categories = [], loading = false, pageSize = 8, emptyMessage }) {
  const [page, setPage] = useState(1);
  const topRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [products]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const visible = products.slice((page - 1) * pageSize, page * pageSize);

  const goTo = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: pageSize }).map((_, i) => (
          <div key={i} className="product-card skeleton-card">
            <div className="skeleton skeleton-img" />
            <div className="product-info">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="empty-state">{emptyMessage || 'No products found.'}</p>;
  }

  return (
    <div ref={topRef}>
      <div className="product-grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} categoryName={categoryMap[p.category_id]} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => goTo(page - 1)}>← Prev</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => goTo(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => goTo(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;