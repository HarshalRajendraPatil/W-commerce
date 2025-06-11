import axios from './axios';

// Get all coupons (with pagination and filtering)
export const getCoupons = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.search) queryParams.append('search', params.search);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.type) queryParams.append('type', params.type);
  
  const response = await axios.get(`/coupons?${queryParams.toString()}`);
  return response.data;
};

// Get single coupon
export const getCouponById = async (couponId) => {
  const response = await axios.get(`/coupons/${couponId}`);
  return response.data;
};

// Create coupon
export const createCoupon = async (couponData) => {
  const response = await axios.post('/coupons', couponData);
  return response.data;
};

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  const response = await axios.put(`/coupons/${couponId}`, couponData);
  return response.data;
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  const response = await axios.delete(`/coupons/${couponId}`);
  return response.data;
};

// Get coupon analytics
export const getCouponAnalytics = async () => {
  const response = await axios.get('/coupons/analytics');
  return response.data;
};

// Validate coupon
export const validateCoupon = async (code, cartTotal) => {
  const response = await axios.post('/coupons/validate', { code, cartTotal });
  return response.data;
};

// Get coupon stats
export const getCouponStats = async (couponId) => {
  const response = await axios.get(`/coupons/${couponId}/stats`);
  return response.data;
};