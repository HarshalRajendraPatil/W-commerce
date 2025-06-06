import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reviewService from '../../api/reviewService';

// Async thunks
export const getReviews = createAsyncThunk(
  'review/getReviews',
  async ({ page, limit, productId }, { rejectWithValue }) => {
    try {
      return await reviewService.getReviews(page, limit, productId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const getReviewById = createAsyncThunk(
  'review/getReviewById',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await reviewService.getReviewById(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review');
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      return await reviewService.createReview(reviewData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      return await reviewService.updateReview(reviewId, reviewData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await reviewService.deleteReview(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const likeReview = createAsyncThunk(
  'review/likeReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await reviewService.likeReview(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like review');
    }
  }
);

// Admin thunks
export const approveReview = createAsyncThunk(
  'review/approveReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await reviewService.approveReview(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve review');
    }
  }
);

export const rejectReview = createAsyncThunk(
  'review/rejectReview',
  async ({ reviewId, rejectionReason }, { rejectWithValue }) => {
    try {
      return await reviewService.rejectReview(reviewId, rejectionReason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject review');
    }
  }
);

export const getProductReviewAnalytics = createAsyncThunk(
  'review/getProductReviewAnalytics',
  async (productId, { rejectWithValue }) => {
    try {
      return await reviewService.getProductReviewAnalytics(productId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review analytics');
    }
  }
);

export const getReviewAnalyticsOverview = createAsyncThunk(
  'review/getReviewAnalyticsOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await reviewService.getReviewAnalyticsOverview();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review analytics');
    }
  }
);

const initialState = {
  reviews: [],
  currentReview: null,
  reviewAnalytics: null,
  productReviews: {},
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  loading: false,
  error: null,
  success: false,
  successMessage: '',
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearReviewSuccess: (state) => {
      state.success = false;
      state.successMessage = '';
    },
    resetReviewState: (state) => {
      state.currentReview = null;
      state.error = null;
      state.success = false;
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Reviews
      .addCase(getReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.pagination = action.payload.pagination;
        
        // If product ID was provided, store in productReviews
        if (action.meta.arg.productId) {
          state.productReviews[action.meta.arg.productId] = action.payload.data;
        }
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Review By Id
      .addCase(getReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
        state.success = true;
        state.successMessage = action.payload.message || 'Review submitted successfully';
        
        // Add to reviews list if product matches
        if (state.reviews.length > 0 && action.payload.data.product) {
          const productId = action.payload.data.product;
          if (state.productReviews[productId]) {
            state.productReviews[productId] = [
              action.payload.data,
              ...state.productReviews[productId]
            ];
          }
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
        state.success = true;
        state.successMessage = action.payload.message || 'Review updated successfully';
        
        // Update in reviews list if present
        if (state.reviews.length > 0) {
          state.reviews = state.reviews.map(review => 
            review._id === action.payload.data._id ? action.payload.data : review
          );
        }
        
        // Update in product reviews if present
        if (action.payload.data.product) {
          const productId = action.payload.data.product;
          if (state.productReviews[productId]) {
            state.productReviews[productId] = state.productReviews[productId].map(review => 
              review._id === action.payload.data._id ? action.payload.data : review
            );
          }
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Review deleted successfully';
        
        // Remove from reviews list if present
        if (state.reviews.length > 0) {
          state.reviews = state.reviews.filter(review => review._id !== action.meta.arg);
        }
        
        // Remove from product reviews if present
        if (state.currentReview?.product) {
          const productId = state.currentReview.product;
          if (state.productReviews[productId]) {
            state.productReviews[productId] = state.productReviews[productId].filter(
              review => review._id !== action.meta.arg
            );
          }
        }
        
        state.currentReview = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Like Review
      .addCase(likeReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeReview.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in current review if it matches
        if (state.currentReview && state.currentReview._id === action.payload.data._id) {
          state.currentReview = action.payload.data;
        }
        
        // Update in reviews list if present
        if (state.reviews.length > 0) {
          state.reviews = state.reviews.map(review => 
            review._id === action.payload.data._id ? action.payload.data : review
          );
        }
        
        // Update in product reviews if present
        if (action.payload.data.product) {
          const productId = action.payload.data.product;
          if (state.productReviews[productId]) {
            state.productReviews[productId] = state.productReviews[productId].map(review => 
              review._id === action.payload.data._id ? action.payload.data : review
            );
          }
        }
      })
      .addCase(likeReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin: Approve Review
      .addCase(approveReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Review approved successfully';
        
        // Update current review if it matches
        if (state.currentReview && state.currentReview._id === action.payload.data._id) {
          state.currentReview = action.payload.data;
        }
        
        // Update in reviews list if present
        if (state.reviews.length > 0) {
          state.reviews = state.reviews.map(review => 
            review._id === action.payload.data._id ? action.payload.data : review
          );
        }
      })
      .addCase(approveReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin: Reject Review
      .addCase(rejectReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Review rejected successfully';
        
        // Update current review if it matches
        if (state.currentReview && state.currentReview._id === action.payload.data._id) {
          state.currentReview = action.payload.data;
        }
        
        // Update in reviews list if present
        if (state.reviews.length > 0) {
          state.reviews = state.reviews.map(review => 
            review._id === action.payload.data._id ? action.payload.data : review
          );
        }
      })
      .addCase(rejectReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Product Review Analytics
      .addCase(getProductReviewAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviewAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewAnalytics = {
          ...state.reviewAnalytics,
          product: action.payload.data
        };
      })
      .addCase(getProductReviewAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Review Analytics Overview
      .addCase(getReviewAnalyticsOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewAnalytics = {
          ...state.reviewAnalytics,
          overview: action.payload.data
        };
      })
      .addCase(getReviewAnalyticsOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReviewError, clearReviewSuccess, resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer; 