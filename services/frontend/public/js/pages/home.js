/**
 * Home page - immersive art landing.
 */
import { isAuthenticated } from '../services/auth.js';

export async function renderHomePage() {
  const isAuth = isAuthenticated();
  const actions = isAuth
    ? `
      <a href="/admin" class="btn btn--primary btn--lg" data-link>Go to Dashboard</a>
      <a href="/register" class="btn btn--outline btn--lg" data-link>Add another artist profile</a>
    `
    : `
      <a href="/login" class="btn btn--primary btn--lg" data-link>Login</a>
      <a href="/register" class="btn btn--outline btn--lg" data-link>Register</a>
    `;

  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="landing">
      <div class="landing__backdrop" aria-hidden="true"></div>

      <div class="landing__overlay animate-fade-in">
        <p class="landing__eyebrow">Artist-Led Marketplace</p>
        <h1 class="landing__title">Find original art with the studio story still attached.</h1>
        <p class="landing__text">Explore immersive artist portfolios, limited releases, and private collector relationships shaped by each artist, not by a generic storefront.</p>

        <div class="landing__actions">
          ${actions}
        </div>

        <ul class="landing__meta" aria-label="Marketplace highlights">
          <li><strong>Original Works</strong> Portfolio-led inventory curated by each artist.</li>
          <li><strong>Private Buyers</strong> Collector relationships stay inside the artist workspace.</li>
        </ul>
      </div>

      <aside class="landing__rail" aria-label="Featured artworks">
        <div class="landing__rail-col landing__rail-col--up">
          <div class="landing__rail-track">
            <figure class="landing__rail-item"><img src="/images/landing/rail-1.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-2.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-3.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-1.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-2.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-3.jpg" alt="Curated fine art piece" loading="lazy"></figure>
          </div>
        </div>

        <div class="landing__rail-col landing__rail-col--down">
          <div class="landing__rail-track">
            <figure class="landing__rail-item"><img src="/images/landing/rail-4.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-5.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-6.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-4.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-5.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-6.jpg" alt="Curated fine art piece" loading="lazy"></figure>
          </div>
        </div>

        <div class="landing__rail-col landing__rail-col--up landing__rail-col--slow">
          <div class="landing__rail-track">
            <figure class="landing__rail-item"><img src="/images/landing/rail-7.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-8.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-9.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-7.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-8.jpg" alt="Curated fine art piece" loading="lazy"></figure>
            <figure class="landing__rail-item"><img src="/images/landing/rail-9.jpg" alt="Curated fine art piece" loading="lazy"></figure>
          </div>
        </div>
      </aside>

      <div class="landing__legal">
        <a href="/privacy-policy" class="landing__legal-link" data-link>Privacy Policy</a>
        <a href="/terms-of-use" class="landing__legal-link" data-link>Terms of Use</a>
        <a href="/data-removal" class="landing__legal-link" data-link>Data Removal</a>
      </div>

      <img
        class="landing__hero-image"
        src="/images/landing/hero.jpg"
        alt="Collector browsing artworks in a gallery-inspired environment"
        loading="eager"
      >
    </section>
  `;
}
