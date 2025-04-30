/**
 * Application configuration
 */

const config = {
  // API URL (production - Vercel deployment)
  apiUrl: 'https://backend-cs9-k52txp3zu-rain-frogs-projects.vercel.app',
  
  // Local development URL (comment out when using production)
  // apiUrl: 'http://localhost:3000',
  
  // Helper function to create proper API request URLs
  createApiUrl: function(endpoint) {
    // Remove leading slash if present to prevent double slashes
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    
    return `${this.apiUrl}/${endpoint}`;
  }
};

export default config;