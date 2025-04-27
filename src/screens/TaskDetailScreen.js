import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

import TaskDetail from '../components/TaskDetail';
import { 
  selectTaskById, 
  removeTask, 
  toggleTaskCompletion 
} from '../redux/slices/tasksSlice';
import { selectCategoryById } from '../redux/slices/categoriesSlice';

const TaskDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const taskId = route.params?.taskId;
  const task = useSelector(state => selectTaskById(state, taskId));
  const category = useSelector(state => 
    task?.categoryId ? selectCategoryById(state, task.categoryId) : null
  );
  
  if (!task) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Task Not Found" />
        </Appbar.Header>
      </View>
    );
  }
  
  const handleEdit = () => {
    navigation.navigate('TaskForm', { task });
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            dispatch(removeTask(taskId));
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleToggleComplete = () => {
    dispatch(toggleTaskCompletion(taskId));
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Task Details" />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>
      
      <TaskDetail
        task={task}
        category={category}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
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

export default TaskDetailScreen;
