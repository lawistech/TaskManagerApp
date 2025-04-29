/**
 * Utility functions for repairing corrupted data
 */
import { store } from '../redux/store';
import { generateId } from './idGenerator';
import { ensureSerializedTaskDates } from './dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Repair task data by fixing common issues
 * @returns {Object} - Results of the repair operation
 */
export const repairTaskData = async () => {
  const state = store.getState();
  const tasks = state.tasks.tasks;
  const results = {
    total: tasks.length,
    repaired: 0,
    issues: [],
  };

  // Create a new array to hold the repaired tasks
  const repairedTasks = [];
  const taskIds = new Set();

  // Process each task
  for (const task of tasks) {
    let repairedTask = { ...task };
    let hasIssues = false;

    // Check for missing ID
    if (!repairedTask.id) {
      repairedTask.id = generateId();
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Missing ID' });
    }

    // Check for duplicate ID
    if (taskIds.has(repairedTask.id)) {
      // Generate a new ID for the duplicate
      const oldId = repairedTask.id;
      repairedTask.id = generateId();
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: `Duplicate ID (was ${oldId})` });
    }

    // Add the ID to the set
    taskIds.add(repairedTask.id);

    // Check for missing required fields
    if (!repairedTask.title) {
      repairedTask.title = 'Untitled Task';
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Missing title' });
    }

    // Check for invalid dates
    if (repairedTask.dueDate && isNaN(new Date(repairedTask.dueDate).getTime())) {
      repairedTask.dueDate = null;
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Invalid due date' });
    }

    if (repairedTask.createdAt && isNaN(new Date(repairedTask.createdAt).getTime())) {
      repairedTask.createdAt = new Date().toISOString();
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Invalid created date' });
    }

    if (repairedTask.updatedAt && isNaN(new Date(repairedTask.updatedAt).getTime())) {
      repairedTask.updatedAt = new Date().toISOString();
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Invalid updated date' });
    }

    // Ensure dates are serialized
    repairedTask = ensureSerializedTaskDates(repairedTask);

    // Check for missing priority
    if (!repairedTask.priority || !['low', 'medium', 'high'].includes(repairedTask.priority)) {
      repairedTask.priority = 'medium';
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Invalid priority' });
    }

    // Check for missing completed flag
    if (repairedTask.completed === undefined || repairedTask.completed === null) {
      repairedTask.completed = false;
      hasIssues = true;
      results.issues.push({ id: repairedTask.id, issue: 'Missing completed flag' });
    }

    // Add the repaired task to the array
    repairedTasks.push(repairedTask);

    // Increment the repaired count if issues were found
    if (hasIssues) {
      results.repaired++;
    }
  }

  // If any tasks were repaired, update the store
  if (results.repaired > 0) {
    // Update the tasks in AsyncStorage directly
    try {
      // Get the current persisted state
      const persistedState = await AsyncStorage.getItem('persist:root');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        const tasksState = JSON.parse(parsedState.tasks);
        
        // Update the tasks array
        tasksState.tasks = repairedTasks;
        
        // Serialize and save back to AsyncStorage
        parsedState.tasks = JSON.stringify(tasksState);
        await AsyncStorage.setItem('persist:root', JSON.stringify(parsedState));
      }
    } catch (error) {
      console.error('Error updating AsyncStorage:', error);
    }
  }

  return results;
};

/**
 * Repair category data by fixing common issues
 * @returns {Object} - Results of the repair operation
 */
export const repairCategoryData = async () => {
  const state = store.getState();
  const categories = state.categories.categories;
  const results = {
    total: categories.length,
    repaired: 0,
    issues: [],
  };

  // Create a new array to hold the repaired categories
  const repairedCategories = [];
  const categoryIds = new Set();

  // Process each category
  for (const category of categories) {
    let repairedCategory = { ...category };
    let hasIssues = false;

    // Check for missing ID
    if (!repairedCategory.id) {
      repairedCategory.id = generateId();
      hasIssues = true;
      results.issues.push({ id: repairedCategory.id, issue: 'Missing ID' });
    }

    // Check for duplicate ID
    if (categoryIds.has(repairedCategory.id)) {
      // Generate a new ID for the duplicate
      const oldId = repairedCategory.id;
      repairedCategory.id = generateId();
      hasIssues = true;
      results.issues.push({ id: repairedCategory.id, issue: `Duplicate ID (was ${oldId})` });
    }

    // Add the ID to the set
    categoryIds.add(repairedCategory.id);

    // Check for missing required fields
    if (!repairedCategory.name) {
      repairedCategory.name = 'Untitled Category';
      hasIssues = true;
      results.issues.push({ id: repairedCategory.id, issue: 'Missing name' });
    }

    // Check for missing color
    if (!repairedCategory.color) {
      repairedCategory.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      hasIssues = true;
      results.issues.push({ id: repairedCategory.id, issue: 'Missing color' });
    }

    // Add the repaired category to the array
    repairedCategories.push(repairedCategory);

    // Increment the repaired count if issues were found
    if (hasIssues) {
      results.repaired++;
    }
  }

  // If any categories were repaired, update the store
  if (results.repaired > 0) {
    // Update the categories in AsyncStorage directly
    try {
      // Get the current persisted state
      const persistedState = await AsyncStorage.getItem('persist:root');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        const categoriesState = JSON.parse(parsedState.categories);
        
        // Update the categories array
        categoriesState.categories = repairedCategories;
        
        // Serialize and save back to AsyncStorage
        parsedState.categories = JSON.stringify(categoriesState);
        await AsyncStorage.setItem('persist:root', JSON.stringify(parsedState));
      }
    } catch (error) {
      console.error('Error updating AsyncStorage:', error);
    }
  }

  return results;
};

/**
 * Repair all data in the store
 * @returns {Object} - Results of the repair operation
 */
export const repairAllData = async () => {
  const taskResults = await repairTaskData();
  const categoryResults = await repairCategoryData();

  return {
    tasks: taskResults,
    categories: categoryResults,
    totalRepaired: taskResults.repaired + categoryResults.repaired,
  };
};
