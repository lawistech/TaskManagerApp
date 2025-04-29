import { store } from '../redux/store';
import networkService from './NetworkService';
import { fetchTasks, addNewTask, updateTask, deleteTask } from '../redux/slices/tasksSlice';
import {
  fetchCategories,
  addNewCategory,
  updateCategory,
  deleteCategory,
} from '../redux/slices/categoriesSlice';
import { createDeltaOperation, applyDelta } from '../utils/deltaSync';

/**
 * Service for handling data synchronization between local and remote storage
 */
class SyncService {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.syncInterval = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.listeners = [];
    this.lastSyncedState = {
      tasks: {},
      categories: {},
    };
    this.syncStatus = {
      status: 'idle', // 'idle' | 'syncing' | 'error' | 'success'
      lastSyncTime: null,
      pendingChanges: 0,
      error: null,
      dataSaved: 0, // Bytes saved by using delta sync
    };
  }

  /**
   * Initialize the sync service
   */
  initialize() {
    // Listen for network changes
    networkService.addListener(this.handleNetworkChange);

    // Set up automatic sync interval (every 5 minutes)
    this.syncInterval = setInterval(
      () => {
        this.syncIfConnected();
      },
      5 * 60 * 1000,
    );

    // Initialize the last synced state from the current state
    this.initializeLastSyncedState();
  }

  /**
   * Initialize the last synced state from the current Redux state
   * This ensures we have a baseline for delta sync
   */
  initializeLastSyncedState() {
    const state = store.getState();

    // Initialize tasks
    if (state.tasks && state.tasks.tasks) {
      state.tasks.tasks.forEach(task => {
        this.lastSyncedState.tasks[task.id] = { ...task };
      });
    }

    // Initialize categories
    if (state.categories && state.categories.categories) {
      state.categories.categories.forEach(category => {
        this.lastSyncedState.categories[category.id] = { ...category };
      });
    }
  }

  /**
   * Clean up the sync service
   */
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Handle network state changes
   * @param {Object} networkState - Current network state
   */
  handleNetworkChange = networkState => {
    if (networkState.isConnected && this.syncQueue.length > 0) {
      this.syncData();
    }
  };

  /**
   * Add an operation to the sync queue
   * @param {Object} operation - Operation to be synced
   */
  addToSyncQueue(operation) {
    const { type, entityType, data } = operation;

    // For delta sync, we need to compare with the last synced state
    let deltaOperation = operation;
    let originalSize = 0;
    let deltaSize = 0;

    if (type === 'update') {
      // Get the last synced state for this entity
      const lastSyncedEntity =
        entityType === 'task'
          ? this.lastSyncedState.tasks[data.id]
          : this.lastSyncedState.categories[data.id];

      // Create a delta operation
      deltaOperation = createDeltaOperation(type, entityType, lastSyncedEntity, data);

      // If no changes were detected, skip this operation
      if (!deltaOperation) {
        return;
      }

      // Calculate data savings for metrics
      originalSize = JSON.stringify(data).length;
      deltaSize = JSON.stringify(deltaOperation.data).length;

      // Update the dataSaved metric
      if (originalSize > deltaSize) {
        this.updateSyncStatus({
          dataSaved: this.syncStatus.dataSaved + (originalSize - deltaSize),
        });
      }
    }

    // Add the operation to the queue
    this.syncQueue.push({
      ...deltaOperation,
      timestamp: new Date().toISOString(),
      attempts: 0,
    });

    this.updateSyncStatus({
      pendingChanges: this.syncQueue.length,
    });

    // Try to sync immediately if connected
    this.syncIfConnected();
  }

  /**
   * Sync data if connected to network
   */
  async syncIfConnected() {
    const networkState = await networkService.getCurrentState();
    if (networkState.isConnected) {
      this.syncData();
    }
  }

  /**
   * Sync all pending operations
   */
  async syncData() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.updateSyncStatus({
      status: 'syncing',
    });

    try {
      // Process each operation in the queue
      const successfulOperations = [];
      const failedOperations = [];

      for (const operation of this.syncQueue) {
        try {
          await this.processOperation(operation);
          successfulOperations.push(operation);
        } catch (error) {
          operation.attempts += 1;
          operation.lastError = error.message;

          if (operation.attempts >= this.maxRetries) {
            // Move to failed operations if max retries reached
            failedOperations.push(operation);
          }
        }
      }

      // Remove successful operations from queue
      this.syncQueue = this.syncQueue.filter(
        op => !successfulOperations.includes(op) && !failedOperations.includes(op),
      );

      // If there are failed operations that reached max retries, we need conflict resolution
      if (failedOperations.length > 0) {
        this.handleFailedOperations(failedOperations);
      }

      this.updateSyncStatus({
        status: 'success',
        lastSyncTime: new Date().toISOString(),
        pendingChanges: this.syncQueue.length,
        error: null,
      });
    } catch (error) {
      this.updateSyncStatus({
        status: 'error',
        error: error.message,
      });

      // Schedule retry
      setTimeout(() => {
        this.retryCount += 1;
        if (this.retryCount < this.maxRetries) {
          this.syncData();
        }
      }, this.retryDelay);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync operation
   * @param {Object} operation - Operation to process
   */
  async processOperation(operation) {
    const { type, entityType, data, isDelta } = operation;
    const dispatch = store.dispatch;
    const state = store.getState();

    // If this is a delta update, we need to get the full entity and apply the delta
    let fullData = data;

    if (isDelta && type === 'update') {
      // Get the current entity from the state
      if (entityType === 'task') {
        const task = state.tasks.tasks.find(t => t.id === data.id);
        if (task) {
          fullData = applyDelta(task, data);
        }
      } else if (entityType === 'category') {
        const category = state.categories.categories.find(c => c.id === data.id);
        if (category) {
          fullData = applyDelta(category, data);
        }
      }
    }

    // Process the operation
    try {
      switch (entityType) {
        case 'task':
          if (type === 'create') {
            await dispatch(addNewTask(fullData)).unwrap();
            // Update last synced state
            this.lastSyncedState.tasks[fullData.id] = { ...fullData };
          } else if (type === 'update') {
            await dispatch(updateTask(fullData)).unwrap();
            // Update last synced state
            this.lastSyncedState.tasks[fullData.id] = { ...fullData };
          } else if (type === 'delete') {
            await dispatch(deleteTask(fullData.id || fullData)).unwrap();
            // Remove from last synced state
            delete this.lastSyncedState.tasks[fullData.id || fullData];
          }
          break;

        case 'category':
          if (type === 'create') {
            await dispatch(addNewCategory(fullData)).unwrap();
            // Update last synced state
            this.lastSyncedState.categories[fullData.id] = { ...fullData };
          } else if (type === 'update') {
            await dispatch(updateCategory(fullData)).unwrap();
            // Update last synced state
            this.lastSyncedState.categories[fullData.id] = { ...fullData };
          } else if (type === 'delete') {
            await dispatch(deleteCategory(fullData.id || fullData)).unwrap();
            // Remove from last synced state
            delete this.lastSyncedState.categories[fullData.id || fullData];
          }
          break;

        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      return fullData;
    } catch (error) {
      console.error(`Error processing operation: ${error.message}`, operation);
      throw error;
    }
  }

  /**
   * Handle operations that failed after max retries
   * @param {Array} failedOperations - List of failed operations
   */
  handleFailedOperations(failedOperations) {
    // For now, just log the failed operations
    // This will be replaced with conflict resolution UI
    console.error('Failed operations:', failedOperations);
  }

  /**
   * Manually trigger a sync
   */
  manualSync() {
    this.retryCount = 0;
    return this.syncIfConnected();
  }

  /**
   * Update the sync status and notify listeners
   * @param {Object} updates - Status updates
   */
  updateSyncStatus(updates) {
    this.syncStatus = {
      ...this.syncStatus,
      ...updates,
    };

    this.notifyListeners();
  }

  /**
   * Add a listener for sync status changes
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
   * Notify all listeners of sync status changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.syncStatus);
    });
  }

  /**
   * Get current sync status
   * @returns {Object} - Current sync status
   */
  getSyncStatus() {
    return { ...this.syncStatus };
  }
}

// Create a singleton instance
const syncService = new SyncService();

export default syncService;
