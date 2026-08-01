const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
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
  deleteTour: (id) => request(`/tours/${id}`, { method: 'DELETE' }),
  updateDriverTour: (id, body) =>
    request(`/driver/tours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
