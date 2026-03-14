/**
 * Registration page.
 */
import { register } from '../services/auth.js';
import { login } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-stage auth-stage--register">
      <div class="auth-stage__panel auth-stage__panel--form">
        <a href="/" class="auth-stage__mark" data-link>
          <i class="bi bi-palette"></i>
          <span>ArtMarket</span>
        </a>
        <div class="auth-card card animate-scale-in">
          <div class="card__body auth-card__body">
            <p class="auth-card__eyebrow">Artist Onboarding</p>
            <h1 class="auth-card__heading">Create your artist account</h1>
            <p class="auth-card__subtext">Launch a portfolio-led storefront where your work, collector relationships, and commissions stay under your control.</p>
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
      </div>
      <div class="auth-stage__panel auth-stage__panel--visual animate-fade-in">
        <div class="auth-visual">
          <div class="auth-visual__copy">
            <p class="auth-visual__eyebrow">Curated Presentation</p>
            <h2 class="auth-visual__title">Turn your portfolio into a room collectors want to stay inside.</h2>
            <p class="auth-visual__text">Publish series, availability, and collector access within a more cinematic space built for artists, studios, and limited releases.</p>
          </div>
          <div class="auth-visual__gallery">
            <div class="auth-visual__frame auth-visual__frame--tall">
              <div class="auth-visual__art auth-visual__art--canvas"></div>
            </div>
            <div class="auth-visual__stack">
              <div class="auth-visual__frame auth-visual__frame--wide">
                <div class="auth-visual__art auth-visual__art--curation"></div>
              </div>
              <div class="auth-visual__frame auth-visual__frame--note">
                <div class="auth-visual__detail">
                  <span class="auth-visual__detail-label">Artist-first workflow</span>
                  <strong>Buyers belong to each artist portfolio, not to a shared marketplace account pool.</strong>
                </div>
              </div>
            </div>
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
      await login(email, password);
      showToast('Account created. Welcome to your dashboard.', 'success');
      router.navigate('/admin');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account';
    }
  });
}
