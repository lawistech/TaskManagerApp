import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Badge, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectSyncStatus, selectPendingChanges, selectIsOnline } from '../redux/slices/syncSlice';
import useSyncStatus from '../hooks/useSyncStatus';

/**
 * Component to display sync status and trigger manual sync
 */
const SyncStatusIndicator = ({ onPress }) => {
  const syncStatus = useSelector(selectSyncStatus);
  const pendingChanges = useSelector(selectPendingChanges);
  const isOnline = useSelector(selectIsOnline);
  const { manualSync } = useSyncStatus();

  // Determine icon and color based on status
  let icon, color, text;

  if (!isOnline) {
    icon = 'cloud-offline';
    color = '#9E9E9E'; // grey500 equivalent
    text = 'Offline';
  } else if (syncStatus === 'syncing') {
    icon = null; // Use activity indicator instead
    color = '#2196F3'; // blue500 equivalent
    text = 'Syncing...';
  } else if (syncStatus === 'error') {
    icon = 'alert-circle';
    color = '#F44336'; // red500 equivalent
    text = 'Sync Error';
  } else if (pendingChanges > 0) {
    icon = 'sync';
    color = '#FF9800'; // orange500 equivalent
    text = `${pendingChanges} pending`;
  } else {
    icon = 'checkmark-circle';
    color = '#4CAF50'; // green500 equivalent
    text = 'Synced';
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (isOnline && pendingChanges > 0) {
      manualSync();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!isOnline && pendingChanges === 0}
    >
      <View style={styles.content}>
        {icon ? (
          <Ionicons name={icon} size={18} color={color} style={styles.icon} />
        ) : (
          <ActivityIndicator size={18} color={color} style={styles.icon} />
        )}
        <Text style={[styles.text, { color }]}>{text}</Text>
      </View>

      {pendingChanges > 0 && (
        <Badge style={[styles.badge, { backgroundColor: color }]}>{pendingChanges}</Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
  },
  badge: {
    marginLeft: 4,
  },
});

export default SyncStatusIndicator;
