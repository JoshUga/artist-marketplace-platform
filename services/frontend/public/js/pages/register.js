/**
 * Registration page.
 */
import { register } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card card animate-scale-in">
        <div class="card-body" style="padding: var(--spacing-xl);">
          <h1 style="text-align: center; margin-bottom: var(--spacing-lg);">
            <i class="bi bi-person-plus"></i> Create Account
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
            <div class="form-group">
              <label for="role" class="form-label">I am a</label>
              <select id="role" class="form-select">
                <option value="buyer">Buyer</option>
                <option value="artist">Artist</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="register-btn">
              <i class="bi bi-person-plus"></i> Create Account
            </button>
          </form>
          <div style="text-align: center; margin-top: var(--spacing-md);">
            <p>Already have an account? <a href="/login" data-link>Login here</a></p>
          </div>
        </div>
      </div>
    </div>
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
      const role = document.getElementById('role').value;
      await register(email, password, fullName, role);
      showToast('Account created! Please login.', 'success');
      router.navigate('/login');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account';
    }
  });
}
