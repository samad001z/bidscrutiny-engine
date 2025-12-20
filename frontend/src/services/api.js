import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://web-production-f4013.up.railway.app",
});

export default api;
