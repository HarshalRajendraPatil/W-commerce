import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';

// Async thunks
export const fetchVendorReviews = createAsyncThunk(
  'vendorReviews/fetchVendorReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const respondToReview = createAsyncThunk(
  'vendorReviews/respondToReview',
  async ({ reviewId, response }, { rejectWithValue }) => {
    try {
      const result = await vendorApi.respondToReview(reviewId, response);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  reviews: [],
  ratingStats: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    total: 0,
    average: 0
  },
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  loading: false,
  error: null,
  success: false,
  currentReview: null
};

// Slice
const vendorReviewsSlice = createSlice({
  name: 'vendorReviews',
  initialState,
  reducers: {
    resetReviewState: (state) => {
      state.success = false;
      state.error = null;
    },
    setCurrentReview: (state, action) => {
      state.currentReview = action.payload;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendor reviews
      .addCase(fetchVendorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.ratingStats = action.payload.ratingStats || initialState.ratingStats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reviews';
      })
      
      // Respond to review
      .addCase(respondToReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(respondToReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update the review in the list
        const index = state.reviews.findIndex(r => r._id === action.payload.data._id);
        if (index !== -1) {
          state.reviews[index] = action.payload.data;
        }
        
        // Update currentReview if it's the same review
        if (state.currentReview && state.currentReview._id === action.payload.data._id) {
          state.currentReview = action.payload.data;
        }
      })
      .addCase(respondToReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to respond to review';
        state.success = false;
      });
  }
});

export const { resetReviewState, setCurrentReview, clearCurrentReview } = vendorReviewsSlice.actions;
export default vendorReviewsSlice.reducer; 