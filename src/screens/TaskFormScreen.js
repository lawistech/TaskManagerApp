import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar, Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { generateId } from '../utils/idGenerator';

import TaskForm from '../components/TaskForm';
import { addTask, updateTaskDetails } from '../redux/slices/tasksSlice';
import { selectAllCategories } from '../redux/slices/categoriesSlice';

const TaskFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const task = route.params?.task;
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingRef = useRef(false);

  const handleSubmit = values => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      if (task) {
        // Add updatedAt timestamp for existing tasks
        dispatch(
          updateTaskDetails({
            id: task.id,
            ...values,
            updatedAt: new Date().toISOString(),
          }),
        );
      } else {
        const newTask = {
          id: generateId(),
          completed: false,
          createdAt: new Date().toISOString(),
          ...values,
        };
        dispatch(addTask(newTask));
      }

      // Add a small delay before navigation to prevent any race conditions
      setTimeout(() => {
        isSubmittingRef.current = false;
        navigation.goBack();
      }, 300);
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrorMessage(error.message || 'Failed to save task. Please try again.');
      setErrorVisible(true);
      isSubmittingRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={task ? 'Edit Task' : 'Create Task'} />
      </Appbar.Header>

      <TaskForm initialValues={task} onSubmit={handleSubmit} categories={categories} />

      <Snackbar
        visible={errorVisible}
        onDismiss={() => setErrorVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setErrorVisible(false),
        }}
        duration={3000}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
});

export default TaskFormScreen;
