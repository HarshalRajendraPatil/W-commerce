import axios from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allows cookies to be sent with requests
});

// Request interceptor - adds auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token expiration and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle auth errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't show auth error for login/register endpoints
      const isAuthEndpoint = 
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        toast.error('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
    }
    
    // Show error messages from the API
    const errorMessage = 
      response && response.data && response.data.message
        ? response.data.message
        : 'Something went wrong. Please try again.';
    
    if (!error.config.hideErrorToast) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default api; 