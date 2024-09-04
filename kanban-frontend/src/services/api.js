import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
          localStorage.setItem('access', data.access);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/';
        }
      } else {
        clearTokens();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const saveTokens = (access, refresh) => {
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
  setAuthToken(access);
};

const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  setAuthToken(null);
};

export const login = async (username, password) => {
  const response = await api.post('/login/', { username, password });
  const { access, refresh } = response.data;
  saveTokens(access, refresh);
  return response.data;
};

export const logout = () => {
  clearTokens();
  window.location.href = '/login';
};

export const fetchStatistics = async () => {
  const response = await api.get('/statistics/');
  return response.data;
};

export const fetchBoardData = async () => {
  const response = await api.get('/tasks/');
  return response.data.board;
};

export const updateTaskColumn = async (taskId, columnId) => {
  const response = await api.patch(`/tasks/${taskId}/`, { column: columnId });
  return response.data;
};

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}/`);
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};

export const fetchTaskChoices = async () => {
  const response = await api.get('/tasks/choices/');
  return response.data;
};

export default api;
