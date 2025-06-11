import axios from './axios';

// Get all users (with pagination and filtering)
export const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.role) queryParams.append('role', params.role);
  if (params.search) queryParams.append('search', params.search);
  
  const response = await axios.get(`/users?${queryParams.toString()}`);
  return response.data;
};

// Get single user
export const getUserById = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

// Update user
export const updateUser = async (userId, userData) => {
  const response = await axios.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete/deactivate user
export const deleteUser = async (userId) => {
  const response = await axios.delete(`/users/${userId}`);
  return response.data;
};

// Get user analytics
export const getUserAnalytics = async () => {
  const response = await axios.get('/users/analytics');
  return response.data;
}; 