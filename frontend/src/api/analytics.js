import apiClient from './client';

export const logEvent = async (eventType, productId = null) => {
  try {
    await apiClient.post('/analytics/event', {
      event_type: eventType,
      product_id: productId,
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }
};