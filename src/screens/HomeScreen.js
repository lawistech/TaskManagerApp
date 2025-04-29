import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectAllTasks } from '../redux/slices/tasksSlice';
import { parseDate } from '../utils/dateUtils';
import { format, isToday, isFuture } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const tasks = useSelector(selectAllTasks);
  const navigation = useNavigation();

  // Filter tasks for today, upcoming, and completed
  const todayTasks = tasks.filter(
    task => task.dueDate && isToday(parseDate(task.dueDate)) && !task.completed,
  );

  const upcomingTasks = tasks.filter(
    task =>
      task.dueDate &&
      isFuture(parseDate(task.dueDate)) &&
      !isToday(parseDate(task.dueDate)) &&
      !task.completed,
  );

  const completedTasks = tasks.filter(task => task.completed);

  // Get the most recent tasks for each category (limited to 3)
  const recentTodayTasks = todayTasks.slice(0, 3);
  const recentUpcomingTasks = upcomingTasks.slice(0, 3);
  const recentCompletedTasks = completedTasks.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Task Manager Dashboard</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Today's Tasks</Title>
          <Paragraph>You have {todayTasks.length} tasks for today</Paragraph>

          {recentTodayTasks.map(task => (
            <Card
              key={task.id}
              style={styles.taskCard}
              onPress={() =>
                navigation.navigate('Tasks', {
                  screen: 'TaskDetail',
                  params: { taskId: task.id },
                })
              }
            >
              <Card.Content>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.dueDate && (
                  <Text style={styles.taskDate}>
                    Due: {format(parseDate(task.dueDate), 'h:mm a')}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}

          {todayTasks.length > 0 && (
            <Button
              mode="text"
              onPress={() => navigation.navigate('Tasks', { filter: 'today' })}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Upcoming Tasks</Title>
          <Paragraph>You have {upcomingTasks.length} upcoming tasks</Paragraph>

          {recentUpcomingTasks.map(task => (
            <Card
              key={task.id}
              style={styles.taskCard}
              onPress={() =>
                navigation.navigate('Tasks', {
                  screen: 'TaskDetail',
                  params: { taskId: task.id },
                })
              }
            >
              <Card.Content>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.dueDate && (
                  <Text style={styles.taskDate}>
                    Due: {format(parseDate(task.dueDate), 'MMM d')}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}

          {upcomingTasks.length > 0 && (
            <Button
              mode="text"
              onPress={() => navigation.navigate('Tasks', { filter: 'upcoming' })}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Completed Tasks</Title>
          <Paragraph>You have completed {completedTasks.length} tasks</Paragraph>

          {recentCompletedTasks.map(task => (
            <Card
              key={task.id}
              style={styles.taskCard}
              onPress={() =>
                navigation.navigate('Tasks', {
                  screen: 'TaskDetail',
                  params: { taskId: task.id },
                })
              }
            >
              <Card.Content>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.completedAt && (
                  <Text style={styles.taskDate}>
                    Completed: {format(parseDate(task.completedAt), 'MMM d')}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}

          {completedTasks.length > 0 && (
            <Button
              mode="text"
              onPress={() => navigation.navigate('Tasks', { filter: 'completed' })}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  taskCard: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default HomeScreen;
