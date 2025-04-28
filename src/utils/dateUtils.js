/**
 * Utility functions for handling dates in a serializable way
 */

/**
 * Converts a Date object to an ISO string for storage in Redux
 * @param {Date|null} date - The date to serialize
 * @returns {string|null} - ISO string representation or null
 */
export const serializeDate = (date) => {
  if (!date) return null;
  
  // If it's already a string, return it
  if (typeof date === 'string') return date;
  
  // If it's a Date object, convert to ISO string
  if (date instanceof Date) return date.toISOString();
  
  // If it's something else, try to convert it to a Date first
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.error('Error serializing date:', error);
    return null;
  }
};

/**
 * Safely parses a date string to a Date object
 * @param {string|null} dateString - ISO date string
 * @returns {Date|null} - Date object or null
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Ensures a task object has serialized dates
 * @param {Object} task - Task object
 * @returns {Object} - Task with serialized dates
 */
export const ensureSerializedTaskDates = (task) => {
  if (!task) return task;
  
  return {
    ...task,
    dueDate: serializeDate(task.dueDate),
    createdAt: serializeDate(task.createdAt),
    updatedAt: serializeDate(task.updatedAt),
  };
};
