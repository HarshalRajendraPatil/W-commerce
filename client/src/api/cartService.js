import axios from './axios';

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await axios.get('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, selectedVariants = []) => {
    try {
      const response = await axios.post('/cart', {
        productId,
        quantity,
        selectedVariants
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await axios.put('/cart/items', {
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await axios.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await axios.delete('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply coupon to cart
  applyCoupon: async (code) => {
    try {
      const response = await axios.post('/coupons/apply', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove coupon from cart
  removeCoupon: async () => {
    try {
      const response = await axios.delete('/coupons/remove');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default cartService; 