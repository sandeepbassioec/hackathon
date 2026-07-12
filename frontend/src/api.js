const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export function getRole() {
  return localStorage.getItem('role');
}

// RBAC matrix mirrored from the backend (backend is the real enforcement;
// this only controls what the UI shows/hides).
export function hasRole(...allowed) {
  return allowed.includes(getRole());
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
  localStorage.setItem('role', data.role);
  return data;
}

// Generic authenticated request helper for all backend endpoints
// (vehicles, drivers, trips, maintenance, fuel/expense, reports).
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
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request to ${path} failed with ${res.status}`);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}
