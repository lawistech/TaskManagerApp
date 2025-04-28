import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  status: 'idle', // 'idle' | 'syncing' | 'error' | 'success'
  lastSyncTime: null,
  pendingChanges: 0,
  error: null,
  isOnline: false,
  connectionType: null,
  conflicts: [],
};

// Create the sync slice
const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    // Update sync status
    updateSyncStatus: (state, action) => {
      return { ...state, ...action.payload };
    },

    // Update network status
    updateNetworkStatus: (state, action) => {
      const { isOnline, connectionType } = action.payload;
      state.isOnline = isOnline;
      state.connectionType = connectionType;
    },

    // Add a conflict
    addConflict: (state, action) => {
      state.conflicts.push(action.payload);
    },

    // Update a conflict
    updateConflict: (state, action) => {
      const { id, ...updates } = action.payload;
      const conflictIndex = state.conflicts.findIndex(c => c.id === id);
      if (conflictIndex !== -1) {
        state.conflicts[conflictIndex] = { ...state.conflicts[conflictIndex], ...updates };
      }
    },

    // Remove a conflict
    removeConflict: (state, action) => {
      state.conflicts = state.conflicts.filter(c => c.id !== action.payload);
    },

    // Clear all resolved conflicts
    clearResolvedConflicts: state => {
      state.conflicts = state.conflicts.filter(c => c.status !== 'resolved');
    },

    // Increment pending changes
    incrementPendingChanges: state => {
      state.pendingChanges += 1;
    },

    // Decrement pending changes
    decrementPendingChanges: state => {
      if (state.pendingChanges > 0) {
        state.pendingChanges -= 1;
      }
    },

    // Reset pending changes
    resetPendingChanges: state => {
      state.pendingChanges = 0;
    },
  },
  extraReducers: builder => {
    builder
      // Reset app
      .addCase('RESET_APP', () => {
        // Return the initial state
        return initialState;
      });
  },
});

// Export actions
export const {
  updateSyncStatus,
  updateNetworkStatus,
  addConflict,
  updateConflict,
  removeConflict,
  clearResolvedConflicts,
  incrementPendingChanges,
  decrementPendingChanges,
  resetPendingChanges,
} = syncSlice.actions;

// Export selectors
export const selectSyncStatus = state => state.sync.status;
export const selectLastSyncTime = state => state.sync.lastSyncTime;
export const selectPendingChanges = state => state.sync.pendingChanges;
export const selectSyncError = state => state.sync.error;
export const selectIsOnline = state => state.sync.isOnline;
export const selectConnectionType = state => state.sync.connectionType;
export const selectAllConflicts = state => state.sync.conflicts;
export const selectConflictById = (state, id) => state.sync.conflicts.find(c => c.id === id);
export const selectConflictsByStatus = (state, status) =>
  state.sync.conflicts.filter(c => c.status === status);

// Export reducer
export default syncSlice.reducer;
