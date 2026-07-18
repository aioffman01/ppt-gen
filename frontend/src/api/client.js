import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor (e.g. to attach auth tokens in the future)
client.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (e.g. for global error handling)
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Custom error logging or handling
    const customError = {
      message: error.response?.data?.detail || error.message || '알 수 없는 서버 오류가 발생했습니다.',
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export default client;
