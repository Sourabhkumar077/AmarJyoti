import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

// Interceptor: Attach Token AND Guest ID to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    // 1. Auth Token
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Guest ID (Crucial for guest cart persistence)
    const guestId = localStorage.getItem('guest_cart_id');
    if (guestId) {
      config.headers['x-guest-id'] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;