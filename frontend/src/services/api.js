import axios from "axios";

const railwayURL = "https://web-production-f4013.up.railway.app";
const localhostURL = "http://localhost:8000";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || railwayURL,
  timeout: 12000,
});

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
