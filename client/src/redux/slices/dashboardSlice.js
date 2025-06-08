import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../api/dashboardService';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  stats: null,
  salesData: [],
  topProducts: [],
  recentOrders: [],
  userStats: null,
  lowStockProducts: [],
  recentReviews: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Admin: Get dashboard statistics
export const getDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getDashboardStats();
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch dashboard statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get vendor dashboard statistics
export const getVendorDashboardStats = createAsyncThunk(
  'dashboard/getVendorStats',
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getVendorDashboardStats();
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vendor dashboard statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get sales statistics
export const getSalesStats = createAsyncThunk(
  'dashboard/getSales',
  async (period, thunkAPI) => {
    try {
      return await dashboardService.getSalesStats(period);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch sales statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get vendor sales statistics
export const getVendorSalesStats = createAsyncThunk(
  'dashboard/getVendorSales',
  async (period, thunkAPI) => {
    try {
      return await dashboardService.getVendorSalesStats(period);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vendor sales statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get top selling products
export const getTopProducts = createAsyncThunk(
  'dashboard/getTopProducts',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getTopProducts(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch top products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get vendor's top selling products
export const getVendorTopProducts = createAsyncThunk(
  'dashboard/getVendorTopProducts',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getVendorTopProducts(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vendor top products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get recent orders
export const getRecentOrders = createAsyncThunk(
  'dashboard/getRecentOrders',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getRecentOrders(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch recent orders';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get vendor's recent orders
export const getVendorRecentOrders = createAsyncThunk(
  'dashboard/getVendorRecentOrders',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getVendorRecentOrders(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vendor recent orders';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get user statistics
export const getUserStats = createAsyncThunk(
  'dashboard/getUserStats',
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getUserStats();
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch user statistics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get low stock products
export const getVendorLowStockProducts = createAsyncThunk(
  'dashboard/getVendorLowStock',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getVendorLowStockProducts(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch low stock products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Vendor: Get recent reviews
export const getVendorRecentReviews = createAsyncThunk(
  'dashboard/getVendorRecentReviews',
  async (limit, thunkAPI) => {
    try {
      return await dashboardService.getVendorRecentReviews(limit);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch recent reviews';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin: Get dashboard stats
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get vendor dashboard stats
      .addCase(getVendorDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getVendorDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Admin: Get sales stats
      .addCase(getSalesStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSalesStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.salesData = action.payload;
      })
      .addCase(getSalesStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get vendor sales stats
      .addCase(getVendorSalesStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorSalesStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.salesData = action.payload;
      })
      .addCase(getVendorSalesStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Admin: Get top products
      .addCase(getTopProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTopProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.topProducts = action.payload;
      })
      .addCase(getTopProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get vendor top products
      .addCase(getVendorTopProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorTopProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.topProducts = action.payload;
      })
      .addCase(getVendorTopProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Admin: Get recent orders
      .addCase(getRecentOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecentOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recentOrders = action.payload;
      })
      .addCase(getRecentOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get vendor recent orders
      .addCase(getVendorRecentOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorRecentOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recentOrders = action.payload;
      })
      .addCase(getVendorRecentOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Admin: Get user stats
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userStats = action.payload;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get low stock products
      .addCase(getVendorLowStockProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorLowStockProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lowStockProducts = action.payload;
      })
      .addCase(getVendorLowStockProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Vendor: Get recent reviews
      .addCase(getVendorRecentReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVendorRecentReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recentReviews = action.payload;
      })
      .addCase(getVendorRecentReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset } = dashboardSlice.actions;
export default dashboardSlice.reducer; 