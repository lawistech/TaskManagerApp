/**
 * Utility function to generate unique IDs without relying on the uuid library
 * This is a workaround for the crypto.getRandomValues() not supported error
 *
 * @returns {string} A unique ID
 */

// Keep a counter to ensure uniqueness even when IDs are generated in the same millisecond
let counter = 0;

// Keep track of generated IDs to avoid duplicates
const generatedIds = new Set();

export const generateId = () => {
  let id;
  let attempts = 0;

  do {
    // Generate a timestamp component
    const timestamp = new Date().getTime().toString(36);

    // Increment counter for each ID generation to ensure uniqueness
    counter = (counter + 1) % 1000000;

    // Generate a random component with more entropy
    const randomPart1 = Math.random().toString(36).substring(2, 8);
    const randomPart2 = Math.random().toString(36).substring(2, 8);

    // Combine timestamp, counter, and random parts to create a unique ID
    id = `${timestamp}-${counter.toString(36)}-${randomPart1}${randomPart2}`;

    attempts++;

    // Prevent infinite loops
    if (attempts > 10) {
      // Add a truly unique suffix as a last resort
      id = `${id}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      break;
    }
  } while (generatedIds.has(id));

  // Add the ID to our set of generated IDs
  generatedIds.add(id);

  // Limit the size of the set to prevent memory leaks
  if (generatedIds.size > 10000) {
    // Convert to array, remove the oldest entries, and convert back to set
    const idsArray = Array.from(generatedIds);
    generatedIds.clear();
    idsArray.slice(5000).forEach(id => generatedIds.add(id));
  }

  return id;
};
