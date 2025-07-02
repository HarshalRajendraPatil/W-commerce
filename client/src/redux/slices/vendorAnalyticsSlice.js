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
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch analytics data');
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
      // Reset pagination when changing time frame
      state.pagination.products.current = 1;
      state.pagination.categories.current = 1;
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
        
        // Ensure data exists and has the expected structure
        if (action.payload && action.payload.data) {
          // Handle sales data
          if (action.payload.data.sales) {
            state.data.sales = {
              data: Array.isArray(action.payload.data.sales.data) ? action.payload.data.sales.data : [],
              total: action.payload.data.sales.total || 0,
              growth: action.payload.data.sales.growth || 0
            };
          }
          
          // Handle orders data
          if (action.payload.data.orders) {
            state.data.orders = {
              data: Array.isArray(action.payload.data.orders.data) ? action.payload.data.orders.data : [],
              total: action.payload.data.orders.total || 0,
              growth: action.payload.data.orders.growth || 0
            };
          }
          
          // Handle products data
          if (action.payload.data.products) {
            state.data.products = {
              total: action.payload.data.products.total || 0,
              published: action.payload.data.products.published || 0,
              outOfStock: action.payload.data.products.outOfStock || 0
            };
          }
          
          // Handle top products
          state.data.topProducts = Array.isArray(action.payload.data.topProducts) ? action.payload.data.topProducts : [];
          
          // Handle revenue by category
          state.data.revenueByCategory = Array.isArray(action.payload.data.revenueByCategory) ? action.payload.data.revenueByCategory : [];
        }
        
        // Handle pagination
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchVendorAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analytics data';
      });
  }
});

export const { setTimeFrame, setProductsPage, setCategoriesPage } = vendorAnalyticsSlice.actions;
export default vendorAnalyticsSlice.reducer; 