import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';

// Async thunk for fetching product statistics
export const fetchProductStats = createAsyncThunk(
  'productStats/fetchProductStats',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getProductStats(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for updating product stock
export const updateProductStock = createAsyncThunk(
  'productStats/updateProductStock',
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
  productId: null,
  basicInfo: null,
  reviewStats: null,
  recentReviews: [],
  orderStats: null,
  monthlySales: [],
  loading: false,
  error: null,
  stockUpdateLoading: false,
  stockUpdateError: null,
  stockUpdateSuccess: false
};

// Create the slice
const productStatsSlice = createSlice({
  name: 'productStats',
  initialState,
  reducers: {
    clearProductStats: (state) => {
      return initialState;
    },
    clearStockUpdateStatus: (state) => {
      state.stockUpdateLoading = false;
      state.stockUpdateError = null;
      state.stockUpdateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch product stats cases
      .addCase(fetchProductStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.productId = action.payload.data.basicInfo.id;
        state.basicInfo = action.payload.data.basicInfo;
        state.reviewStats = action.payload.data.reviewStats;
        state.recentReviews = action.payload.data.recentReviews;
        state.orderStats = action.payload.data.orderStats;
        state.monthlySales = action.payload.data.monthlySales;
      })
      .addCase(fetchProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch product statistics';
      })
      
      // Update product stock cases
      .addCase(updateProductStock.pending, (state) => {
        state.stockUpdateLoading = true;
        state.stockUpdateError = null;
        state.stockUpdateSuccess = false;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.stockUpdateLoading = false;
        state.stockUpdateSuccess = true;
        // Update the basic info with the new stock count
        if (state.basicInfo && action.payload.data._id === state.productId) {
          state.basicInfo.stockCount = action.payload.data.stockCount;
        }
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.stockUpdateLoading = false;
        state.stockUpdateError = action.payload?.message || 'Failed to update stock';
        state.stockUpdateSuccess = false;
      });
  }
});

export const { clearProductStats, clearStockUpdateStatus } = productStatsSlice.actions;
export default productStatsSlice.reducer; 