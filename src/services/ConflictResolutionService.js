import { store } from '../redux/store';

/**
 * Service for handling data conflicts during synchronization
 */
class ConflictResolutionService {
  constructor() {
    this.conflicts = [];
    this.listeners = [];
    this.resolutionStrategies = {
      'client-wins': this.resolveWithClientData,
      'server-wins': this.resolveWithServerData,
      manual: this.flagForManualResolution,
    };
    this.defaultStrategy = 'client-wins';
  }

  /**
   * Add a conflict to be resolved
   * @param {Object} conflict - Conflict information
   */
  addConflict(conflict) {
    // Add unique ID to conflict
    const conflictWithId = {
      ...conflict,
      id: Date.now().toString(),
      status: conflict.strategy === 'manual' ? 'manual' : 'pending', // 'pending' | 'resolved' | 'manual'
    };

    this.conflicts.push(conflictWithId);
    this.notifyListeners();

    // Try to auto-resolve if not set to manual resolution
    if (conflict.strategy !== 'manual') {
      this.resolveConflict(conflictWithId.id, conflict.strategy || this.defaultStrategy);
    }

    return conflictWithId.id;
  }

  /**
   * Resolve a conflict using the specified strategy
   * @param {string} conflictId - ID of the conflict to resolve
   * @param {string} strategy - Resolution strategy to use
   */
  resolveConflict(conflictId, strategy = this.defaultStrategy) {
    const conflictIndex = this.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex === -1) {
      throw new Error(`Conflict with ID ${conflictId} not found`);
    }

    const conflict = this.conflicts[conflictIndex];
    const resolveFunc = this.resolutionStrategies[strategy];

    if (!resolveFunc) {
      throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    try {
      resolveFunc(conflict);

      // Update conflict status
      this.conflicts[conflictIndex] = {
        ...conflict,
        status: strategy === 'manual' ? 'manual' : 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedWith: strategy,
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Error resolving conflict:', error);

      // Mark as failed
      this.conflicts[conflictIndex] = {
        ...conflict,
        status: 'failed',
        error: error.message,
      };

      this.notifyListeners();
    }
  }

  /**
   * Resolve conflict by using client data
   * @param {Object} conflict - Conflict to resolve
   */
  resolveWithClientData = conflict => {
    const { clientData, entityType, entityId } = conflict;

    // Implementation will depend on the specific entity types
    // For now, we'll just log the resolution
    console.log(`Resolving conflict for ${entityType} ${entityId} with client data:`, clientData);

    // In a real implementation, we would update the server with client data
    // This would involve API calls to update the server
  };

  /**
   * Resolve conflict by using server data
   * @param {Object} conflict - Conflict to resolve
   */
  resolveWithServerData = conflict => {
    const { serverData, entityType, entityId } = conflict;

    // Implementation will depend on the specific entity types
    // For now, we'll just log the resolution
    console.log(`Resolving conflict for ${entityType} ${entityId} with server data:`, serverData);

    // In a real implementation, we would update the local store with server data
    // This would involve dispatching Redux actions
  };

  /**
   * Flag conflict for manual resolution
   * @param {Object} conflict - Conflict to flag
   */
  flagForManualResolution = conflict => {
    // Just mark it for manual resolution, no actual resolution happens
    console.log(`Flagging conflict for manual resolution:`, conflict);
  };

  /**
   * Get all conflicts
   * @param {string} status - Optional status filter
   * @returns {Array} - List of conflicts
   */
  getConflicts(status) {
    if (status) {
      return this.conflicts.filter(c => c.status === status);
    }
    return [...this.conflicts];
  }

  /**
   * Get a specific conflict by ID
   * @param {string} conflictId - ID of the conflict
   * @returns {Object|null} - Conflict object or null if not found
   */
  getConflictById(conflictId) {
    return this.conflicts.find(c => c.id === conflictId) || null;
  }

  /**
   * Add a listener for conflict changes
   * @param {Function} listener - Callback function
   * @returns {Function} - Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of conflict changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.getConflicts());
    });
  }

  /**
   * Clear resolved conflicts
   */
  clearResolvedConflicts() {
    this.conflicts = this.conflicts.filter(c => c.status !== 'resolved');
    this.notifyListeners();
  }
}

// Create a singleton instance
const conflictResolutionService = new ConflictResolutionService();

export default conflictResolutionService;
