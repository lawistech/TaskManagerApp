import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import reducers
import tasksReducer from './slices/tasksSlice';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import syncReducer from './slices/syncSlice';

// Import middleware
import syncMiddleware from './middleware/syncMiddleware';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks', 'categories'], // only persist these reducers
  // Add migration to handle potential data issues
  migrate: state => {
    // Ensure we have a clean state with no duplicates
    if (state && state.tasks && state.tasks.tasks) {
      // Remove duplicates by ID
      const uniqueTasks = [];
      const taskIds = new Set();

      state.tasks.tasks.forEach(task => {
        if (!taskIds.has(task.id)) {
          taskIds.add(task.id);
          uniqueTasks.push(task);
        }
      });

      state.tasks.tasks = uniqueTasks;
    }

    if (state && state.categories && state.categories.categories) {
      // Remove duplicates by ID
      const uniqueCategories = [];
      const categoryIds = new Set();

      state.categories.categories.forEach(category => {
        if (!categoryIds.has(category.id)) {
          categoryIds.add(category.id);
          uniqueCategories.push(category);
        }
      });

      state.categories.categories = uniqueCategories;
    }

    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  tasks: tasksReducer,
  auth: authReducer,
  categories: categoriesReducer,
  sync: syncReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'tasks/addTask',
          'tasks/addNewTask/pending',
          'tasks/addNewTask/fulfilled',
          'tasks/updateTaskDetails',
          'tasks/updateTask/pending',
          'tasks/updateTask/fulfilled',
          'sync/incrementPendingChanges',
        ],
        // Ignore these specific paths in the state where we know dates might be stored
        ignoredPaths: [
          'tasks.tasks.*.dueDate',
          'tasks.tasks.*.createdAt',
          'tasks.tasks.*.updatedAt',
        ],
      },
    }).concat(syncMiddleware),
});

export const persistor = persistStore(store);
