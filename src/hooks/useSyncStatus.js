import { useState, useEffect } from 'react';
import syncService from '../services/SyncService';

/**
 * Hook to access sync status in components
 * @returns {Object} - Current sync status
 */
const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.addListener(setSyncStatus);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Return status and a function to trigger manual sync
  return {
    ...syncStatus,
    manualSync: syncService.manualSync.bind(syncService)
  };
};

export default useSyncStatus;
