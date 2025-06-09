import axios from './axios';

export const vendorApi = {
  // Product management
  getVendorProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.published !== undefined) queryParams.append('published', params.published);
    if (params.category) queryParams.append('category', params.category);
    if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
    if (params.search) queryParams.append('search', params.search);
    
    return axios.get(`/products/vendor/products?${queryParams.toString()}`);
  },
  
  createProduct: (productData) => {
    return axios.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateProduct: (id, productData) => {
    return axios.put(`/products/${id}`, productData);
  },
  
  deleteProduct: (id) => {
    return axios.delete(`/products/${id}`);
  },
  
  updateProductStatus: (id, published) => {
    return axios.patch(`/products/${id}/status`, { published });
  },
  
  updateProductStock: (id, stockCount) => {
    return axios.patch(`/products/${id}/stock`, { stockCount });
  },
  
  // Order management
  getVendorOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);
    
    return axios.get(`/orders/vendor?${queryParams.toString()}`);
  },
  
  getVendorOrderDetails: (id) => {
    return axios.get(`/orders/vendor/${id}`);
  },
  
  updateOrderItemFulfillment: (orderId, data) => {
    return axios.patch(`/orders/${orderId}/fulfill`, data);
  },
  
  // Review management
  getVendorReviews: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.rating) queryParams.append('rating', params.rating);
    if (params.isApproved !== undefined) queryParams.append('isApproved', params.isApproved);
    
    return axios.get(`/reviews/vendor?${queryParams.toString()}`);
  },
  
  respondToReview: (reviewId, response) => {
    return axios.post(`/reviews/${reviewId}/respond`, { response });
  },
  
  // Dashboard & Analytics
  getVendorDashboardStats: () => {
    return axios.get('/dashboard/vendor/stats');
  },
  
  getVendorSalesStats: (period = '7days') => {
    return axios.get(`/dashboard/vendor/sales?period=${period}`);
  },
  
  getVendorTopProducts: () => {
    return axios.get('/dashboard/vendor/top-products');
  },
  
  getVendorRecentOrders: () => {
    return axios.get('/dashboard/vendor/recent-orders');
  },
  
  getVendorLowStockProducts: () => {
    return axios.get('/dashboard/vendor/low-stock');
  },
  
  getVendorRecentReviews: () => {
    return axios.get('/dashboard/vendor/recent-reviews');
  },
  
  getVendorAnalytics: (timeFrame = '30days') => {
    return axios.get(`/dashboard/vendor/analytics?timeFrame=${timeFrame}`);
  }
}; 