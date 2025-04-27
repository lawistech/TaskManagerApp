import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import reducers
import tasksReducer from './slices/tasksSlice';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tasks', 'categories'], // only persist these reducers
};

const rootReducer = combineReducers({
  tasks: tasksReducer,
  auth: authReducer,
  categories: categoriesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
