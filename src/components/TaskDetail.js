import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Chip, Button, Divider, IconButton } from 'react-native-paper';
import { format } from 'date-fns';

const TaskDetail = ({ task, category, onEdit, onDelete, onToggleComplete }) => {
  if (!task) return null;
  
  const priorityColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#F44336',
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{task.title}</Title>
            <IconButton
              icon={task.completed ? 'check-circle' : 'check-circle-outline'}
              size={24}
              color={task.completed ? '#4CAF50' : '#757575'}
              onPress={onToggleComplete}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Paragraph style={styles.description}>{task.description || 'No description provided'}</Paragraph>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Chip 
                style={[styles.chip, { backgroundColor: task.completed ? '#E8F5E9' : '#EEEEEE' }]}
                textStyle={{ color: task.completed ? '#2E7D32' : '#616161' }}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </Chip>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <Chip 
                style={[styles.chip, { backgroundColor: `${priorityColors[task.priority]}20` }]}
                textStyle={{ color: priorityColors[task.priority] }}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Chip>
            </View>
            
            {task.dueDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                </Text>
              </View>
            )}
            
            {category && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Chip style={styles.chip}>
                  {category.name}
                </Chip>
              </View>
            )}
            
            {task.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(task.createdAt), 'MMMM d, yyyy')}
                </Text>
              </View>
            )}
            
            {task.updatedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(task.updatedAt), 'MMMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={onEdit}
          style={[styles.button, styles.editButton]}
        >
          Edit Task
        </Button>
        <Button 
          mode="outlined" 
          onPress={onDelete}
          style={[styles.button, styles.deleteButton]}
          textColor="#B00020"
        >
          Delete Task
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  detailValue: {
    fontSize: 16,
  },
  chip: {
    height: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
  deleteButton: {
    borderColor: '#B00020',
  },
});

export default TaskDetail;
