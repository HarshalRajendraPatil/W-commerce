import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/userService';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async ({ page = 1, limit = 10, search = '', role = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers({ page, limit, search, role, status, sortBy, sortOrder });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.deactivateUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate user');
    }
  }
);

export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.activateUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate user');
    }
  }
);

export const fetchUserAnalytics = createAsyncThunk(
  'user/fetchUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user analytics');
    }
  }
);

// Initial state
const initialState = {
  users: [],
  userDetails: null,
  userAnalytics: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          current: action.payload.pagination.current,
          total: action.payload.pagination.total,
          count: action.payload.pagination.count,
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.userDetails?._id === action.payload._id) {
          state.userDetails = action.payload;
        }
        toast.success('User updated successfully');
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        toast.success('User deleted successfully');
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Activate user
      .addCase(activateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.users = state.users.map(user => 
          user._id === action.payload.data._id ? { ...user, active: true } : user
        );
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Deactivate user
      .addCase(deactivateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.users = state.users.map(user => 
          user._id === action.payload.data._id ? { ...user, active: false } : user
        );
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch User Analytics
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnalytics = action.payload;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError, clearUserDetails } = userSlice.actions;
export default userSlice.reducer; 