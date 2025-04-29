/**
 * Utility functions for backup and restore operations
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../redux/store';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Create a backup of the application data
 * @returns {Promise<string>} - Path to the backup file
 */
export const createBackup = async () => {
  try {
    // Get all data from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    
    // Create a backup object with metadata
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      data: allData.reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {}),
    };
    
    // Convert to JSON
    const backupJson = JSON.stringify(backup);
    
    // Create a file in the app's documents directory
    const backupFileName = `taskmanager_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupFilePath = `${FileSystem.documentDirectory}${backupFileName}`;
    
    // Write the backup data to the file
    await FileSystem.writeAsStringAsync(backupFilePath, backupJson);
    
    return backupFilePath;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup: ' + error.message);
  }
};

/**
 * Share a backup file with other apps
 * @param {string} backupFilePath - Path to the backup file
 * @returns {Promise<void>}
 */
export const shareBackup = async (backupFilePath) => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    // Share the file
    await Sharing.shareAsync(backupFilePath, {
      mimeType: 'application/json',
      dialogTitle: 'Share Task Manager Backup',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Error sharing backup:', error);
    throw new Error('Failed to share backup: ' + error.message);
  }
};

/**
 * Restore data from a backup file
 * @returns {Promise<Object>} - Restore results
 */
export const restoreFromBackup = async () => {
  try {
    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    // Check if the user canceled
    if (result.canceled) {
      throw new Error('Document picking was canceled');
    }
    
    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
    
    // Parse the backup data
    const backup = JSON.parse(fileContent);
    
    // Validate the backup
    if (!backup.version || !backup.timestamp || !backup.data) {
      throw new Error('Invalid backup file format');
    }
    
    // Clear existing data
    await AsyncStorage.clear();
    
    // Restore data from backup
    const entries = Object.entries(backup.data);
    for (const [key, value] of entries) {
      await AsyncStorage.setItem(key, value);
    }
    
    return {
      success: true,
      timestamp: backup.timestamp,
      itemsRestored: entries.length,
    };
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw new Error('Failed to restore from backup: ' + error.message);
  }
};

/**
 * Create a backup and share it
 * @returns {Promise<void>}
 */
export const backupAndShare = async () => {
  const backupFilePath = await createBackup();
  await shareBackup(backupFilePath);
};
