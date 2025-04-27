import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import TaskForm from '../components/TaskForm';
import { 
  addTask, 
  updateTaskDetails 
} from '../redux/slices/tasksSlice';
import { selectAllCategories } from '../redux/slices/categoriesSlice';

const TaskFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const task = route.params?.task;
  
  const handleSubmit = (values) => {
    if (task) {
      dispatch(updateTaskDetails({ id: task.id, ...values }));
    } else {
      const newTask = {
        id: uuidv4(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...values,
      };
      dispatch(addTask(newTask));
    }
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={task ? 'Edit Task' : 'Create Task'} />
      </Appbar.Header>
      
      <TaskForm
        initialValues={task}
        onSubmit={handleSubmit}
        categories={categories}
      />
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
