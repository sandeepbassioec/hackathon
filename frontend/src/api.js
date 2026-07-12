const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error('Invalid email or password');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

// Generic authenticated request helper for the endpoints the team fills in
// (vehicles, drivers, trips, maintenance, fuel/expense, reports). Falls back
// to mock data (see src/data/mockData.js) until each route is implemented.
export async function apiRequest(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status}`);
  }
  return res.json();
}
