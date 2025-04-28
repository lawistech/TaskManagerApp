import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  categories: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunks for API calls (to be implemented later)
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  // This will be replaced with actual API call
  return [];
});

export const addNewCategory = createAsyncThunk('categories/addNewCategory', async category => {
  // This will be replaced with actual API call
  return category;
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async category => {
  // This will be replaced with actual API call
  return category;
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async categoryId => {
  // This will be replaced with actual API call
  return categoryId;
});

// Create the categories slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Local actions that don't require API calls
    addCategory: (state, action) => {
      // Check if category with this ID already exists
      const exists = state.categories.some(category => category.id === action.payload.id);
      if (!exists) {
        state.categories.push(action.payload);
      }
    },
    removeCategory: (state, action) => {
      state.categories = state.categories.filter(category => category.id !== action.payload);
    },
    updateCategoryDetails: (state, action) => {
      const { id, ...updates } = action.payload;
      const categoryIndex = state.categories.findIndex(category => category.id === id);
      if (categoryIndex !== -1) {
        state.categories[categoryIndex] = { ...state.categories[categoryIndex], ...updates };
      }
    },
  },
  extraReducers: builder => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add new category
      .addCase(addNewCategory.fulfilled, (state, action) => {
        // Check if category with this ID already exists
        const exists = state.categories.some(category => category.id === action.payload.id);
        if (!exists) {
          state.categories.push(action.payload);
        }
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const { id } = action.payload;
        const categoryIndex = state.categories.findIndex(category => category.id === id);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = action.payload;
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload);
      })
      // Reset app
      .addCase('RESET_APP', state => {
        // Reset to initial state
        state.categories = [];
        state.status = 'idle';
        state.error = null;
      });
  },
});

// Export actions
export const { addCategory, removeCategory, updateCategoryDetails } = categoriesSlice.actions;

// Export selectors
export const selectAllCategories = state => state.categories.categories;
export const selectCategoryById = (state, categoryId) =>
  state.categories.categories.find(category => category.id === categoryId);
export const selectCategoriesStatus = state => state.categories.status;
export const selectCategoriesError = state => state.categories.error;

// Export reducer
export default categoriesSlice.reducer;
