import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { theme } from './src/utils/theme';
import AppNavigator from './src/navigation/AppNavigator';
import networkService from './src/services/NetworkService';
import syncService from './src/services/SyncService';
import { updateNetworkStatus } from './src/redux/slices/syncSlice';

// Initialize services
const initializeServices = () => {
  // Initialize network service
  networkService.initialize();

  // Add listener to update Redux store with network status
  networkService.addListener(networkState => {
    store.dispatch(
      updateNetworkStatus({
        isOnline: networkState.isConnected,
        connectionType: networkState.connectionType,
      }),
    );
  });

  // Initialize sync service
  syncService.initialize();

  // Return cleanup function
  return () => {
    networkService.cleanup();
    syncService.cleanup();
  };
};

const AppContent = () => {
  useEffect(() => {
    const cleanup = initializeServices();
    return cleanup;
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <StoreProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </StoreProvider>
  );
}
