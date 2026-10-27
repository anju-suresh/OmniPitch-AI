import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to log all AI agent intelligence responses in browser console
apiClient.interceptors.response.use((response) => {
  const url = response.config?.url;
  if (url && (url.includes('/agents/') || url.includes('/datasets/'))) {
    console.log(`\n=============================================================`);
    console.log(`🤖 [OmniPitch Live AI Agent Response Received]: ${url}`);
    console.log(response.data);
    console.log(`=============================================================\n`);
  }
  return response;
}, (error) => {
  console.warn('API Error:', error.message);
  return Promise.reject(error);
});

export const MatchAPI = {
  getState: () => apiClient.get('/match/state').then(r => r.data),
  start: () => apiClient.post('/match/start').then(r => r.data),
  pause: () => apiClient.post('/match/pause').then(r => r.data),
  reset: () => apiClient.post('/match/reset').then(r => r.data),
  setSpeed: (speed) => apiClient.post('/match/speed', { speed }).then(r => r.data)
};

export const AgentAPI = {
  getTacticalBreakdown: (eventId) => apiClient.post('/agents/tactical-breakdown', { eventId }).then(r => r.data),
  generateStory: () => apiClient.post('/agents/generate-story').then(r => r.data),
  localize: (text, targetLanguageCode, fanMode, clubLoyalty) => 
    apiClient.post('/agents/localize', { text, targetLanguageCode, fanMode, clubLoyalty }).then(r => r.data),
  askFanAssistant: (question, favoriteTeam) => 
    apiClient.post('/agents/fan-chat', { question, favoriteTeam }).then(r => r.data),
  getStudioFactpack: () => apiClient.post('/agents/studio-factpack').then(r => r.data),
  getLiveCommentary: (event, recentEvents) => 
    apiClient.post('/agents/live-commentary', { event, recentEvents }).then(r => r.data)
};

export const DatasetAPI = {
  list: () => apiClient.get('/datasets').then(r => r.data),
  generate: (patternType, count) => apiClient.post('/datasets/generate', { patternType, count }).then(r => r.data),
  getExportUrl: (datasetId) => `${API_BASE}/datasets/${datasetId}/export`
};
