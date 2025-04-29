/**
 * Utility functions for schema migrations
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_SCHEMA_VERSION, SCHEMA_VERSIONS } from '../constants/schemaVersions';

/**
 * Check if a schema migration is needed
 * @returns {Promise<boolean>} - Whether a migration is needed
 */
export const isMigrationNeeded = async () => {
  try {
    // Get the current schema version from AsyncStorage
    const storedVersion = await AsyncStorage.getItem('schemaVersion');
    
    // If no version is stored, this is a new installation
    if (!storedVersion) {
      // Set the current schema version
      await AsyncStorage.setItem('schemaVersion', CURRENT_SCHEMA_VERSION);
      return false;
    }
    
    // Check if the stored version is different from the current version
    return storedVersion !== CURRENT_SCHEMA_VERSION;
  } catch (error) {
    console.error('Error checking schema version:', error);
    return false;
  }
};

/**
 * Get the migration path from the stored version to the current version
 * @returns {Promise<Array>} - Array of migration steps to perform
 */
export const getMigrationPath = async () => {
  try {
    // Get the current schema version from AsyncStorage
    const storedVersion = await AsyncStorage.getItem('schemaVersion');
    
    // If no version is stored, this is a new installation
    if (!storedVersion) {
      return [];
    }
    
    // Find the index of the stored version in the schema versions array
    const storedVersionIndex = SCHEMA_VERSIONS.findIndex(v => v.version === storedVersion);
    
    // Find the index of the current version in the schema versions array
    const currentVersionIndex = SCHEMA_VERSIONS.findIndex(v => v.version === CURRENT_SCHEMA_VERSION);
    
    // If either version is not found, return an empty array
    if (storedVersionIndex === -1 || currentVersionIndex === -1) {
      return [];
    }
    
    // Return the migration steps between the stored version and the current version
    return SCHEMA_VERSIONS.slice(storedVersionIndex + 1, currentVersionIndex + 1);
  } catch (error) {
    console.error('Error getting migration path:', error);
    return [];
  }
};

/**
 * Perform a schema migration
 * @returns {Promise<Object>} - Results of the migration
 */
export const migrateSchema = async () => {
  try {
    // Check if a migration is needed
    const migrationNeeded = await isMigrationNeeded();
    
    // If no migration is needed, return
    if (!migrationNeeded) {
      return {
        success: true,
        migrated: false,
        message: 'No migration needed',
      };
    }
    
    // Get the migration path
    const migrationPath = await getMigrationPath();
    
    // If no migration path is found, return
    if (migrationPath.length === 0) {
      return {
        success: false,
        migrated: false,
        message: 'No migration path found',
      };
    }
    
    // Get the persisted state
    const persistedState = await AsyncStorage.getItem('persist:root');
    
    // If no persisted state is found, return
    if (!persistedState) {
      return {
        success: false,
        migrated: false,
        message: 'No persisted state found',
      };
    }
    
    // Parse the persisted state
    const parsedState = JSON.parse(persistedState);
    
    // Perform each migration step
    for (const migration of migrationPath) {
      // Apply the migration to the state
      await applyMigration(migration, parsedState);
    }
    
    // Save the updated state
    await AsyncStorage.setItem('persist:root', JSON.stringify(parsedState));
    
    // Update the schema version
    await AsyncStorage.setItem('schemaVersion', CURRENT_SCHEMA_VERSION);
    
    return {
      success: true,
      migrated: true,
      message: `Migrated from ${migrationPath[0].version} to ${CURRENT_SCHEMA_VERSION}`,
      steps: migrationPath.length,
    };
  } catch (error) {
    console.error('Error migrating schema:', error);
    return {
      success: false,
      migrated: false,
      message: `Migration failed: ${error.message}`,
    };
  }
};

/**
 * Apply a migration to the state
 * @param {Object} migration - Migration to apply
 * @param {Object} state - State to migrate
 * @returns {Promise<void>}
 */
const applyMigration = async (migration, state) => {
  // This function will be expanded as new schema versions are added
  // For now, it's just a placeholder
  
  // Example migration for tasks
  if (state.tasks) {
    const tasksState = JSON.parse(state.tasks);
    
    // Apply migration to tasks
    // This will be specific to each migration
    
    // Save the updated tasks state
    state.tasks = JSON.stringify(tasksState);
  }
  
  // Example migration for categories
  if (state.categories) {
    const categoriesState = JSON.parse(state.categories);
    
    // Apply migration to categories
    // This will be specific to each migration
    
    // Save the updated categories state
    state.categories = JSON.stringify(categoriesState);
  }
};

/**
 * Check for schema migration on app startup
 * @returns {Promise<void>}
 */
export const checkForMigration = async () => {
  try {
    // Check if a migration is needed
    const migrationNeeded = await isMigrationNeeded();
    
    // If a migration is needed, perform it
    if (migrationNeeded) {
      await migrateSchema();
    }
  } catch (error) {
    console.error('Error checking for migration:', error);
  }
};
