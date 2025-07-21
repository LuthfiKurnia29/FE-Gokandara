import Axios from 'axios';

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Request interceptor to add authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers['Accept'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access (token expired or invalid)
      localStorage.removeItem('auth-token');

      // Dispatch custom event to notify AuthProvider about token expiration
      const authErrorEvent = new CustomEvent('auth:unauthorized');
      window.dispatchEvent(authErrorEvent);
    }
    return Promise.reject(error);
  }
);

export default axios;
