import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  tasks: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunks for API calls (to be implemented later)
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  // This will be replaced with actual API call
  return [];
});

export const addNewTask = createAsyncThunk('tasks/addNewTask', async (task) => {
  // This will be replaced with actual API call
  return task;
});

export const updateTask = createAsyncThunk('tasks/updateTask', async (task) => {
  // This will be replaced with actual API call
  return task;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId) => {
  // This will be replaced with actual API call
  return taskId;
});

// Create the tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Local actions that don't require API calls
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleTaskCompletion: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    updateTaskDetails: (state, action) => {
      const { id, ...updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add new task
      .addCase(addNewTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id } = action.payload;
        const taskIndex = state.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      });
  },
});

// Export actions
export const { addTask, removeTask, toggleTaskCompletion, updateTaskDetails } = tasksSlice.actions;

// Export selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTaskById = (state, taskId) => state.tasks.tasks.find(task => task.id === taskId);
export const selectTasksByCategory = (state, categoryId) => 
  state.tasks.tasks.filter(task => task.categoryId === categoryId);
export const selectCompletedTasks = (state) => state.tasks.tasks.filter(task => task.completed);
export const selectIncompleteTasks = (state) => state.tasks.tasks.filter(task => !task.completed);
export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;

// Export reducer
export default tasksSlice.reducer;
