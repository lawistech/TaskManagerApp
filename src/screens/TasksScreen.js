import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

import TaskList from '../components/TaskList';
import { selectAllTasks, toggleTaskCompletion } from '../redux/slices/tasksSlice';
import { selectAllCategories } from '../redux/slices/categoriesSlice';

const TasksScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);
  const categories = useSelector(selectAllCategories);

  const handleTaskPress = task => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleToggleComplete = taskId => {
    dispatch(toggleTaskCompletion(taskId));
  };

  const handleAddTask = () => {
    navigation.navigate('TaskForm');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Tasks" />
        <Appbar.Action icon="filter" onPress={() => {}} />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>

      <TaskList
        tasks={tasks}
        categories={categories}
        onTaskPress={handleTaskPress}
        onToggleComplete={handleToggleComplete}
        onAddTask={handleAddTask}
      />

      <FAB style={styles.fab} icon="plus" onPress={handleAddTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default TasksScreen;
