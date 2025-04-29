import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  Chip,
  List,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSyncStatus,
  selectLastSyncTime,
  selectPendingChanges,
  selectIsOnline,
  selectConnectionType,
  selectAllConflicts,
} from '../redux/slices/syncSlice';
import syncService from '../services/SyncService';
import useSyncStatus from '../hooks/useSyncStatus';
import useConflictResolution from '../hooks/useConflictResolution';
import SyncStatusIndicator from '../components/SyncStatusIndicator';

/**
 * Format bytes to a human-readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const SyncScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const syncStatus = useSelector(selectSyncStatus);
  const lastSyncTime = useSelector(selectLastSyncTime);
  const pendingChanges = useSelector(selectPendingChanges);
  const isOnline = useSelector(selectIsOnline);
  const connectionType = useSelector(selectConnectionType);
  const allConflicts = useSelector(selectAllConflicts);
  const { manualSync } = useSyncStatus();
  const { conflicts, resolveConflict, clearResolvedConflicts } = useConflictResolution();

  const [refreshing, setRefreshing] = useState(false);
  const [syncOnCellular, setSyncOnCellular] = useState(false);

  // Format last sync time
  const formattedLastSyncTime = lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never';

  const handleRefresh = async () => {
    setRefreshing(true);
    await manualSync();
    setRefreshing(false);
  };

  const handleResolveConflict = (conflictId, strategy) => {
    resolveConflict(conflictId, strategy);
  };

  const renderConflictItem = conflict => {
    const { id, entityType, entityId, status, clientData, serverData } = conflict;

    return (
      <Card key={id} style={styles.conflictCard}>
        <Card.Content>
          <View style={styles.conflictHeader}>
            <Title>{entityType === 'task' ? 'Task Conflict' : 'Category Conflict'}</Title>
            <Chip mode="outlined" style={getStatusChipStyle(status)}>
              {status}
            </Chip>
          </View>

          <Paragraph>ID: {entityId}</Paragraph>

          {status === 'pending' && (
            <View style={styles.conflictActions}>
              <Button
                mode="contained"
                onPress={() => handleResolveConflict(id, 'client-wins')}
                style={styles.actionButton}
              >
                Use My Version
              </Button>
              <Button
                mode="contained"
                onPress={() => handleResolveConflict(id, 'server-wins')}
                style={styles.actionButton}
              >
                Use Server Version
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const getStatusChipStyle = status => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#FFF9C4' };
      case 'resolved':
        return { backgroundColor: '#C8E6C9' };
      case 'manual':
        return { backgroundColor: '#BBDEFB' };
      case 'failed':
        return { backgroundColor: '#FFCDD2' };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sync Status" />
        {pendingChanges > 0 && isOnline && <Appbar.Action icon="sync" onPress={manualSync} />}
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Card style={styles.statusCard}>
          <Card.Content>
            <Title>Sync Status</Title>
            <View style={styles.statusRow}>
              <Text>Status:</Text>
              <SyncStatusIndicator />
            </View>
            <View style={styles.statusRow}>
              <Text>Last Synced:</Text>
              <Text>{formattedLastSyncTime}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text>Pending Changes:</Text>
              <Text>{pendingChanges}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text>Network:</Text>
              <Text>{isOnline ? `Online (${connectionType})` : 'Offline'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text>Data Saved:</Text>
              <Text>{formatBytes(syncService.syncStatus.dataSaved)}</Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={manualSync}
              disabled={!isOnline || syncStatus === 'syncing'}
            >
              Sync Now
            </Button>
          </Card.Actions>
        </Card>

        <Divider style={styles.divider} />

        <List.Section>
          <List.Subheader>Sync Settings</List.Subheader>
          <List.Item
            title="Sync on Cellular Data"
            description="Allow syncing when not on Wi-Fi"
            right={() => <Switch value={syncOnCellular} onValueChange={setSyncOnCellular} />}
          />
          <List.Item
            title="Clear Sync History"
            description="Remove all sync logs"
            onPress={() => {
              /* Implement clear sync logs */
            }}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {conflicts.length > 0 && (
          <>
            <View style={styles.conflictsHeader}>
              <Title>Conflicts ({conflicts.length})</Title>
              <Button
                mode="text"
                onPress={clearResolvedConflicts}
                disabled={!conflicts.some(c => c.status === 'resolved')}
              >
                Clear Resolved
              </Button>
            </View>

            {conflicts.map(conflict => renderConflictItem(conflict))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  divider: {
    marginVertical: 16,
  },
  conflictsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictCard: {
    marginBottom: 8,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default SyncScreen;
