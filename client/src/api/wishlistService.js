import axios from './axios';

const wishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    try {
      const response = await axios.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await axios.post('/wishlist', { productId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if product is in wishlist
  isInWishlist: async (productId) => {
    try {
      const response = await axios.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await axios.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    try {
      const response = await axios.delete('/wishlist');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default wishlistService; 