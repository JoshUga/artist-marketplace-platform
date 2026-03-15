/**
 * Login page.
 */
import { login } from '../services/auth.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderLoginPage() {
  const layoutOptions = ['auth-layout--one', 'auth-layout--two', 'auth-layout--three'];
  const layoutClass = layoutOptions[Math.floor(Math.random() * layoutOptions.length)];

  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-immersive auth-immersive--login ${layoutClass}">
      <img class="auth-immersive__hero-image" src="/images/landing/hero.jpg" alt="Art gallery inspired background" loading="eager">
      <div class="auth-immersive__backdrop" aria-hidden="true"></div>

      <div class="auth-immersive__copy animate-fade-in">
        <p class="auth-immersive__eyebrow">Studio Intelligence</p>
        <h2 class="auth-immersive__title">Shape the collector experience around each body of work.</h2>
        <p class="auth-immersive__text">Present originals, limited editions, and commissions through a cinematic portfolio that feels closer to a private viewing room than a catalog grid.</p>
      </div>

      <aside class="auth-immersive__rail" aria-label="Featured artworks">
        <div class="auth-immersive__rail-col auth-immersive__rail-col--up">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-1.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-2.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-3.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-1.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-2.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-3.jpg" alt="Fine art feature" loading="lazy"></figure>
          </div>
        </div>
        <div class="auth-immersive__rail-col auth-immersive__rail-col--down">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-4.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-5.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-6.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-4.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-5.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-6.jpg" alt="Fine art feature" loading="lazy"></figure>
          </div>
        </div>
        <div class="auth-immersive__rail-col auth-immersive__rail-col--up auth-immersive__rail-col--slow">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-7.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-8.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-9.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-7.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-8.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-9.jpg" alt="Fine art feature" loading="lazy"></figure>
          </div>
        </div>
      </aside>

      <div class="auth-immersive__panel animate-scale-in">
        <a href="/" class="auth-stage__mark" data-link>
          <i class="bi bi-palette"></i>
          <span>ArtMarket</span>
        </a>
        <div class="auth-card card">
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
