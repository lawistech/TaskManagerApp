import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  user: null,
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  passwordResetStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  passwordResetError: null,
};

// Async thunks for API calls (to be implemented later)
export const login = createAsyncThunk('auth/login', async credentials => {
  // This will be replaced with actual API call
  return {
    user: { id: '1', name: 'Test User', email: credentials.email },
    token: 'dummy-token',
  };
});

export const register = createAsyncThunk('auth/register', async userData => {
  // This will be replaced with actual API call
  return {
    user: { id: '1', name: userData.name, email: userData.email },
    token: 'dummy-token',
  };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  // This will be replaced with actual API call
  return true;
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async token => {
  // This will be replaced with actual API call
  return { token: 'new-dummy-token' };
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async email => {
  // This will be replaced with actual API call
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // For demo purposes, we'll just return success for any email
  return { success: true, email };
});

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Local actions that don't require API calls
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    clearCredentials: state => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(login.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Register
      .addCase(register.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      // Password reset
      .addCase(resetPassword.pending, state => {
        state.passwordResetStatus = 'loading';
        state.passwordResetError = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.passwordResetStatus = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordResetStatus = 'failed';
        state.passwordResetError = action.error.message;
      });
  },
});

// Export actions
export const { setCredentials, clearCredentials } = authSlice.actions;

// Export selectors
export const selectCurrentUser = state => state.auth.user;
export const selectToken = state => state.auth.token;
export const selectAuthStatus = state => state.auth.status;
export const selectAuthError = state => state.auth.error;
export const selectIsAuthenticated = state => !!state.auth.token;
export const selectPasswordResetStatus = state => state.auth.passwordResetStatus;
export const selectPasswordResetError = state => state.auth.passwordResetError;

// Export reducer
export default authSlice.reducer;
