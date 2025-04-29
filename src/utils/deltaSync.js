/**
 * Utility functions for delta sync operations
 */

/**
 * Calculate the difference between two objects
 * @param {Object} oldObj - The old object state
 * @param {Object} newObj - The new object state
 * @returns {Object} - Object containing only the changed fields
 */
export const calculateDelta = (oldObj, newObj) => {
  if (!oldObj) return newObj;
  if (!newObj) return null;

  const delta = {};
  let hasChanges = false;

  // Always include the ID for reference
  if (newObj.id) {
    delta.id = newObj.id;
  }

  // Compare each property in the new object
  Object.keys(newObj).forEach(key => {
    // Skip the ID field since we already added it
    if (key === 'id') return;

    // If the field doesn't exist in the old object or has changed
    if (
      !oldObj.hasOwnProperty(key) || 
      !isEqual(oldObj[key], newObj[key])
    ) {
      delta[key] = newObj[key];
      hasChanges = true;
    }
  });

  // Return null if no changes were detected (except ID)
  return hasChanges ? delta : null;
};

/**
 * Check if two values are equal, handling dates and nested objects
 * @param {*} val1 - First value
 * @param {*} val2 - Second value
 * @returns {boolean} - Whether the values are equal
 */
export const isEqual = (val1, val2) => {
  // Handle null/undefined
  if (val1 === val2) return true;
  if (val1 === null || val2 === null) return false;
  if (val1 === undefined || val2 === undefined) return false;

  // Handle dates
  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    
    for (let i = 0; i < val1.length; i++) {
      if (!isEqual(val1[i], val2[i])) return false;
    }
    
    return true;
  }

  // Handle objects
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      keys2.includes(key) && isEqual(val1[key], val2[key])
    );
  }

  // Handle primitive values
  return val1 === val2;
};

/**
 * Apply a delta to an object
 * @param {Object} baseObj - The base object
 * @param {Object} delta - The delta to apply
 * @returns {Object} - The updated object
 */
export const applyDelta = (baseObj, delta) => {
  if (!delta) return baseObj;
  if (!baseObj) return delta;

  return {
    ...baseObj,
    ...delta,
  };
};

/**
 * Create a delta operation for the sync queue
 * @param {string} operationType - Type of operation ('create', 'update', 'delete')
 * @param {string} entityType - Type of entity ('task', 'category')
 * @param {Object} oldData - Previous state of the entity
 * @param {Object} newData - New state of the entity
 * @returns {Object} - Delta operation for the sync queue
 */
export const createDeltaOperation = (operationType, entityType, oldData, newData) => {
  // For create and delete operations, we don't need to calculate delta
  if (operationType === 'create') {
    return {
      type: operationType,
      entityType,
      data: newData,
      isDelta: false,
    };
  }

  if (operationType === 'delete') {
    return {
      type: operationType,
      entityType,
      data: { id: newData.id || newData },
      isDelta: false,
    };
  }

  // For update operations, calculate the delta
  const delta = calculateDelta(oldData, newData);
  
  // If there are no changes, return null
  if (!delta) return null;
  
  return {
    type: operationType,
    entityType,
    data: delta,
    isDelta: true,
  };
};
