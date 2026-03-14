/**
 * Registration page.
 */
import { register } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-shell">
      <div class="auth-shell__panel auth-shell__panel--accent animate-fade-in">
        <p class="auth-shell__kicker">Artist Workspace</p>
        <h2 class="auth-shell__title">Build your portfolio storefront</h2>
        <p class="auth-shell__text">Sign up as an artist and publish your collection, offers, and private buyer portfolio from one studio dashboard.</p>
      </div>
      <div class="auth-shell__panel">
        <div class="auth-card card animate-scale-in">
          <div class="card__body auth-card__body">
            <h1 class="auth-card__heading">
              <i class="bi bi-person-plus"></i> Create Artist Account
            </h1>
          <form id="register-form">
            <div class="form-group">
              <label for="full-name" class="form-label">Full Name</label>
              <input type="text" id="full-name" class="form-input" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-input" placeholder="Min. 8 characters" required minlength="8">
            </div>
            <button type="submit" class="btn btn--primary btn--block" id="register-btn">
              <i class="bi bi-person-plus"></i> Create Account
            </button>
          </form>
          <div class="auth-card__footer">
            <p>Already have an account? <a href="/login" data-link>Login here</a></p>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';

    try {
      const fullName = document.getElementById('full-name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await register(email, password, fullName);
      showToast('Account created! Please login.', 'success');
      router.navigate('/login');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account';
    }
  });
}
