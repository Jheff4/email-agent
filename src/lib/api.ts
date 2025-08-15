import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANT: This enables cookies to be sent with requests
  withCredentials: true,
});

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
    if (error.response?.status === 401) {
      // Redirect to login - the cookie is either expired or invalid
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;