// src/utils/formatDate.js

/**
 * Formats a date string into a readable format.
 * @param {string} dateString - The ISO date string from the database.
 * @returns {string} A formatted date string (e.g., "September 12, 2025").
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(dateString).toLocaleDateString("en-IN", options);
};
