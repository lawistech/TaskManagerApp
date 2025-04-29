import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  Appbar,
  Button,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { selectPendingChanges, selectIsOnline, updateSyncStatus } from '../redux/slices/syncSlice';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetStore } from '../utils/resetStore';
import { repairAllData } from '../utils/dataRepair';
import { backupAndShare, restoreFromBackup } from '../utils/backupRestore';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [syncOnCellular, setSyncOnCellular] = useState(false);
  const pendingChanges = useSelector(selectPendingChanges);
  const isOnline = useSelector(selectIsOnline);

  // State for data repair dialog
  const [repairDialogVisible, setRepairDialogVisible] = useState(false);
  const [repairResults, setRepairResults] = useState(null);
  const [repairing, setRepairing] = useState(false);

  // State for backup/restore operations
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const darkModeSetting = await AsyncStorage.getItem('darkMode');
        const notificationsSetting = await AsyncStorage.getItem('notifications');
        const syncOnCellularSetting = await AsyncStorage.getItem('syncOnCellular');

        if (darkModeSetting !== null) setDarkMode(darkModeSetting === 'true');
        if (notificationsSetting !== null) setNotifications(notificationsSetting === 'true');
        if (syncOnCellularSetting !== null) setSyncOnCellular(syncOnCellularSetting === 'true');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  const handleDarkModeChange = value => {
    setDarkMode(value);
    AsyncStorage.setItem('darkMode', value.toString());
  };

  const handleNotificationsChange = value => {
    setNotifications(value);
    AsyncStorage.setItem('notifications', value.toString());
  };

  const handleSyncOnCellularChange = value => {
    setSyncOnCellular(value);
    AsyncStorage.setItem('syncOnCellular', value.toString());
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'Are you sure you want to clear all local data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.clear();

              // Reset sync status
              dispatch(
                updateSyncStatus({
                  status: 'idle',
                  lastSyncTime: null,
                  pendingChanges: 0,
                  error: null,
                  conflicts: [],
                }),
              );

              // Show success message
              Alert.alert('Success', 'All local data has been cleared.');

              // Reset settings
              setDarkMode(false);
              setNotifications(true);
              setSyncOnCellular(false);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear local data.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleResetStore = () => {
    Alert.alert(
      'Reset Application Data',
      'This will reset all application data and fix any data corruption issues. The app will restart. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetStore();

              // Show success message
              Alert.alert('Success', 'Application data has been reset. The app will now restart.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Force a reload of the app
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  },
                },
              ]);
            } catch (error) {
              console.error('Error resetting store:', error);
              Alert.alert('Error', 'Failed to reset application data.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleRepairData = async () => {
    setRepairing(true);
    setRepairDialogVisible(true);

    try {
      // Run the data repair utility
      const results = await repairAllData();
      setRepairResults(results);

      // If no issues were found, show a simple alert instead of the detailed dialog
      if (results.totalRepaired === 0) {
        setRepairDialogVisible(false);
        Alert.alert('Data Check Complete', 'No data issues were found. Your data is healthy!');
      }
    } catch (error) {
      console.error('Error repairing data:', error);
      setRepairDialogVisible(false);
      Alert.alert('Error', 'Failed to repair data. Please try again or reset the application.');
    } finally {
      setRepairing(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      await backupAndShare();
      Alert.alert('Backup Complete', 'Your data has been backed up successfully.');
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Backup Failed', error.message || 'Failed to create backup.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore from Backup',
      'This will replace all your current data with the data from the backup file. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setRestoring(true);
              const result = await restoreFromBackup();

              if (result.success) {
                Alert.alert(
                  'Restore Complete',
                  `Successfully restored ${result.itemsRestored} items from backup created on ${new Date(result.timestamp).toLocaleString()}.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Force a reload of the app
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Home' }],
                        });
                      },
                    },
                  ],
                );
              }
            } catch (error) {
              console.error('Error restoring from backup:', error);
              Alert.alert('Restore Failed', error.message || 'Failed to restore from backup.');
            } finally {
              setRestoring(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Enable dark theme"
            right={() => <Switch value={darkMode} onValueChange={handleDarkModeChange} />}
          />
          <Divider />

          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for tasks"
            right={() => <Switch value={notifications} onValueChange={handleNotificationsChange} />}
          />
          <Divider />

          <List.Subheader>Data & Sync</List.Subheader>
          <List.Item
            title="Sync Status"
            description={
              pendingChanges > 0 ? `${pendingChanges} changes pending` : 'All changes synced'
            }
            right={() => <SyncStatusIndicator />}
            onPress={() => navigation.navigate('Sync')}
          />
          <List.Item
            title="Sync on Cellular Data"
            description="Allow syncing when not on Wi-Fi"
            right={() => (
              <Switch value={syncOnCellular} onValueChange={handleSyncOnCellularChange} />
            )}
          />

          <List.Subheader>Backup & Restore</List.Subheader>
          <List.Item
            title="Backup Data"
            description="Create and share a backup of your data"
            onPress={handleBackup}
          />
          <List.Item
            title="Restore from Backup"
            description="Restore your data from a backup file"
            onPress={handleRestore}
          />

          <List.Subheader>Data Management</List.Subheader>
          <List.Item
            title="Clear Local Data"
            description="Remove all data stored on this device"
            onPress={handleClearData}
          />
          <List.Item
            title="Repair Data"
            description="Scan and fix data corruption issues"
            onPress={handleRepairData}
          />
          <List.Item
            title="Reset Application"
            description="Reset application data to fix severe corruption issues"
            onPress={handleResetStore}
          />
          <Divider />

          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            description="Manage your account information"
            onPress={() => console.log('Profile')}
          />
          <List.Item
            title="Sign Out"
            description="Log out from your account"
            onPress={() => console.log('Sign out')}
          />
        </List.Section>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Data Repair Dialog */}
      <Portal>
        <Dialog visible={repairDialogVisible} onDismiss={() => setRepairDialogVisible(false)}>
          <Dialog.Title>Data Repair Results</Dialog.Title>
          <Dialog.Content>
            {repairing ? (
              <View style={styles.loadingContainer}>
                <Text>Scanning and repairing data...</Text>
              </View>
            ) : repairResults ? (
              <ScrollView style={styles.resultsContainer}>
                <Paragraph>
                  Scanned {repairResults.tasks.total} tasks and {repairResults.categories.total}{' '}
                  categories.
                </Paragraph>
                <Paragraph>Fixed {repairResults.totalRepaired} issues.</Paragraph>

                {repairResults.tasks.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issueHeader}>Task Issues:</Text>
                    {repairResults.tasks.issues.map((issue, index) => (
                      <Text key={index} style={styles.issueItem}>
                        • {issue.issue} (ID: {issue.id.substring(0, 8)}...)
                      </Text>
                    ))}
                  </View>
                )}

                {repairResults.categories.issues.length > 0 && (
                  <View style={styles.issuesContainer}>
                    <Text style={styles.issueHeader}>Category Issues:</Text>
                    {repairResults.categories.issues.map((issue, index) => (
                      <Text key={index} style={styles.issueItem}>
                        • {issue.issue} (ID: {issue.id.substring(0, 8)}...)
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            ) : (
              <Paragraph>No repair results available.</Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRepairDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    color: 'gray',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultsContainer: {
    maxHeight: 300,
  },
  issuesContainer: {
    marginTop: 10,
  },
  issueHeader: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  issueItem: {
    marginLeft: 10,
    marginBottom: 3,
  },
});

export default SettingsScreen;
