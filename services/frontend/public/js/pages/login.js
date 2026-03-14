/**
 * Login page.
 */
import { login } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-shell">
      <div class="auth-shell__panel auth-shell__panel--accent animate-fade-in">
        <p class="auth-shell__kicker">Welcome Back</p>
        <h2 class="auth-shell__title">Manage your artist portfolio</h2>
        <p class="auth-shell__text">Access your studio dashboard, add new work, and control how your collectors experience your catalog.</p>
      </div>
      <div class="auth-shell__panel">
        <div class="auth-card card animate-scale-in">
          <div class="card__body auth-card__body">
            <h1 class="auth-card__heading">
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
            <button type="submit" class="btn btn--primary btn--block" id="login-btn">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </button>
          </form>
          <div class="auth-card__footer">
            <p>Don't have an account? <a href="/register" data-link>Register here</a></p>
          </div>
        </div>
      </div>
    </section>
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
