import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
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

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const api = {
  // Auth
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await apiClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Peserta
  getPeserta: async (params = {}) => {
    const response = await apiClient.get('/peserta', { params });
    return response.data;
  },

  getPesertaById: async (id) => {
    const response = await apiClient.get(`/peserta/${id}`);
    return response.data;
  },

  createPeserta: async (data) => {
    const response = await apiClient.post('/peserta', data);
    return response.data;
  },

  updatePeserta: async (id, data) => {
    const response = await apiClient.put(`/peserta/${id}`, data);
    return response.data;
  },

  deletePeserta: async (id) => {
    const response = await apiClient.delete(`/peserta/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/peserta/stats/summary');
    return response.data;
  },

  // Upload
  uploadExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await apiClient.get('/upload/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Arsip
  getArsipYears: async () => {
    const response = await apiClient.get('/upload/arsip/years');
    return response.data;
  },

  getArsipFiles: async (year) => {
    const response = await apiClient.get(`/upload/arsip/${year}`);
    return response.data;
  },

  downloadArsipFile: async (year, filename) => {
    const response = await apiClient.get(`/upload/arsip/${year}/${filename}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteArsipFile: async (year, filename) => {
    const response = await apiClient.delete(`/upload/arsip/${year}/${filename}`);
    return response.data;
  },
};

export default api;