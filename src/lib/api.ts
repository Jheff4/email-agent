// src/lib/api.ts or src/config/api.ts
import axios from "axios";
import { handleApiError } from "@/utils/apiUtils";
import { toast } from "@/hooks/use-toast";

// Create axios instance with base configuration
const api = axios.create({
  // Use import.meta.env for Vite instead of process.env
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // IMPORTANT: This enables cookies to be sent with requests
  withCredentials: true,
});

// Request interceptor - no need to add Authorization header since we're using cookies
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included due to withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    // if (error.response?.status === 401) {
    //   // Redirect to login - the cookie is either expired or invalid
    //   window.location.href = '/login';
    // }
    const apiError = handleApiError(error);
    toast({
      title: "Error",
      description: apiError.message,
      variant: "destructive",
    });
    return Promise.reject(apiError);
  }
);

export default api;
