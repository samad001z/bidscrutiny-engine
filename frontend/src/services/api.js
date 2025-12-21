import axios from "axios";

// Determine API URL based on environment
const getAPIUrl = () => {
  // Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production: use same domain
  if (!import.meta.env.DEV) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
  
  // Development: use localhost
  return "http://localhost:8000";
};

const API_URL = getAPIUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 300 seconds (5 minutes) - AI processing takes time
});

// Log API configuration
console.log(`[API Config] Environment: ${import.meta.env.DEV ? "DEVELOPMENT" : "PRODUCTION"}`);
console.log(`[API Config] Base URL: ${api.defaults.baseURL}`);

// Add detailed request logging
api.interceptors.request.use(config => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add retry logic for failed requests
api.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.status} ${response.statusText}`);
    return response;
  },
  async error => {
    const config = error.config;
    
    // Retry on CORS or network errors (max 3 attempts)
    if (!config.retry) config.retry = 0;
    
    console.log(`[API Error] ${error.code} - ${error.message} (attempt ${config.retry + 1}/3)`);
    
    if ((error.code === "ERR_NETWORK" || error.response?.status === 0 || error.message?.includes("CORS")) && config.retry < 3) {
      config.retry++;
      console.log(`Retrying request (attempt ${config.retry}/3) after ${1000 * config.retry}ms...`);
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retry));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;
