import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as couponService from '../../api/couponService';
import { toast } from 'react-toastify';

// Async thunks
export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (params, { rejectWithValue }) => {
    try {
      return await couponService.getCoupons(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

export const fetchCouponById = createAsyncThunk(
  'coupons/fetchCouponById',
  async (couponId, { rejectWithValue }) => {
    try {
      return await couponService.getCouponById(couponId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupon');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      return await couponService.createCoupon(couponData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ couponId, couponData }, { rejectWithValue }) => {
    try {
      return await couponService.updateCoupon(couponId, couponData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (couponId, { rejectWithValue }) => {
    try {
      return await couponService.deleteCoupon(couponId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

export const fetchCouponAnalytics = createAsyncThunk(
  'coupons/fetchCouponAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await couponService.getCouponAnalytics();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupon analytics');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'coupons/validateCoupon',
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      return await couponService.validateCoupon(code, cartTotal);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

export const fetchCouponStats = createAsyncThunk(
  'coupons/fetchCouponStats',
  async (couponId, { rejectWithValue }) => {
    try {
      return await couponService.getCouponStats(couponId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupon stats');
    }
  }
);

// Initial state
const initialState = {
  coupons: [],
  couponDetails: null,
  couponAnalytics: null,
  validatedCoupon: null,
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  loading: false,
  error: null,
  success: false,
  message: ''
};

// Create slice
const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },
    clearCouponSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetCouponState: (state) => {
      state.couponDetails = null;
      state.validatedCoupon = null;
      state.error = null;
      state.success = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch coupon by ID
      .addCase(fetchCouponById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.loading = false;
        state.couponDetails = action.payload.data;
      })
      .addCase(fetchCouponById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.unshift(action.payload.data);
        state.success = true;
        state.message = 'Coupon created successfully';
        toast.success('Coupon created successfully');
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.couponDetails = action.payload.data;
        state.coupons = state.coupons.map(coupon => 
          coupon._id === action.payload.data._id ? action.payload.data : coupon
        );
        state.success = true;
        state.message = 'Coupon updated successfully';
        toast.success('Coupon updated successfully');
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(
          coupon => coupon._id !== action.meta.arg
        );
        state.success = true;
        state.message = 'Coupon deleted successfully';
        toast.success('Coupon deleted successfully');
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch coupon analytics
      .addCase(fetchCouponAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.couponAnalytics = action.payload.data;
      })
      .addCase(fetchCouponAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.validatedCoupon = action.payload.data;
        state.success = true;
        toast.success('Coupon applied successfully');
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.validatedCoupon = null;
        toast.error(action.payload);
      })
      // Fetch individual coupon stats
      .addCase(fetchCouponStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponStats.fulfilled, (state, action) => {
        state.loading = false;
        state.couponDetails = {
          ...state.couponDetails,
          stats: action.payload.data
        };
      })
      .addCase(fetchCouponStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCouponError, clearCouponSuccess, resetCouponState } = couponSlice.actions;
export default couponSlice.reducer; 