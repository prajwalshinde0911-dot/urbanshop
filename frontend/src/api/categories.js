import apiClient from './client';

export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

export const createCategory = async (name) => {
  const response = await apiClient.post('/categories/', { name });
  return response.data;
};