import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const predictTraffic = async (data) => {
  const response = await api.post('/predict', data);
  return response.data;
};

export const analyzeCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/analyze-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDetections = async (params = {}) => {
  const response = await api.get('/detections', { params });
  return response.data;
};

export const getDetectionDetail = async (id) => {
  const response = await api.get(`/detections/${id}`);
  return response.data;
};

export const getExplanation = async (id) => {
  const response = await api.get(`/explanation/${id}`);
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get('/model-info');
  return response.data;
};

export const triggerTraining = async () => {
  const response = await api.post('/train');
  return response.data;
};

export default api;
