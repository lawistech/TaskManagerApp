import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';
import { format } from 'date-fns';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Placeholder tasks for the selected date
  const tasks = [
    { id: '1', title: 'Team meeting', description: 'Discuss project progress', time: '10:00 AM' },
    { id: '2', title: 'Code review', description: 'Review pull requests', time: '2:00 PM' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      
      <View style={styles.calendarContainer}>
        <Text style={styles.currentDate}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
        {/* Calendar component will be added here */}
        <Text style={styles.calendarPlaceholder}>Calendar will be implemented here</Text>
      </View>
      
      <View style={styles.tasksContainer}>
        <Text style={styles.tasksHeader}>Tasks for {format(selectedDate, 'MMMM d')}</Text>
        
        {tasks.map(task => (
          <Card key={task.id} style={styles.taskCard}>
            <Card.Content>
              <Title>{task.title}</Title>
              <Paragraph>{task.description}</Paragraph>
              <Text style={styles.taskTime}>{task.time}</Text>
            </Card.Content>
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <Text style={styles.noTasks}>No tasks for this day</Text>
        )}
      </View>
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
  calendarContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  currentDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calendarPlaceholder: {
    textAlign: 'center',
    padding: 40,
    color: 'gray',
  },
  tasksContainer: {
    flex: 1,
    padding: 16,
  },
  tasksHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskTime: {
    marginTop: 8,
    color: 'gray',
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default CalendarScreen;
