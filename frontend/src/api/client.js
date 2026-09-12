import axios from 'axios';

export const API_URL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await client.post('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data;
  },

  getBatches: async () => {
    const res = await client.get('/batches');
    return res.data;
  },
  uploadTemplate: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createBatch: async (templateId, csvFile) => {
    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('file', csvFile);
    const res = await client.post('/batches', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  sendBatch: async (batchId) => {
    const res = await client.post(`/batches/${batchId}/send`);
    return res.data;
  },

  getBatchStatus: async (batchId) => {
    const res = await client.get(`/batches/${batchId}/status`);
    return res.data;
  },

  retryFailedBatch: async (batchId) => {
    const res = await client.post(`/batches/${batchId}/retry-failed`);
    return res.data;
  },
};

export default api;
