import axios from 'axios';
import { BASE_URL } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const tokenManager = {
  getTokens: () => {
    try {
      const tokens = localStorage.getItem('tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  },
  
  setTokens: (tokens) => {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  },
  
  clearTokens: () => {
    localStorage.removeItem('tokens');
  },
  
  getAccessToken: () => {
    const tokens = tokenManager.getTokens();
    return tokens?.access || null;
  },
  
  getRefreshToken: () => {
    const tokens = tokenManager.getTokens();
    return tokens?.refresh || null;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          const tokens = tokenManager.getTokens();
          tokenManager.setTokens({ ...tokens, access });
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => 
    api.post('auth/login/', { email, password }),
  
  requestReset: (email) => 
    api.post('auth/request_reset/', { email }),
  
  verifyReset: (email, code, new_password) => 
    api.post('auth/verify_reset/', { email, code, new_password }),
  
  refreshToken: (refresh) => 
    api.post('token/refresh/', { refresh })
};

// User APIs
export const userAPI = {
  getUsers: () => api.get('users/'),
  createUser: (userData) => api.post('users/', userData),
  getUser: (id) => api.get(`users/${id}/`),
  updateUser: (id, userData) => api.put(`users/${id}/`, userData),
  deleteUser: (id) => api.delete(`users/${id}/`),
  getUserPermissions: (id) => api.get(`users/${id}/permissions/`),
  updateUserPermissions: (id, permissions) => 
    api.put(`users/${id}/permissions/`, { permissions })
};

// Profile APIs
export const profileAPI = {
  getProfile: (id) => api.get(`profile/${id}/`),
  updateProfile: (profileData) => api.put('profile/update_profile/', profileData)
};

// Pages APIs
export const pageAPI = {
  getPages: () => api.get('pages/'),
  getPage: (id) => api.get(`pages/${id}/`)
};

// Comments APIs
export const commentAPI = {
  getComments: (params) => api.get('comments/', { params }),
  createComment: (commentData) => api.post('comments/', commentData),
  getComment: (id) => api.get(`comments/${id}/`),
  updateComment: (id, commentData) => api.put(`comments/${id}/`, commentData),
  deleteComment: (id) => api.delete(`comments/${id}/`)
};

export { tokenManager };
export default api;