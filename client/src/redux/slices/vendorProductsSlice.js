import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';
import { toast } from 'react-toastify';

// Async thunk for fetching vendor products
export const fetchVendorProducts = createAsyncThunk(
  'vendorProducts/fetchVendorProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for creating a new product
export const createProduct = createAsyncThunk(
  'vendorProducts/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await vendorApi.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for updating a product
export const updateProduct = createAsyncThunk(
  'vendorProducts/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.updateProduct(id, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for deleting a product
export const deleteProduct = createAsyncThunk(
  'vendorProducts/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await vendorApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for updating product status
export const updateProductStatus = createAsyncThunk(
  'vendorProducts/updateProductStatus',
  async ({ id, published }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.updateProductStatus(id, published);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for updating product stock
export const updateProductStock = createAsyncThunk(
  'vendorProducts/updateProductStock',
  async ({ id, stockCount }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.updateProductStock(id, stockCount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  products: [],
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  statusCounts: {
    total: 0,
    published: 0,
    draft: 0,
    lowStock: 0,
    outOfStock: 0
  },
  selectedProduct: null,
  loading: false,
  error: null,
  success: false,
  filters: {
    page: 1,
    limit: 10,
    sort: '-createdAt',
    published: undefined,
    category: '',
    stockStatus: '',
    search: ''
  }
};

// Create the slice
const vendorProductsSlice = createSlice({
  name: 'vendorProducts',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products cases
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
        state.statusCounts = action.payload.statusCounts || initialState.statusCounts;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch products';
        toast.error(state.error);
      })
      
      // Create product cases
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = [action.payload.data, ...state.products];
        state.statusCounts.total += 1;
        if (action.payload.data.published) {
          state.statusCounts.published += 1;
        } else {
          state.statusCounts.draft += 1;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create product';
        state.success = false;
      })
      
      // Update product cases
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update the product in the list
        const index = state.products.findIndex((p) => p._id === action.payload.data._id);
        if (index !== -1) {
          state.products[index] = action.payload.data;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update product';
        state.success = false;
      })
      
      // Delete product cases
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Remove the product from the list
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.statusCounts.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete product';
        state.success = false;
      })
      
      // Update product status cases
      .addCase(updateProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the product status in the list
        const index = state.products.findIndex((p) => p._id === action.payload.data._id);
        if (index !== -1) {
          // Track status change for counter updates
          const wasPublished = state.products[index].published;
          const isPublished = action.payload.data.published;
          
          // Update the product
          state.products[index] = action.payload.data;
          
          // Update status counts
          if (wasPublished && !isPublished) {
            state.statusCounts.published -= 1;
            state.statusCounts.draft += 1;
          } else if (!wasPublished && isPublished) {
            state.statusCounts.published += 1;
            state.statusCounts.draft -= 1;
          }
        }
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update product status';
        toast.error(state.error);
      })
      
      // Update product stock cases
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the product stock in the list
        const index = state.products.findIndex((p) => p._id === action.payload.data._id);
        if (index !== -1) {
          // Track stock changes for counter updates
          const oldStock = state.products[index].stockCount;
          const newStock = action.payload.data.stockCount;
          
          // Update the product
          state.products[index] = action.payload.data;
          
          // Update low stock and out of stock counts
          if (oldStock === 0 && newStock > 0) {
            state.statusCounts.outOfStock -= 1;
            if (newStock < 10) {
              state.statusCounts.lowStock += 1;
            }
          } else if (oldStock > 0 && newStock === 0) {
            if (oldStock < 10) {
              state.statusCounts.lowStock -= 1;
            }
            state.statusCounts.outOfStock += 1;
          } else if (oldStock >= 10 && newStock < 10 && newStock > 0) {
            state.statusCounts.lowStock += 1;
          } else if (oldStock < 10 && oldStock > 0 && newStock >= 10) {
            state.statusCounts.lowStock -= 1;
          }
        }
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update product stock';
        toast.error(state.error);
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearError, clearSuccess } = vendorProductsSlice.actions;
export default vendorProductsSlice.reducer; 