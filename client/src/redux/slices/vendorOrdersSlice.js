import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';

// Async thunks
export const fetchVendorOrders = createAsyncThunk(
  'vendorOrders/fetchVendorOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchVendorOrderDetails = createAsyncThunk(
  'vendorOrders/fetchVendorOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorOrderDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateOrderItemFulfillment = createAsyncThunk(
  'vendorOrders/updateOrderItemFulfillment',
  async ({ orderId, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await vendorApi.updateOrderItemFulfillment(orderId, data);
      // Fetch updated order details to ensure we have the latest data
      setTimeout(() => {
        dispatch(fetchVendorOrderDetails(orderId));
      }, 300);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  statusCounts: {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  },
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  loading: false,
  detailsLoading: false,
  error: null,
  currentOrder: null,
  success: false
};

// Slice
const vendorOrdersSlice = createSlice({
  name: 'vendorOrders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendor orders
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.statusCounts = action.payload.statusCounts || initialState.statusCounts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })
      
      // Fetch order details
      .addCase(fetchVendorOrderDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrderDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchVendorOrderDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch order details';
      })
      
      // Update order item fulfillment
      .addCase(updateOrderItemFulfillment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderItemFulfillment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Correctly update the current order with the response data
        if (action.payload && action.payload.data) {
          state.currentOrder = action.payload.data;
        }
        
        // Update order in the list if it exists
        if (action.payload && action.payload.data && state.orders.length > 0) {
          const index = state.orders.findIndex(order => order._id === action.payload.data._id);
          if (index !== -1) {
            state.orders[index] = action.payload.data;
          }
        }
      })
      .addCase(updateOrderItemFulfillment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update order status';
        state.success = false;
      });
  }
});

export const { resetOrderState, clearCurrentOrder } = vendorOrdersSlice.actions;
export default vendorOrdersSlice.reducer; 