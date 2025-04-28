import { store, persistor } from '../redux/store';

/**
 * Utility function to reset the Redux store
 * This can be used to clear all data and start fresh
 */
export const resetStore = async () => {
  // Pause the persistor to prevent auto-persist during reset
  persistor.pause();
  
  // Purge all persisted data
  await persistor.purge();
  
  // Dispatch a reset action to all reducers
  store.dispatch({ type: 'RESET_APP' });
  
  // Resume the persistor
  persistor.persist();
  
  return true;
};
