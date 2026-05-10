// src/utils/formatCurrency.js

/**
 * Formats a number into the Indian Rupee currency format.
 * @param {number} amount - The number to format.
 * @returns {string} A formatted currency string (e.g., "₹150.00").
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};
