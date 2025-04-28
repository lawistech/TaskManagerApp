/**
 * Utility function to generate unique IDs without relying on the uuid library
 * This is a workaround for the crypto.getRandomValues() not supported error
 * 
 * @returns {string} A unique ID
 */
export const generateId = () => {
  // Generate a timestamp component
  const timestamp = new Date().getTime().toString(36);
  
  // Generate a random component
  const randomPart = Math.random().toString(36).substring(2, 10);
  
  // Combine timestamp and random parts to create a unique ID
  return `${timestamp}-${randomPart}`;
};
