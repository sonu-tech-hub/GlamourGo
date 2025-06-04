// // client/src/services/api.jsx
// import axios from "axios";
// import { API_URL } from "../config/config"; // Fix the path (removed .js extension and changed to proper relative path)

// const api = axios.create({
//   baseURL: `${API_URL}/api`
// });

// // Add token to requests if available
// api.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );

// // Handle token expiration
// api.interceptors.response.use(
//   response => {
//     return response;
//   },
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;// client/src/services/api.jsx
import axios from "axios";
import { API_URL } from "../config/config1.js";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000, // add timeout to prevent hanging requests
});

// Add token to requests if available
api.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle token expiration and other errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status >= 500) {
        // Server error
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // No response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;