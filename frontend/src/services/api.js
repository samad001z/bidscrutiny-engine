import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://web-production-f4013.up.railway.app",
  timeout: 10000,
});

// Add retry logic for failed requests
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    // Retry on CORS or network errors (max 3 attempts)
    if (!config.retry) config.retry = 0;
    
    if ((error.code === "ERR_NETWORK" || error.response?.status === 0 || error.message?.includes("CORS")) && config.retry < 3) {
      config.retry++;
      console.log(`Retrying request (attempt ${config.retry})...`);
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retry));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;
