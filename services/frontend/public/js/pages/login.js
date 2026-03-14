/**
 * Login page.
 */
import { login } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card card animate-scale-in">
        <div class="card-body" style="padding: var(--spacing-xl);">
          <h1 style="text-align: center; margin-bottom: var(--spacing-lg);">
            <i class="bi bi-box-arrow-in-right"></i> Login
          </h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-input" placeholder="Enter password" required>
            </div>
            <div class="form-group" style="display: flex; align-items: center; gap: var(--spacing-sm);">
              <input type="checkbox" id="remember" class="form-checkbox">
              <label for="remember">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="login-btn">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </button>
          </form>
          <div style="text-align: center; margin-top: var(--spacing-md);">
            <p>Don't have an account? <a href="/register" data-link>Register here</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await login(email, password);
      showToast('Login successful!', 'success');
      router.navigate('/');
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
  });
}
