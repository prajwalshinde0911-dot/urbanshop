import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { logEvent } from '../api/analytics';
import ProductGrid from '../components/ProductGrid';
import useDebounce from '../hooks/useDebounce';
import useSeo from '../hooks/useSeo';
import './ProductListing.css';

function ProductListing() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const dSearch = useDebounce(search);
  const dLocation = useDebounce(location);
  const dMin = useDebounce(minPrice);
  const dMax = useDebounce(maxPrice);

  useSeo('Shop', 'Search and filter products by category, price and location.');

  useEffect(() => {
    logEvent('page_view');
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setCategoryId(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({
      search: dSearch || undefined,
      category_id: categoryId || undefined,
      min_price: dMin || undefined,
      max_price: dMax || undefined,
      location: dLocation || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    })
      .then((data) => !cancelled && setProducts(data))
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dSearch, categoryId, dMin, dMax, dLocation, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  return (
    <div className="listing-page">
      <h1 className="listing-title">All Products</h1>

      <div className="filters-bar">
        <input className="filter-input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />

        <select className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input className="filter-input filter-input-small" type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="filter-input filter-input-small" type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <input className="filter-input" placeholder="Location..." value={location} onChange={(e) => setLocation(e.target.value)} />

        <select
          className="filter-select"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
        >
          <option value="created_at-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="title-asc">Name: A to Z</option>
        </select>

        <button className="btn-outline" onClick={clearFilters}>Clear</button>
      </div>

      {!loading && <p className="result-count">{products.length} product{products.length === 1 ? '' : 's'} found</p>}

      <ProductGrid
        products={products}
        categories={categories}
        loading={loading}
        pageSize={8}
        emptyMessage="No products match your filters."
      />
    </div>
  );
}

export default ProductListing;