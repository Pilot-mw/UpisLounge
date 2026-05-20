import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('upis_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('upis_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh });
          const { access } = res.data;
          localStorage.setItem('upis_access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('upis_access_token');
          localStorage.removeItem('upis_refresh_token');
          localStorage.removeItem('upis_auth');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email, password) => api.post('/token/', { email, password }),
  register: (data) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
};

export const branchesAPI = {
  list: () => api.get('/branches/'),
  get: (id) => api.get(`/branches/${id}/`),
  create: (data) => api.post('/branches/', data),
  update: (id, data) => api.put(`/branches/${id}/`, data),
  delete: (id) => api.delete(`/branches/${id}/`),
};

export const productsAPI = {
  list: (params) => api.get('/products/', { params }),
  get: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  categories: () => api.get('/products/categories/'),
};

export const inventoryAPI = {
  list: (params) => api.get('/inventory/', { params }),
  get: (id) => api.get(`/inventory/${id}/`),
  addStock: (id, quantity) => api.post(`/inventory/${id}/add_stock/`, { quantity }),
  lowStock: (params) => api.get('/inventory/low_stock/', { params }),
};

export const salesAPI = {
  list: (params) => api.get('/sales/', { params }),
  create: (data) => api.post('/sales/', data),
  today: (params) => api.get('/sales/today/', { params }),
};

export const employeesAPI = {
  list: (params) => api.get('/employees/', { params }),
  get: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.put(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
};

export const purchasesAPI = {
  list: (params) => api.get('/purchases/', { params }),
  get: (id) => api.get(`/purchases/${id}/`),
  create: (data) => api.post('/purchases/', data),
};

export const reportsAPI = {
  dashboard: (params) => api.get('/reports/dashboard/', { params }),
  data: (params) => api.get('/reports/data/', { params }),
};
