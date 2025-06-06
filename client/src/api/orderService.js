import axios from './axios';

// Create a new order
export const createOrder = async (orderData) => {
  const response = await axios.post('/orders', orderData);
  return response.data;
};

// Get all orders for the logged-in user
export const getMyOrders = async (page = 1, limit = 10) => {
  const response = await axios.get(`/orders/my-orders?page=${page}&limit=${limit}`);
  return response.data;
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data;
};

// Check payment status of an order
export const getPaymentStatus = async (orderId) => {
  const response = await axios.get(`/orders/${orderId}/payment-status`);
  return response.data;
};

// Process payment for an order
export const processPayment = async (paymentData) => {
  const response = await axios.post('/orders/payment', paymentData);
  return response.data;
};

// Create a Razorpay order for payment
export const createRazorpayOrder = async (orderId) => {
  const response = await axios.post('/orders/create-razorpay-order', { orderId });
  return response.data;
};

// Cancel an order
export const cancelOrder = async (orderId, reason) => {
  const response = await axios.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

// Track an order by tracking number
export const trackOrder = async (trackingNumber) => {
  const response = await axios.get(`/orders/track/${trackingNumber}`);
  return response.data;
};

// Admin functions
export const getAllOrders = async (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters
  }).toString();
  
  const response = await axios.get(`/orders?${queryParams}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status, trackingNumber, note) => {
  const response = await axios.put(`/orders/${orderId}/status`, {
    status,
    trackingNumber,
    note
  });
  return response.data;
};

export const getOrderAnalytics = async () => {
  const response = await axios.get('/orders/analytics');
  return response.data;
}; 