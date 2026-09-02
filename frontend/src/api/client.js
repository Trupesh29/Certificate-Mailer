import axios from 'axios';

export const API_URL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
});

export const api = {
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
