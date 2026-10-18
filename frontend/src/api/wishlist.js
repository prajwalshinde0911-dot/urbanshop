import apiClient from './client';

export const getWishlist = async () => (await apiClient.get('/wishlist/')).data;

export const addToWishlist = async (product_id) =>
  (await apiClient.post('/wishlist/', { product_id })).data;

export const removeFromWishlist = async (product_id) =>
  (await apiClient.delete(`/wishlist/${product_id}`)).data;