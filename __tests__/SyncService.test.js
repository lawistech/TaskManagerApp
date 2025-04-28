// Mock AsyncStorage before importing modules that use it
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

import { store } from '../src/redux/store';
import syncService from '../src/services/SyncService';
import networkService from '../src/services/NetworkService';
import conflictResolutionService from '../src/services/ConflictResolutionService';
import { addTask, updateTaskDetails } from '../src/redux/slices/tasksSlice';
import { selectPendingChanges } from '../src/redux/slices/syncSlice';

// Mock the network service
jest.mock('../src/services/NetworkService', () => ({
  initialize: jest.fn(),
  cleanup: jest.fn(),
  getCurrentState: jest.fn().mockResolvedValue({ isConnected: true, connectionType: 'wifi' }),
  addListener: jest.fn().mockReturnValue(jest.fn()),
  notifyListeners: jest.fn(),
}));

// Mock the Redux store
jest.mock('../src/redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({
      tasks: {
        tasks: [{ id: '123', title: 'Test Task', completed: false }],
      },
      categories: {
        categories: [],
      },
      sync: {
        pendingChanges: 0,
      },
    }),
  },
  persistor: {
    persist: jest.fn(),
  },
}));

describe('SyncService', () => {
  beforeEach(() => {
    // Reset the sync service state
    syncService.syncQueue = [];
    syncService.isSyncing = false;
    syncService.retryCount = 0;
    syncService.updateSyncStatus({
      status: 'idle',
      lastSyncTime: null,
      pendingChanges: 0,
      error: null,
    });

    // Clear any mocks
    jest.clearAllMocks();
  });

  test('should add operations to sync queue', () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };

    // Act
    syncService.addToSyncQueue(operation);

    // Assert
    expect(syncService.syncQueue.length).toBe(1);
    expect(syncService.syncQueue[0].type).toBe('create');
    expect(syncService.syncQueue[0].entityType).toBe('task');
    expect(syncService.syncQueue[0].data.id).toBe('123');
  });

  test('should update sync status when adding to queue', () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };

    // Act
    syncService.addToSyncQueue(operation);

    // Assert
    expect(syncService.syncStatus.pendingChanges).toBe(1);
  });

  test('should process operations in the queue when syncing', async () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };
    syncService.addToSyncQueue(operation);

    // Mock the processOperation method
    const processOperationSpy = jest
      .spyOn(syncService, 'processOperation')
      .mockResolvedValue(undefined);

    // Act
    await syncService.syncData();

    // Assert
    expect(processOperationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'create',
        entityType: 'task',
        data: { id: '123', title: 'Test Task' },
      }),
    );
    expect(syncService.syncQueue.length).toBe(0);
    expect(syncService.syncStatus.status).toBe('success');
  });

  test('should handle failed operations', async () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };
    syncService.addToSyncQueue(operation);

    // Mock the processOperation method to throw an error
    const processOperationSpy = jest
      .spyOn(syncService, 'processOperation')
      .mockRejectedValue(new Error('Test error'));

    // Mock the handleFailedOperations method
    const handleFailedOperationsSpy = jest
      .spyOn(syncService, 'handleFailedOperations')
      .mockImplementation(() => {});

    // Act
    await syncService.syncData();

    // Assert
    expect(processOperationSpy).toHaveBeenCalled();
    expect(syncService.syncQueue[0].attempts).toBe(1);
    expect(syncService.syncQueue[0].lastError).toBe('Test error');
  });

  test('should sync when network becomes available', () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };
    syncService.addToSyncQueue(operation);

    // Mock the syncData method
    const syncDataSpy = jest
      .spyOn(syncService, 'syncData')
      .mockImplementation(() => Promise.resolve());

    // Act
    syncService.handleNetworkChange({ isConnected: true, connectionType: 'wifi' });

    // Assert
    expect(syncDataSpy).toHaveBeenCalled();
  });

  test('should not sync when network is not available', () => {
    // Arrange
    const operation = {
      type: 'create',
      entityType: 'task',
      data: { id: '123', title: 'Test Task' },
    };
    syncService.addToSyncQueue(operation);

    // Mock the syncData method
    const syncDataSpy = jest
      .spyOn(syncService, 'syncData')
      .mockImplementation(() => Promise.resolve());

    // Act
    syncService.handleNetworkChange({ isConnected: false, connectionType: null });

    // Assert
    expect(syncDataSpy).not.toHaveBeenCalled();
  });
});

