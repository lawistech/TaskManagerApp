import { useState, useEffect } from 'react';
import conflictResolutionService from '../services/ConflictResolutionService';

/**
 * Hook to access conflict resolution in components
 * @param {string} status - Optional status filter
 * @returns {Object} - Conflicts and resolution functions
 */
const useConflictResolution = (status) => {
  const [conflicts, setConflicts] = useState(
    conflictResolutionService.getConflicts(status)
  );

  useEffect(() => {
    // Subscribe to conflict changes
    const unsubscribe = conflictResolutionService.addListener((allConflicts) => {
      if (status) {
        setConflicts(allConflicts.filter(c => c.status === status));
      } else {
        setConflicts(allConflicts);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [status]);

  // Return conflicts and resolution functions
  return {
    conflicts,
    resolveConflict: conflictResolutionService.resolveConflict.bind(conflictResolutionService),
    getConflictById: conflictResolutionService.getConflictById.bind(conflictResolutionService),
    clearResolvedConflicts: conflictResolutionService.clearResolvedConflicts.bind(conflictResolutionService)
  };
};

export default useConflictResolution;
