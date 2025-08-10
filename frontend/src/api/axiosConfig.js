import axios from 'axios';

<<<<<<< Updated upstream
// Set the base URL for all API requests
// Use environment variable in production, fallback to localhost for development
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3003';
axios.defaults.baseURL = baseURL;
=======
// Proxy is configured in package.json, so we use relative URLs
// axios.defaults.baseURL = 'http://localhost:3003';
>>>>>>> Stashed changes

// Add request interceptor to include auth token
axios.interceptors.request.use(
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

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;