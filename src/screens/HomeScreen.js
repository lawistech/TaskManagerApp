import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Manager Dashboard</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Today's Tasks</Title>
          <Paragraph>You have 0 tasks for today</Paragraph>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Upcoming Tasks</Title>
          <Paragraph>You have 0 upcoming tasks</Paragraph>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Completed Tasks</Title>
          <Paragraph>You have completed 0 tasks</Paragraph>
        </Card.Content>
      </Card>
    </View>
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
});

export default HomeScreen;
