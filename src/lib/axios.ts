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
  (response) => {
    if (response.data == null) {
      return Promise.reject({
        error: 'Error',
        message: 'No data received from server'
      });
    }

    if (response.data.code === '0') {
      return Promise.reject({
        error: 'Error',
        message: response.data.msg,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth-token');

      // if (window.location.pathname !== "/login") {
      // window.location.href = "/login";
      // const authErrorEvent = new CustomEvent("auth:unauthorized");
      // window.dispatchEvent(authErrorEvent);
      // }

      // You might want to redirect to login page or handle differently
    }
    return Promise.reject(error);
  }
);

export default axios;
