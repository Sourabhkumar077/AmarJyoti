import axios from 'axios';
// import { store } from '../store/store';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Verify your backend URL matches
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // If you use cookies
});

// Interceptor: Attach Token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    // Read token directly from storage
    const token = localStorage.getItem('token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;