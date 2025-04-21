/**
 * Utility functions to convert between camelCase and snake_case
 * Use when sending data to API or receiving data from API
 */

/**
 * Convert a camelCase string to snake_case
 * @param {string} str - The camelCase string
 * @returns {string} - The snake_case string
 */
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert a snake_case string to camelCase
 * @param {string} str - The snake_case string
 * @returns {string} - The camelCase string
 */
export const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert an object's keys from camelCase to snake_case
 * @param {Object} obj - The object with camelCase keys
 * @returns {Object} - The object with snake_case keys
 */
export const objectToCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(objectToCamelCase);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    
    acc[camelKey] = objectToCamelCase(value);
    return acc;
  }, {});
};

/**
 * Convert an object's keys from camelCase to snake_case
 * @param {Object} obj - The object with camelCase keys
 * @returns {Object} - The object with snake_case keys
 */
export const objectToSnakeCase = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(objectToSnakeCase);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    const value = obj[key];
    
    acc[snakeKey] = objectToSnakeCase(value);
    return acc;
  }, {});
}; 