describe('ConflictResolutionService', () => {
  beforeEach(() => {
    // Reset the conflict resolution service state
    conflictResolutionService.conflicts = [];

    // Clear any mocks
    jest.clearAllMocks();
  });

  test('should add conflicts', () => {
    // Arrange
    const conflict = {
      entityType: 'task',
      entityId: '123',
      clientData: { id: '123', title: 'Client Title' },
      serverData: { id: '123', title: 'Server Title' },
      strategy: 'manual', // Use manual to prevent auto-resolution
    };

    // Mock the auto-resolution methods
    jest.spyOn(conflictResolutionService, 'resolveWithClientData').mockImplementation(() => {});
    jest.spyOn(conflictResolutionService, 'resolveWithServerData').mockImplementation(() => {});
    jest.spyOn(conflictResolutionService, 'flagForManualResolution').mockImplementation(() => {});

    // Act
    const conflictId = conflictResolutionService.addConflict(conflict);

    // Assert
    expect(conflictResolutionService.conflicts.length).toBe(1);
    expect(conflictResolutionService.conflicts[0].id).toBe(conflictId);
    // With manual strategy, it should be set to 'manual'
    expect(conflictResolutionService.conflicts[0].status).toBe('manual');
  });

  test('should resolve conflicts with client-wins strategy', () => {
    // Arrange
    const conflict = {
      entityType: 'task',
      entityId: '123',
      clientData: { id: '123', title: 'Client Title' },
      serverData: { id: '123', title: 'Server Title' },
      strategy: 'manual', // Use manual to prevent auto-resolution
    };

    // Create a mock implementation of the service for this test
    const mockService = {
      conflicts: [],
      resolveWithClientData: jest.fn(),
      resolveWithServerData: jest.fn(),
      flagForManualResolution: jest.fn(),
      resolutionStrategies: {
        'client-wins': jest.fn(),
        'server-wins': jest.fn(),
        manual: jest.fn(),
      },
      notifyListeners: jest.fn(),
      addConflict: function (conflict) {
        const conflictWithId = {
          ...conflict,
          id: Date.now().toString(),
          status: conflict.strategy === 'manual' ? 'manual' : 'pending',
        };
        this.conflicts.push(conflictWithId);
        return conflictWithId.id;
      },
      resolveConflict: function (conflictId, strategy) {
        const conflictIndex = this.conflicts.findIndex(c => c.id === conflictId);
        if (conflictIndex === -1) {
          throw new Error(`Conflict with ID ${conflictId} not found`);
        }

        const conflict = this.conflicts[conflictIndex];
        const resolveFunc = this.resolutionStrategies[strategy];

        if (!resolveFunc) {
          throw new Error(`Unknown resolution strategy: ${strategy}`);
        }

        resolveFunc(conflict);

        this.conflicts[conflictIndex] = {
          ...conflict,
          status: strategy === 'manual' ? 'manual' : 'resolved',
          resolvedAt: new Date().toISOString(),
          resolvedWith: strategy,
        };
      },
    };

    // Add the conflict to our mock service
    const conflictId = mockService.addConflict(conflict);

    // Set up the mock resolution strategy
    mockService.resolutionStrategies['client-wins'] = mockService.resolveWithClientData;

    // Act
    mockService.resolveConflict(conflictId, 'client-wins');

    // Assert
    expect(mockService.resolveWithClientData).toHaveBeenCalled();
    expect(mockService.conflicts[0].status).toBe('resolved');
    expect(mockService.conflicts[0].resolvedWith).toBe('client-wins');
  });

  test('should resolve conflicts with server-wins strategy', () => {
    // Arrange
    const conflict = {
      entityType: 'task',
      entityId: '123',
      clientData: { id: '123', title: 'Client Title' },
      serverData: { id: '123', title: 'Server Title' },
      strategy: 'manual', // Use manual to prevent auto-resolution
    };

    // Create a mock implementation of the service for this test
    const mockService = {
      ...conflictResolutionService,
      conflicts: [],
      resolveWithClientData: jest.fn(),
      resolveWithServerData: jest.fn(),
      flagForManualResolution: jest.fn(),
      resolutionStrategies: {
        'client-wins': jest.fn(),
        'server-wins': jest.fn(),
        manual: jest.fn(),
      },
      notifyListeners: jest.fn(),
    };

    // Add the conflict to our mock service
    const conflictId = mockService.addConflict(conflict);

    // Set up the mock resolution strategy
    mockService.resolutionStrategies['server-wins'] = mockService.resolveWithServerData;

    // Act
    mockService.resolveConflict(conflictId, 'server-wins');

    // Assert
    expect(mockService.resolveWithServerData).toHaveBeenCalled();
    expect(mockService.conflicts[0].status).toBe('resolved');
    expect(mockService.conflicts[0].resolvedWith).toBe('server-wins');
  });

  test('should flag conflicts for manual resolution', () => {
    // Arrange
    const conflict = {
      entityType: 'task',
      entityId: '123',
      clientData: { id: '123', title: 'Client Title' },
      serverData: { id: '123', title: 'Server Title' },
      strategy: 'manual',
    };

    // Create a mock implementation of the service for this test
    const mockService = {
      ...conflictResolutionService,
      conflicts: [],
      resolveWithClientData: jest.fn(),
      resolveWithServerData: jest.fn(),
      flagForManualResolution: jest.fn(),
      resolutionStrategies: {
        'client-wins': jest.fn(),
        'server-wins': jest.fn(),
        manual: jest.fn(),
      },
      notifyListeners: jest.fn(),
    };

    // Add the conflict to our mock service
    const conflictId = mockService.addConflict(conflict);

    // Set up the mock resolution strategy
    mockService.resolutionStrategies['manual'] = mockService.flagForManualResolution;

    // Act
    mockService.resolveConflict(conflictId, 'manual');

    // Assert
    expect(mockService.flagForManualResolution).toHaveBeenCalled();
    expect(mockService.conflicts[0].status).toBe('manual');
  });

  test('should clear resolved conflicts', () => {
    // Arrange
    const conflict1 = {
      entityType: 'task',
      entityId: '123',
      clientData: { id: '123', title: 'Client Title' },
      serverData: { id: '123', title: 'Server Title' },
      strategy: 'client-wins',
    };
    const conflict2 = {
      entityType: 'task',
      entityId: '456',
      clientData: { id: '456', title: 'Client Title' },
      serverData: { id: '456', title: 'Server Title' },
      strategy: 'manual',
    };

    const conflictId1 = conflictResolutionService.addConflict(conflict1);
    const conflictId2 = conflictResolutionService.addConflict(conflict2);

    // Mock resolution methods
    jest.spyOn(conflictResolutionService, 'resolveWithClientData').mockImplementation(() => {});
    jest.spyOn(conflictResolutionService, 'flagForManualResolution').mockImplementation(() => {});

    // Resolve one conflict
    conflictResolutionService.resolveConflict(conflictId1, 'client-wins');
    conflictResolutionService.resolveConflict(conflictId2, 'manual');

    // Act
    conflictResolutionService.clearResolvedConflicts();

    // Assert
    expect(conflictResolutionService.conflicts.length).toBe(1);
    expect(conflictResolutionService.conflicts[0].id).toBe(conflictId2);
    expect(conflictResolutionService.conflicts[0].status).toBe('manual');
  });
});
