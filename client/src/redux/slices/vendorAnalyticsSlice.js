import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';

// Async thunks
export const fetchVendorAnalytics = createAsyncThunk(
  'vendorAnalytics/fetchVendorAnalytics',
  async ({ timeFrame, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorAnalytics(timeFrame, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  data: {
    sales: {
      data: [],
      total: 0,
      growth: 0
    },
    orders: {
      data: [],
      total: 0,
      growth: 0
    },
    products: {
      total: 0,
      published: 0,
      outOfStock: 0
    },
    topProducts: [],
    revenueByCategory: []
  },
  pagination: {
    products: {
      current: 1,
      total: 1,
      count: 0
    },
    categories: {
      current: 1,
      total: 1,
      count: 0
    }
  },
  loading: false,
  error: null,
  timeFrame: '30days'
};

// Slice
const vendorAnalyticsSlice = createSlice({
  name: 'vendorAnalytics',
  initialState,
  reducers: {
    setTimeFrame: (state, action) => {
      state.timeFrame = action.payload;
    },
    setProductsPage: (state, action) => {
      state.pagination.products.current = action.payload;
    },
    setCategoriesPage: (state, action) => {
      state.pagination.categories.current = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchVendorAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics data';
      });
  }
});

export const { setTimeFrame, setProductsPage, setCategoriesPage } = vendorAnalyticsSlice.actions;
export default vendorAnalyticsSlice.reducer; 