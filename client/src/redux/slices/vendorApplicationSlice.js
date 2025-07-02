import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vendorApplicationService from '../../api/vendorApplicationService';
import { toast } from 'react-toastify';

const initialState = {
  applications: [],
  myApplication: null,
  currentApplication: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Submit a vendor application
export const submitApplication = createAsyncThunk(
  'vendorApplication/submit',
  async (applicationData, thunkAPI) => {
    try {
      return await vendorApplicationService.submitApplication(applicationData);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to submit application';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my application status
export const getMyApplicationStatus = createAsyncThunk(
  'vendorApplication/getMyStatus',
  async (_, thunkAPI) => {
    try {
      return await vendorApplicationService.getMyApplicationStatus();
    } catch (error) {
      // If the error is "No application found", don't treat it as an error
      // This is an expected case for users who haven't applied yet
      if (error.response?.status === 404 && 
          error.response?.data?.message === 'No application found') {
        // Return a valid response with null data instead of rejecting
        return { success: true, data: null };
      }
      
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to get application status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get all applications
export const getAllApplications = createAsyncThunk(
  'vendorApplication/getAll',
  async (params, thunkAPI) => {
    try {
      return await vendorApplicationService.getAllApplications(params);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to get applications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Get application by ID
export const getApplicationById = createAsyncThunk(
  'vendorApplication/getById',
  async (id, thunkAPI) => {
    try {
      return await vendorApplicationService.getApplicationById(id);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to get application';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Approve application
export const approveApplication = createAsyncThunk(
  'vendorApplication/approve',
  async (id, thunkAPI) => {
    try {
      return await vendorApplicationService.approveApplication(id);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to approve application';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin: Reject application
export const rejectApplication = createAsyncThunk(
  'vendorApplication/reject',
  async ({ id, rejectionReason }, thunkAPI) => {
    try {
      return await vendorApplicationService.rejectApplication(id, rejectionReason);
    } catch (error) {
      const message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to reject application';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const vendorApplicationSlice = createSlice({
  name: 'vendorApplication',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetApplicationData: (state) => {
      // Clear application data to allow reapplication
      state.myApplication = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit application
      .addCase(submitApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myApplication = action.payload;
        toast.success('Vendor application submitted successfully!');
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get my application status
      .addCase(getMyApplicationStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplication = action.payload;
      })
      .addCase(getMyApplicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        // Only set error state if it's not the "No application found" case
        if (action.payload !== 'No application found') {
          state.isError = true;
          state.message = action.payload;
        }
      })
      
      // Get all applications
      .addCase(getAllApplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.data;
      })
      .addCase(getAllApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get application by ID
      .addCase(getApplicationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Approve application
      .addCase(approveApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.applications = state.applications.map(app => 
          app._id === action.payload._id ? action.payload : app
        );
        if (state.currentApplication?._id === action.payload._id) {
          state.currentApplication = action.payload;
        }
        toast.success('Vendor application approved successfully!');
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Reject application
      .addCase(rejectApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.applications = state.applications.map(app => 
          app._id === action.payload._id ? action.payload : app
        );
        if (state.currentApplication?._id === action.payload._id) {
          state.currentApplication = action.payload;
        }
        toast.success('Vendor application rejected successfully!');
      })
      .addCase(rejectApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, resetApplicationData } = vendorApplicationSlice.actions;
export default vendorApplicationSlice.reducer; 