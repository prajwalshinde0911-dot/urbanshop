import apiClient from './client';

export const signupRequest = async (email, password, full_name) =>
  (await apiClient.post('/auth/signup', { email, password, full_name })).data;

export const loginRequest = async (email, password) =>
  (await apiClient.post('/auth/login', { email, password })).data;

export const getMe = async () => (await apiClient.get('/auth/me')).data;

export const forgotPasswordRequest = async (email) =>
  (
    await apiClient.post('/auth/forgot-password', {
      email,
      redirect_to: `${window.location.origin}/reset-password`,
    })
  ).data;

export const resetPasswordRequest = async (access_token, new_password) =>
  (await apiClient.post('/auth/reset-password', { access_token, new_password })).data;