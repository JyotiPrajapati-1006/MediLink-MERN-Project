// src/utils/storage.js

/**
 * Safely retrieves an item from localStorage and parses it as JSON.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any|null} The parsed item, or null if not found or on error.
 */
export const getItem = (key) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item "${key}" from localStorage`, error);
    return null;
  }
};

/**
 * Safely sets an item in localStorage, converting the value to a JSON string.
 * @param {string} key - The key of the item to set.
 * @param {any} value - The value to store.
 */
export const setItem = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item "${key}" in localStorage`, error);
  }
};

/**
 * Removes an item from localStorage.
 * @param {string} key - The key of the item to remove.
 */
export const removeItem = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item "${key}" from localStorage`, error);
  }
};
