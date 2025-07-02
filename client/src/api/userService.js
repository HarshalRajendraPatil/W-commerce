import axios from './axios';

const API_URL = '/users';

// Get all users (with pagination and filtering)
const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add pagination params
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // Add filter params
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.active !== undefined) queryParams.append('active', params.active);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.minOrders) queryParams.append('minOrders', params.minOrders);
  if (params.maxOrders) queryParams.append('maxOrders', params.maxOrders);
  
  // Add sort params
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();

  const response = await axios.get(`${API_URL}?${queryString}`);
  return response.data;
};

// Get a single user by ID
const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update user (admin only)
const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/${id}`, userData);
  return response.data;
};

// Delete user (admin only)
const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Activate user (admin only)
const activateUser = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/activate`);
  return response.data;
};

// Deactivate user (admin only)
const deactivateUser = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/deactivate`);
  return response.data;
};

// Get user analytics (admin only)
const getUserAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics`);
  return response.data;
};

// Get user profile
const getProfile = async () => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

// Update user profile
const updateProfile = async (profileData) => {
  const response = await axios.put('/auth/profile', profileData);
  return response.data;
};

// Add/update address
const updateAddress = async (addressData) => {
  const response = await axios.put('/auth/address', addressData);
  return response.data;
};

// Delete address
const deleteAddress = async (addressId) => {
  const response = await axios.delete(`/auth/address/${addressId}`);
  return response.data;
};

// Get orders for customer profile
const getMyOrders = async (page = 1, limit = 5) => {
  const response = await axios.get(`/orders/my-orders?page=${page}&limit=${limit}`);
  return response.data;
};

// Get wishlist items
const getWishlist = async (page = 1, limit = 5) => {
  const response = await axios.get(`/wishlist?page=${page}&limit=${limit}`);
  return response.data;
};

// Get reviews written by user
const getMyReviews = async (page = 1, limit = 5) => {
  const response = await axios.get(`/reviews/my?page=${page}&limit=${limit}`);
  return response.data;
};

// Vendor-specific services
// Get vendor products
const getVendorProducts = async (queryParams) => {
  const response = await axios.get(`/products/vendor/products?${queryParams}`);
  return response.data;
};

// Get vendor sales
const getVendorSales = async (period = 'month') => {
  const response = await axios.get(`/orders/vendor/sales?period=${period}`);
  return response.data;
};

// Get vendor analytics
const getVendorAnalytics = async (timeFrame = '30days', page = 1, limit = 5) => {
  const queryParams = new URLSearchParams();
  queryParams.append('timeFrame', timeFrame);
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  
  const response = await axios.get(`/dashboard/vendor/analytics?${queryParams.toString()}`);
  return response.data;
};

// Admin-specific services
// Get system stats
const getSystemStats = async () => {
  const response = await axios.get('/stats/system');
  return response.data;
};

// Get user stats for charts
const getUserStats = async () => {
  const response = await axios.get('/dashboard/user-stats');
  return response.data;
};

// Product Management
const updateProductStatus = async (productId, published) => {
  const response = await axios.patch(`/products/${productId}/status`, { published });
  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await axios.delete(`/products/${productId}`);
  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
  updateAddress,
  deleteAddress,
  getMyOrders,
  getWishlist,
  getMyReviews,
  getVendorProducts,
  getVendorSales,
  getVendorAnalytics,
  getSystemStats,
  getUserStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserAnalytics,
  updateProductStatus,
  deleteProduct
};

export default userService; 