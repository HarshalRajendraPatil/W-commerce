import axios from './axios.js';

const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const response = await axios.get('/categories', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single category by ID or slug
  getCategory: async (id) => {
    try {
      const response = await axios.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured categories
  getFeaturedCategories: async (limit = 5) => {
    try {
      const response = await axios.get('/categories/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new category (Admin only)
  createCategory: async (categoryData) => {
    try {
      const formData = new FormData();
      
      // Handle category image if provided
      if (categoryData.image && categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
        delete categoryData.image;
      }
      
      // Append other category data
      Object.keys(categoryData).forEach(key => {
        formData.append(key, categoryData[key]);
      });
      
      const response = await axios.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a category (Admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const formData = new FormData();
      
      // Handle category image if provided
      if (categoryData.image && categoryData.image instanceof File) {
        formData.append('image', categoryData.image);
        delete categoryData.image;
      }
      
      // Append other category data
      Object.keys(categoryData).forEach(key => {
        // Skip null values or convert them appropriately
        if (categoryData[key] === null) {
          if (key === 'parent') {
            // Send 'null' string for parent to be converted to null on server
            formData.append(key, 'null');
          }
          // Skip other null values
        } else {
          formData.append(key, categoryData[key]);
        }
      });
      
      const response = await axios.put(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a category (Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default categoryService; 