/**
 * Lightweight global state management with pub/sub pattern.
 */
class Store {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = new Map();
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;
    if (oldValue !== value) {
      this._notify(key, value, oldValue);
    }
  }

  getState() {
    return { ...this._state };
  }

  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    return () => this._listeners.get(key)?.delete(callback);
  }

  _notify(key, newValue, oldValue) {
    this._listeners.get(key)?.forEach(cb => {
      try { cb(newValue, oldValue); } catch (e) { console.error('State listener error:', e); }
    });
  }
}

const store = new Store({
  isAuthenticated: false,
  user: null,
  theme: localStorage.getItem('theme') || 'light',
  toasts: [],
});

export default store;
