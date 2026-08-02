const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'tm.token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      setToken('');
      onUnauthorized?.();
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  changePassword: (body) =>
    request('/auth/password', { method: 'POST', body: JSON.stringify(body) }),

  getUsers: () => request('/users'),
  createUser: (body) =>
    request('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id, body) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getVehicles: () => request('/vehicles'),
  getVehicle: (id) => request(`/vehicles/${id}`),
  getVehicleTours: (id) => request(`/vehicles/${id}/tours`),
  createVehicle: (body) =>
    request('/vehicles', { method: 'POST', body: JSON.stringify(body) }),
  updateVehicle: (id, body) =>
    request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  getCompanies: () => request('/companies'),
  createCompany: (body) =>
    request('/companies', { method: 'POST', body: JSON.stringify(body) }),
  updateCompany: (id, body) =>
    request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCompany: (id) => request(`/companies/${id}`, { method: 'DELETE' }),

  getTours: () => request('/tours'),
  getUnassignedTours: () => request('/tours/unassigned'),
  getTour: (id) => request(`/tours/${id}`),
  createTour: (body) =>
    request('/tours', { method: 'POST', body: JSON.stringify(body) }),
  updateTour: (id, body) =>
    request(`/tours/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  markTourPaymentReceived: (id) =>
    request(`/tours/${id}/payment-received`, { method: 'PATCH' }),
  deleteTour: (id) => request(`/tours/${id}`, { method: 'DELETE' }),
  updateDriverTour: (id, body) =>
    request(`/driver/tours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
