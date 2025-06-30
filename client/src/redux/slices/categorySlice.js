import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../api/categoryService';

// Base URL for API requests

// Async thunks for category operations
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Convert params object to URL query params
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/categories?${queryString}` : '/categories';
      
      const response = await categoryService.getCategories(params);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategory(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  category: null,
  isLoading: false,
  error: null,
  success: false,
  message: ''
};

// Create slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    resetCategoryState: (state) => {
      state.success = false;
      state.error = null;
      state.message = '';
    },
    clearCategoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to fetch categories';
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.category = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to fetch category';
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.success = true;
        state.message = 'Category created successfully';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to create category';
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.map(category => 
          category._id === action.payload._id ? action.payload : category
        );
        state.success = true;
        state.message = 'Category updated successfully';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to update category';
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(category => category._id !== action.payload);
        state.success = true;
        state.message = 'Category deleted successfully';
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? action.payload.message : 'Failed to delete category';
      });
  }
});

export const { resetCategoryState, clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer; 