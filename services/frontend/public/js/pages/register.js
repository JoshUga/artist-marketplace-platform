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
  const totalSteps = 3;

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
            <p class="auth-card__subtext">Complete a short three-step setup, then enter the dashboard already signed in and ready to publish.</p>

            <div class="auth-stepper" aria-label="Registration progress">
              <div class="auth-step auth-step--active" data-step-indicator="1">
                <span class="auth-step__index">1</span>
                <div class="auth-step__copy">
                  <strong>Identity</strong>
                  <span>Name your account and studio</span>
                </div>
              </div>
              <div class="auth-step" data-step-indicator="2">
                <span class="auth-step__index">2</span>
                <div class="auth-step__copy">
                  <strong>Access</strong>
                  <span>Secure your login</span>
                </div>
              </div>
              <div class="auth-step" data-step-indicator="3">
                <span class="auth-step__index">3</span>
                <div class="auth-step__copy">
                  <strong>Profile</strong>
                  <span>Add studio details and review</span>
                </div>
              </div>
            </div>

            <form id="register-form" class="auth-card__form">
              <div class="auth-step-panel auth-step-panel--active" data-step-panel="1">
                <p class="auth-step-panel__eyebrow">Step 1 of 3</p>
                <h2 class="auth-step-panel__title">Set up your identity</h2>
                <p class="auth-step-panel__text">Choose the name buyers will recognize and the name attached to your account.</p>

                <div class="form-group">
                  <label for="full-name" class="form-label">Full Name</label>
                  <input type="text" id="full-name" class="form-input" placeholder="Your full name" required>
                </div>
                <div class="form-group">
                  <label for="artist-name" class="form-label">Artist Name</label>
                  <input type="text" id="artist-name" class="form-input" placeholder="How collectors see your studio" required>
                </div>

                <div class="auth-step-panel__actions auth-step-panel__actions--end">
                  <button type="button" class="btn btn--primary" data-next-step>
                    Continue
                    <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>

              <div class="auth-step-panel" data-step-panel="2" hidden>
                <p class="auth-step-panel__eyebrow">Step 2 of 3</p>
                <h2 class="auth-step-panel__title">Create your login</h2>
                <p class="auth-step-panel__text">Use the email you want attached to inquiries, releases, and dashboard access.</p>

                <div class="form-group">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" id="email" class="form-input" placeholder="your@email.com" required>
                </div>
                <div class="form-group">
                  <label for="password" class="form-label">Password</label>
                  <input type="password" id="password" class="form-input" placeholder="Min. 8 characters" required minlength="8">
                </div>
                <div class="form-group">
                  <label for="confirm-password" class="form-label">Confirm Password</label>
                  <input type="password" id="confirm-password" class="form-input" placeholder="Re-enter your password" required minlength="8">
                </div>

                <div class="auth-note">
                  <i class="bi bi-shield-check"></i>
                  <span>Your account signs in automatically after setup.</span>
                </div>

                <div class="auth-step-panel__actions">
                  <button type="button" class="btn btn--ghost" data-prev-step>
                    <i class="bi bi-arrow-left"></i>
                    Back
                  </button>
                  <button type="button" class="btn btn--primary" data-next-step>
                    Continue
                    <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>

              <div class="auth-step-panel" data-step-panel="3" hidden>
                <p class="auth-step-panel__eyebrow">Step 3 of 3</p>
                <h2 class="auth-step-panel__title">Finish your profile</h2>
                <p class="auth-step-panel__text">Optional studio details help shape your public profile from the first session.</p>

                <div class="form-group">
                  <label for="artist-bio" class="form-label">Short Bio</label>
                  <textarea id="artist-bio" class="form-textarea" placeholder="Tell buyers about your style, process, and focus."></textarea>
                </div>
                <div class="form-group">
                  <label for="artist-website" class="form-label">Website</label>
                  <input type="url" id="artist-website" class="form-input" placeholder="https://yourstudio.com">
                </div>
                <div class="auth-step-panel__grid">
                  <div class="form-group">
                    <label for="artist-instagram" class="form-label">Instagram</label>
                    <input type="text" id="artist-instagram" class="form-input" placeholder="username">
                  </div>
                  <div class="form-group">
                    <label for="artist-twitter" class="form-label">X / Twitter</label>
                    <input type="text" id="artist-twitter" class="form-input" placeholder="username">
                  </div>
                </div>

                <section class="auth-review" aria-live="polite">
                  <div class="auth-review__header">
                    <h3>Review</h3>
                    <span>Submitted in one step after profile creation</span>
                  </div>
                  <dl class="auth-review__list">
                    <div>
                      <dt>Account Name</dt>
                      <dd id="register-review-full-name">-</dd>
                    </div>
                    <div>
                      <dt>Artist Name</dt>
                      <dd id="register-review-artist-name">-</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd id="register-review-email">-</dd>
                    </div>
                  </dl>
                </section>

                <div class="auth-step-panel__actions">
                  <button type="button" class="btn btn--ghost" data-prev-step>
                    <i class="bi bi-arrow-left"></i>
                    Back
                  </button>
                  <button type="submit" class="btn btn--primary" id="register-btn">
                    <i class="bi bi-person-plus"></i> Create Account & Profile
                  </button>
                </div>
              </div>
            </form>
            <div class="auth-card__footer">
              <p>Already have an account? <a href="/login" data-link>Login here</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = document.getElementById('register-form');
  const panels = Array.from(document.querySelectorAll('[data-step-panel]'));
  const indicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const nextButtons = Array.from(document.querySelectorAll('[data-next-step]'));
  const prevButtons = Array.from(document.querySelectorAll('[data-prev-step]'));
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  let currentStep = 1;

  function updateReview() {
    document.getElementById('register-review-full-name').textContent = document.getElementById('full-name').value.trim() || '-';
    document.getElementById('register-review-artist-name').textContent = document.getElementById('artist-name').value.trim() || '-';
    document.getElementById('register-review-email').textContent = document.getElementById('email').value.trim() || '-';
  }

  function setStep(step) {
    currentStep = step;
    panels.forEach((panel, index) => {
      const isActive = index + 1 === step;
      panel.hidden = !isActive;
      panel.classList.toggle('auth-step-panel--active', isActive);
    });

    indicators.forEach((indicator, index) => {
      const indicatorStep = index + 1;
      indicator.classList.toggle('auth-step--active', indicatorStep === step);
      indicator.classList.toggle('auth-step--complete', indicatorStep < step);
    });

    if (step === totalSteps) {
      updateReview();
    }
  }

  function validateStep(step) {
    const stepFields = {
      1: ['full-name', 'artist-name'],
      2: ['email', 'password', 'confirm-password'],
      3: [],
    };

    if (step === 2) {
      const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
      confirmPasswordInput.setCustomValidity(passwordsMatch ? '' : 'Passwords do not match');
    }

    return stepFields[step].every((fieldId) => document.getElementById(fieldId).reportValidity());
  }

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!validateStep(currentStep)) {
        return;
      }

      setStep(Math.min(totalSteps, currentStep + 1));
    });
  });

  prevButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setStep(Math.max(1, currentStep - 1));
    });
  });

  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.validity.customError) {
      const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
      confirmPasswordInput.setCustomValidity(passwordsMatch ? '' : 'Passwords do not match');
    }
  });

  passwordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value) {
      const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
      confirmPasswordInput.setCustomValidity(passwordsMatch ? '' : 'Passwords do not match');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        setStep(currentStep + 1);
      }
      return;
    }

    if (!validateStep(2)) {
      setStep(2);
      return;
    }

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

  setStep(1);
}
