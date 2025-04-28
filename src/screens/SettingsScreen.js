import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Divider, Appbar, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { selectPendingChanges, selectIsOnline, updateSyncStatus } from '../redux/slices/syncSlice';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetStore } from '../utils/resetStore';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [syncOnCellular, setSyncOnCellular] = useState(false);
  const pendingChanges = useSelector(selectPendingChanges);
  const isOnline = useSelector(selectIsOnline);

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
          <List.Item
            title="Clear Local Data"
            description="Remove all data stored on this device"
            onPress={handleClearData}
          />
          <List.Item
            title="Fix Data Issues"
            description="Reset application data to fix corruption issues"
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
});

export default SettingsScreen;
