import axios from './axios';

const dashboardService = {
  // Admin: Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await axios.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get vendor dashboard statistics
  getVendorDashboardStats: async () => {
    try {
      const response = await axios.get('/dashboard/vendor/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get sales statistics
  getSalesStats: async (period = '30days') => {
    try {
      const response = await axios.get(`/dashboard/sales?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get vendor sales statistics
  getVendorSalesStats: async (period = '30days') => {
    try {
      const response = await axios.get(`/dashboard/vendor/sales?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get top selling products
  getTopProducts: async (limit = 5) => {
    try {
      const response = await axios.get(`/dashboard/top-products?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get vendor's top selling products
  getVendorTopProducts: async (limit = 5) => {
    try {
      const response = await axios.get(`/dashboard/vendor/top-products?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get recent orders
  getRecentOrders: async (limit = 10) => {
    try {
      const response = await axios.get(`/dashboard/recent-orders?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get vendor's recent orders
  getVendorRecentOrders: async (limit = 10) => {
    try {
      const response = await axios.get(`/dashboard/vendor/recent-orders?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get user statistics
  getUserStats: async () => {
    try {
      const response = await axios.get('/dashboard/user-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get low stock products
  getVendorLowStockProducts: async (limit = 10) => {
    try {
      const response = await axios.get(`/dashboard/vendor/low-stock?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get recent reviews for vendor products
  getVendorRecentReviews: async (limit = 5) => {
    try {
      const response = await axios.get(`/dashboard/vendor/recent-reviews?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vendor: Get vendor analytics data
  getVendorAnalytics: async (timeFrame = '30days') => {
    try {
      const response = await axios.get(`/dashboard/vendor/analytics?timeFrame=${timeFrame}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService; 