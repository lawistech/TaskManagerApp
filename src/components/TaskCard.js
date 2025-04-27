import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Checkbox, Chip } from 'react-native-paper';
import { format } from 'date-fns';

const TaskCard = ({ task, category, onPress, onToggleComplete }) => {
  const priorityColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#F44336',
  };
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, task.completed && styles.completedCard]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={task.completed ? 'checked' : 'unchecked'}
              onPress={() => onToggleComplete(task.id)}
            />
          </View>
          
          <View style={styles.contentContainer}>
            <Text 
              style={[styles.title, task.completed && styles.completedText]} 
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {task.description ? (
              <Text 
                style={[styles.description, task.completed && styles.completedText]} 
                numberOfLines={2}
              >
                {task.description}
              </Text>
            ) : null}
            
            <View style={styles.detailsContainer}>
              {task.dueDate && (
                <Chip 
                  style={styles.chip} 
                  textStyle={styles.chipText}
                  icon="calendar"
                >
                  {format(new Date(task.dueDate), 'MMM d')}
                </Chip>
              )}
              
              <Chip 
                style={[styles.chip, { backgroundColor: `${priorityColors[task.priority]}20` }]} 
                textStyle={{ color: priorityColors[task.priority] }}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Chip>
              
              {category && (
                <Chip 
                  style={[styles.chip, { backgroundColor: `${category.color}20` }]} 
                  textStyle={{ color: category.color }}
                >
                  {category.name}
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  completedCard: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  cardContent: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    marginRight: 8,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    height: 24,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
});

export default TaskCard;
