import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../api/orderService';
import { toast } from 'react-hot-toast';

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const prepareOrder = createAsyncThunk(
  'order/prepareOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.prepareOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to prepare order');
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'order/getMyOrders',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      return await orderService.getMyOrders(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async (trackingNumber, { rejectWithValue }) => {
    try {
      return await orderService.trackOrder(trackingNumber);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder(orderId, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const createRazorpayOrder = createAsyncThunk(
  'order/createRazorpayOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createRazorpayOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

export const processPayment = createAsyncThunk(
  'order/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await orderService.processPayment(paymentData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

// Admin thunks
export const getAllOrders = createAsyncThunk(
  'order/getAllOrders',
  async ({ page, limit, filters }, { rejectWithValue }) => {
    try {
      return await orderService.getAllOrders(page, limit, filters);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, statusData }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, statusData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const getOrderAnalytics = createAsyncThunk(
  'order/getOrderAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getOrderAnalytics();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order analytics');
    }
  }
);

// Admin: Get all orders with filtering
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Admin: Get order analytics
export const fetchOrderAnalytics = createAsyncThunk(
  'order/fetchOrderAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getOrderAnalytics();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order analytics');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  preparedOrderData: null,
  trackingInfo: null,
  paymentInfo: null,
  analytics: null,
  pagination: {
    current: 1,
    total: 1,
    count: 0
  },
  loading: false,
  error: null,
  success: false,
  successMessage: '',
  adminOrders: [],
  adminPagination: {
    current: 1,
    total: 1,
    count: 0
  },
  orderAnalytics: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.success = false;
      state.successMessage = '';
    },
    resetOrderState: (state) => {
      state.currentOrder = null;
      state.preparedOrderData = null;
      state.trackingInfo = null;
      state.paymentInfo = null;
      state.error = null;
      state.success = false;
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        state.success = true;
        state.successMessage = 'Order created successfully';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Prepare Order
      .addCase(prepareOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(prepareOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.preparedOrderData = action.payload.data.orderData;
        state.success = true;
      })
      .addCase(prepareOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get My Orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Order By Id
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingInfo = action.payload.data;
        state.success = true;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        state.success = true;
        state.successMessage = 'Order cancelled successfully';
        
        // Update in orders list if present
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order => 
            order._id === action.payload.data._id ? action.payload.data : order
          );
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Razorpay Order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentInfo = action.payload.data;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data.order;
        state.success = true;
        state.successMessage = 'Payment processed successfully';
        
        // Update in orders list if present
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order => 
            order._id === action.payload.data.order._id ? action.payload.data.order : order
          );
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin: Get All Orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin: Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.adminOrders = action.payload.data;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Admin: Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Order status updated successfully';
        
        // Update the order in the admin orders list
        if (state.adminOrders.length > 0) {
          state.adminOrders = state.adminOrders.map(order => 
            order._id === action.payload.data._id ? action.payload.data : order
          );
        }
        
        // Also update in current order if it matches
        if (state.currentOrder && state.currentOrder._id === action.payload.data._id) {
          state.currentOrder = action.payload.data;
        }
        
        toast.success('Order status updated successfully');
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Admin: Get Order Analytics
      .addCase(fetchOrderAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.orderAnalytics = action.payload.data;
      })
      .addCase(fetchOrderAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderError, clearOrderSuccess, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer; 