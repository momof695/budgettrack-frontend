// Fichier : src/services/api.js
// Configuration Axios — toutes les requêtes passent par ici

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://budgettrack-api.onrender.com/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Ajoute le token automatiquement à chaque requête
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Redirige vers /login si token expiré (401)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ───────────────────────────────────────────────────
export const authService = {
  register: d  => api.post('/auth/register', d),
  login:    d  => api.post('/auth/login', d),
  logout:   () => api.post('/auth/logout'),
  me:       () => api.get('/auth/me'),
  updateProfile: d => api.put('/auth/profile', d),
  updatePassword: d => api.put('/auth/password', d),
}

// ── Transactions ───────────────────────────────────────────
export const transactionService = {
  list:    p => api.get('/transactions', { params: p }),
  create:  d => api.post('/transactions', d),
  update:  (id, d) => api.put(`/transactions/${id}`, d),
  remove:  id => api.delete(`/transactions/${id}`),
}

// ── Catégories ─────────────────────────────────────────────
export const categoryService = {
  list:   () => api.get('/categories'),
  create:  d => api.post('/categories', d),
  update:  (id, d) => api.put(`/categories/${id}`, d),
  remove:  id => api.delete(`/categories/${id}`),
}

// ── Objectifs ──────────────────────────────────────────────
export const goalService = {
  list:    () => api.get('/goals'),
  create:   d => api.post('/goals', d),
  update:   (id, d) => api.put(`/goals/${id}`, d),
  remove:   id => api.delete(`/goals/${id}`),
  deposit:  (id, d) => api.post(`/goals/${id}/deposit`, d),
}

// ── Dashboard ──────────────────────────────────────────────
export const dashboardService = {
  get: () => api.get('/dashboard'),
}

export default api