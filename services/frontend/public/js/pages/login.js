/**
 * Login page.
 */
import { login } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-stage auth-stage--login">
      <div class="auth-stage__panel auth-stage__panel--form">
        <a href="/" class="auth-stage__mark" data-link>
          <i class="bi bi-palette"></i>
          <span>ArtMarket</span>
        </a>
        <div class="auth-card card animate-scale-in">
          <div class="card__body auth-card__body">
            <p class="auth-card__eyebrow">Collector Access</p>
            <h1 class="auth-card__heading">Welcome back</h1>
            <p class="auth-card__subtext">Sign in to manage your portfolio, inquiries, releases, and private buyer lists.</p>
            <form id="login-form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
              </div>
              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" class="form-input" placeholder="Enter password" required>
              </div>
              <label class="auth-card__check" for="remember">
                <input type="checkbox" id="remember">
                <span>Remember me</span>
              </label>
              <button type="submit" class="btn btn--primary btn--block" id="login-btn">
                <i class="bi bi-box-arrow-in-right"></i> Login
              </button>
            </form>
            <div class="auth-card__footer">
              <p>Don't have an account? <a href="/register" data-link>Register here</a></p>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-stage__panel auth-stage__panel--visual animate-fade-in">
        <div class="auth-visual">
          <div class="auth-visual__copy">
            <p class="auth-visual__eyebrow">Studio Intelligence</p>
            <h2 class="auth-visual__title">Shape the collector experience around each body of work.</h2>
            <p class="auth-visual__text">Present originals, limited editions, and commissions through a cinematic portfolio that feels closer to a private viewing room than a catalog grid.</p>
          </div>
          <div class="auth-visual__gallery">
            <div class="auth-visual__frame auth-visual__frame--tall">
              <div class="auth-visual__art auth-visual__art--portrait"></div>
            </div>
            <div class="auth-visual__stack">
              <div class="auth-visual__frame auth-visual__frame--wide">
                <div class="auth-visual__art auth-visual__art--studio"></div>
              </div>
              <div class="auth-visual__frame auth-visual__frame--note">
                <div class="auth-visual__detail">
                  <span class="auth-visual__detail-label">Private collector note</span>
                  <strong>Reserved previews and commission requests stay inside the artist workspace.</strong>
                </div>
              </div>
            </div>
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
      router.navigate('/admin');
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
  });
}
