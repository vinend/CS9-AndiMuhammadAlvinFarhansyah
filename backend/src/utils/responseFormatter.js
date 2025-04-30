/**
 * Format API response
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Human-readable message
 * @param {any} payload - Data to return
 * @returns {Object} Formatted response object
 */
const formatResponse = (success, message, payload = null) => {
  return {
    success,
    message,
    payload
  };
};

module.exports = {
  formatResponse
};