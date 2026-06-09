// src/api/index.js
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('bsp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bsp_token');
      localStorage.removeItem('bsp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: d => http.post('/auth/register', d),
  login:    d => http.post('/auth/login', d),
  me:       () => http.get('/auth/me'),
};

export const books = {
  list:           p => http.get('/books', { params: p }),
  get:            id => http.get(`/books/${id}`),
  create:         d  => http.post('/books', d),
  update:         (id, d) => http.put(`/books/${id}`, d),
  remove:         id => http.delete(`/books/${id}`),
  stats:          () => http.get('/books/stats'),
  featured:       () => http.get('/books/featured'),
  categories:     () => http.get('/books/categories'),
  toggleFeatured: id => http.patch(`/books/${id}/featured`),
};
