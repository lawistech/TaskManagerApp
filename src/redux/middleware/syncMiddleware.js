import syncService from '../../services/SyncService';
import { incrementPendingChanges } from '../slices/syncSlice';
import { createDeltaOperation } from '../../utils/deltaSync';

// Actions that should trigger sync
const SYNC_ACTIONS = [
  // Task actions
  'tasks/addTask',
  'tasks/removeTask',
  'tasks/toggleTaskCompletion',
  'tasks/updateTaskDetails',

  // Category actions
  'categories/addCategory',
  'categories/removeCategory',
  'categories/updateCategoryDetails',
];

/**
 * Middleware to handle sync operations when certain actions are dispatched
 */
const syncMiddleware = store => next => action => {
  // Process the action first
  const result = next(action);

  // Check if this action should trigger a sync
  if (SYNC_ACTIONS.includes(action.type)) {
    // Extract entity type and operation type from action
    let entityType, operationType, data;

    if (action.type.startsWith('tasks/')) {
      entityType = 'task';

      if (action.type === 'tasks/addTask') {
        operationType = 'create';
        data = action.payload;
      } else if (action.type === 'tasks/removeTask') {
        operationType = 'delete';
        data = { id: action.payload };
      } else if (action.type === 'tasks/toggleTaskCompletion') {
        operationType = 'update';
        // Find the task in the state
        const state = store.getState();
        const task = state.tasks.tasks.find(t => t.id === action.payload);
        data = { ...task, completed: !task.completed };
      } else if (action.type === 'tasks/updateTaskDetails') {
        operationType = 'update';
        data = action.payload;
      }
    } else if (action.type.startsWith('categories/')) {
      entityType = 'category';

      if (action.type === 'categories/addCategory') {
        operationType = 'create';
        data = action.payload;
      } else if (action.type === 'categories/removeCategory') {
        operationType = 'delete';
        data = { id: action.payload };
      } else if (action.type === 'categories/updateCategoryDetails') {
        operationType = 'update';
        data = action.payload;
      }
    }

    // Add to sync queue if we have all the required data
    if (entityType && operationType && data) {
      // For update operations, we can use delta sync
      // For create and delete operations, we need to send the full data
      syncService.addToSyncQueue({
        type: operationType,
        entityType,
        data,
      });

      // Update the pending changes count
      store.dispatch(incrementPendingChanges());
    }
  }

  return result;
};

export default syncMiddleware;
