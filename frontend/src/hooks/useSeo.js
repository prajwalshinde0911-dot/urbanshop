import { useEffect } from 'react';

export default function useSeo(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | Urbanshop` : 'Urbanshop';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description || 'Urbanshop: curated products from trusted sellers.';
  }, [title, description]);
}