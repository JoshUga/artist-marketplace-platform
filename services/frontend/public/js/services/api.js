/**
 * API client for communicating with backend microservices.
 */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:80/api'
  : '/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async _request(method, path, body = null) {
    const options = {
      method,
      headers: this._getHeaders(),
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, options);

    if (response.status === 401) {
      // Try refresh
      const refreshed = await this._tryRefresh();
      if (refreshed) {
        options.headers = this._getHeaders();
        const retryResponse = await fetch(`${this.baseUrl}${path}`, options);
        return this._handleResponse(retryResponse);
      }
      // Refresh failed, logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth-changed'));
      throw new Error('Session expired');
    }

    return this._handleResponse(response);
  }

  async _handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return { data: await response.text() };
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Request failed');
    }
    return data;
  }

  async _tryRefresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  get(path) { return this._request('GET', path); }
  post(path, body) { return this._request('POST', path, body); }
  put(path, body) { return this._request('PUT', path, body); }
  delete(path) { return this._request('DELETE', path); }
}

const api = new ApiClient(API_BASE);
export default api;
