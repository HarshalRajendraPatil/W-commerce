import axios from './axios.js';

const productService = {
  // Get all products with optional filtering
  getProducts: async (params = {}) => {
    try {
      const response = await axios.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single product by ID
  getProduct: async (id) => {
    try {
      const response = await axios.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await axios.get(`/products/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 5) => {
    try {
      const response = await axios.get('/products/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle featured status
  toggleFeaturedStatus: async (id) => {
    try {
      const response = await axios.patch(`/products/${id}/featured`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get top-rated products
  getTopRatedProducts: async (limit = 5) => {
    try {
      const response = await axios.get('/products/top-rated', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await axios.get('/products/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 5) => {
    try {
      const response = await axios.get(`/products/${productId}/related`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await axios.get(`/products/${productId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new product (Admin/Vendor only)
  createProduct: async (productData) => {
    try {
      const response = await axios.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create product' };
    }
  },

  // Update a product (Admin/Vendor only)
  updateProduct: async (id, productData) => {
    try {
      const response = await axios.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product (Admin/Vendor only)
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload product images (Admin/Vendor only)
  uploadProductImages: async (productId, imageFiles) => {
    try {
      const formData = new FormData();
      
      // Handle multiple files
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('images', imageFiles);
      }
      
      const response = await axios.post(`/uploads/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set product image as primary (Admin/Vendor only)
  setPrimaryImage: async (productId, imageId) => {
    try {
      const response = await axios.put(`/uploads/products/${productId}/primary/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product image (Admin/Vendor only)
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await axios.delete(`/uploads/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default productService; 