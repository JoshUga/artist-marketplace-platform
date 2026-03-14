/**
 * Authentication service.
 */
import api from './api.js';
import store from '../utils/state.js';

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('access_token', data.data.access_token);
  localStorage.setItem('refresh_token', data.data.refresh_token);
  await loadCurrentUser();
  return data;
}

export async function register(email, password, fullName, role = 'buyer') {
  return api.post('/auth/register', { email, password, full_name: fullName, role });
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch (e) { /* ignore */ }
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  store.set('isAuthenticated', false);
  store.set('user', null);
  window.dispatchEvent(new Event('auth-changed'));
}

export async function loadCurrentUser() {
  try {
    const data = await api.get('/auth/me');
    store.set('user', data.data);
    store.set('isAuthenticated', true);
    window.dispatchEvent(new Event('auth-changed'));
    return data.data;
  } catch (e) {
    store.set('isAuthenticated', false);
    store.set('user', null);
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export function getCurrentUser() {
  return store.get('user');
}
