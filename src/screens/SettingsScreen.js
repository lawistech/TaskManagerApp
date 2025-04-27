import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [syncOnCellular, setSyncOnCellular] = React.useState(false);
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <ScrollView>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Enable dark theme"
            right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
          />
          <Divider />
          
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for tasks"
            right={() => <Switch value={notifications} onValueChange={setNotifications} />}
          />
          <Divider />
          
          <List.Subheader>Data & Sync</List.Subheader>
          <List.Item
            title="Sync on Cellular Data"
            description="Allow syncing when not on Wi-Fi"
            right={() => <Switch value={syncOnCellular} onValueChange={setSyncOnCellular} />}
          />
          <List.Item
            title="Clear Local Data"
            description="Remove all data stored on this device"
            onPress={() => console.log('Clear data')}
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
