import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Convert params object to URL query params
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/products", productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleFeatured = createAsyncThunk(
  'products/toggleFeatured',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Find the product in the state to get its current featured status
      const { products } = getState().product;
      const product = products.data?.find(p => p._id === id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      
      // Update the product with the opposite featured status
      const response = await axios.put(`/products/${id}`, {
        isFeatured: !product.isFeatured
      });
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  products: [],
  product: null,
  isLoading: false,
  error: null,
  success: false,
  message: ''
};

// Create slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.success = false;
      state.error = null;
      state.message = '';
    },
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to fetch products';
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to fetch product';
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
        state.success = true;
        state.message = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to create product';
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.map(product => 
          product._id === action.payload._id ? action.payload : product
        );
        state.success = true;
        state.message = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to update product';
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(product => product._id !== action.payload);
        state.success = true;
        state.message = 'Product deleted successfully';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to delete product';
      })
      
      // Toggle featured status
      .addCase(toggleFeatured.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.data?.map(product => 
          product._id === action.payload._id ? action.payload : product
        );
        state.success = true;
        state.message = `Product ${action.payload.isFeatured ? 'marked as featured' : 'unmarked as featured'} successfully`;
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to update featured status';
      });
  }
});

export const { resetProductState, clearProductError } = productSlice.actions;
export default productSlice.reducer; 