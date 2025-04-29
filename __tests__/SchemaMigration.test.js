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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMigrationNeeded, getMigrationPath, migrateSchema } from '../src/utils/schemaMigration';
import { CURRENT_SCHEMA_VERSION, SCHEMA_VERSIONS } from '../src/constants/schemaVersions';

describe('Schema Migration', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  test('isMigrationNeeded should return false for new installations', async () => {
    // Mock AsyncStorage.getItem to return null (no stored version)
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await isMigrationNeeded();

    // Should return false
    expect(result).toBe(false);

    // Should set the current schema version
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('schemaVersion', CURRENT_SCHEMA_VERSION);
  });

  test('isMigrationNeeded should return false if versions match', async () => {
    // Mock AsyncStorage.getItem to return the current version
    AsyncStorage.getItem.mockResolvedValueOnce(CURRENT_SCHEMA_VERSION);

    const result = await isMigrationNeeded();

    // Should return false
    expect(result).toBe(false);

    // Should not set the schema version
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('isMigrationNeeded should return true if versions differ', async () => {
    // Mock AsyncStorage.getItem to return an old version
    AsyncStorage.getItem.mockResolvedValueOnce('0.9.0');

    const result = await isMigrationNeeded();

    // Should return true
    expect(result).toBe(true);

    // Should not set the schema version
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('getMigrationPath should return empty array for new installations', async () => {
    // Mock AsyncStorage.getItem to return null (no stored version)
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await getMigrationPath();

    // Should return empty array
    expect(result).toEqual([]);
  });

  test('migrateSchema should return success and not migrated for new installations', async () => {
    // Mock isMigrationNeeded to return false
    jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce(CURRENT_SCHEMA_VERSION);

    const result = await migrateSchema();

    // Should return success and not migrated
    expect(result).toEqual({
      success: true,
      migrated: false,
      message: 'No migration needed',
    });
  });
});
