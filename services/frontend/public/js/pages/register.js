/**
 * Registration page.
 */
import { register } from '../services/auth.js';
import { login } from '../services/auth.js';
import api from '../services/api.js';
import { showToast } from '../components/toast.js';
import router from '../utils/router.js';

export function renderRegisterPage() {
  const layoutOptions = ['auth-layout--one', 'auth-layout--two', 'auth-layout--three'];
  const layoutClass = layoutOptions[Math.floor(Math.random() * layoutOptions.length)];

  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="auth-immersive auth-immersive--register ${layoutClass}">
      <img class="auth-immersive__hero-image" src="/images/landing/hero.jpg" alt="Art gallery inspired background" loading="eager">
      <div class="auth-immersive__backdrop" aria-hidden="true"></div>

      <div class="auth-immersive__copy animate-fade-in">
        <p class="auth-immersive__eyebrow">Curated Presentation</p>
        <h2 class="auth-immersive__title">Turn your portfolio into a room collectors want to stay inside.</h2>
        <p class="auth-immersive__text">Publish series, availability, and collector access within a cinematic space built for artists, studios, and limited releases.</p>
      </div>

      <aside class="auth-immersive__rail" aria-label="Featured artworks">
        <div class="auth-immersive__rail-col auth-immersive__rail-col--up">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-2.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-3.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-1.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-2.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-3.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-1.jpg" alt="Fine art feature" loading="lazy"></figure>
          </div>
        </div>
        <div class="auth-immersive__rail-col auth-immersive__rail-col--down">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-5.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-6.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-4.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-5.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-6.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-4.jpg" alt="Fine art feature" loading="lazy"></figure>
          </div>
        </div>
        <div class="auth-immersive__rail-col auth-immersive__rail-col--up auth-immersive__rail-col--slow">
          <div class="auth-immersive__rail-track">
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-8.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-9.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-7.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-8.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-9.jpg" alt="Fine art feature" loading="lazy"></figure>
            <figure class="auth-immersive__rail-item"><img src="/images/landing/rail-7.jpg" alt="Fine art feature" loading="lazy"></figure>
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
            <p class="auth-card__eyebrow">Artist Onboarding</p>
            <h1 class="auth-card__heading">Create your artist account</h1>
            <p class="auth-card__subtext">Launch a portfolio-led storefront where your work, collector relationships, and commissions stay under your control.</p>
            <form id="register-form">
              <div class="form-group">
                <label for="full-name" class="form-label">Full Name</label>
                <input type="text" id="full-name" class="form-input" placeholder="Your full name" required>
              </div>
              <div class="form-group">
                <label for="artist-name" class="form-label">Artist Name</label>
                <input type="text" id="artist-name" class="form-input" placeholder="How collectors see your studio" required>
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
                <label for="artist-bio" class="form-label">Short Bio</label>
                <textarea id="artist-bio" class="form-textarea" placeholder="Tell buyers about your style, process, and focus."></textarea>
              </div>
              <div class="form-group">
                <label for="artist-website" class="form-label">Website</label>
                <input type="url" id="artist-website" class="form-input" placeholder="https://yourstudio.com">
              </div>
              <div class="form-group">
                <label for="artist-instagram" class="form-label">Instagram</label>
                <input type="text" id="artist-instagram" class="form-input" placeholder="username">
              </div>
              <div class="form-group">
                <label for="artist-twitter" class="form-label">X / Twitter</label>
                <input type="text" id="artist-twitter" class="form-input" placeholder="username">
              </div>
              <button type="submit" class="btn btn--primary btn--block" id="register-btn">
                <i class="bi bi-person-plus"></i> Create Account & Profile
              </button>
            </form>
            <div class="auth-card__footer">
              <p>Already have an account? <a href="/login" data-link>Login here</a></p>
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
      const artistName = document.getElementById('artist-name').value.trim();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const bio = document.getElementById('artist-bio').value.trim();
      const website = document.getElementById('artist-website').value.trim();
      const instagram = document.getElementById('artist-instagram').value.trim();
      const twitter = document.getElementById('artist-twitter').value.trim();

      if (!artistName) {
        throw new Error('Artist name is required');
      }

      await register(email, password, fullName);
      await login(email, password);

      await api.post('/artists/register', {
        artist_name: artistName,
        bio: bio || null,
        website: website || null,
        instagram: instagram || null,
        twitter: twitter || null,
      });

      showToast('Account and artist profile created. Welcome to your dashboard.', 'success');
      router.navigate('/admin');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account & Profile';
    }
  });
}
