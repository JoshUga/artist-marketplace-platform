/**
 * Home page - immersive art landing.
 */
import { isAuthenticated } from '../services/auth.js';

export async function renderHomePage() {
  const isAuth = isAuthenticated();
  const actions = isAuth
    ? `
      <a href="/admin" class="btn btn--primary btn--lg" data-link>Go to Dashboard</a>
      <a href="/register" class="btn btn--ghost btn--lg landing-card__action-ghost" data-link>Add another artist profile</a>
    `
    : `
      <a href="/login" class="btn btn--primary btn--lg" data-link>Login</a>
      <a href="/register" class="btn btn--outline btn--lg landing-card__action-alt" data-link>Register</a>
    `;

  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="landing">
      <div class="landing__glow landing__glow--left" aria-hidden="true"></div>
      <div class="landing__glow landing__glow--right" aria-hidden="true"></div>

      <article class="landing-piece landing-piece--one" aria-hidden="true">
        <div class="landing-piece__art landing-piece__art--portrait"></div>
        <span class="landing-piece__label">Portrait Series</span>
      </article>

      <article class="landing-piece landing-piece--two" aria-hidden="true">
        <div class="landing-piece__art landing-piece__art--gallery"></div>
        <span class="landing-piece__label">Studio Drops</span>
      </article>

      <article class="landing-piece landing-piece--three" aria-hidden="true">
        <div class="landing-piece__art landing-piece__art--abstract"></div>
        <span class="landing-piece__label">Collectors' Editions</span>
      </article>

      <article class="landing-piece landing-piece--four" aria-hidden="true">
        <div class="landing-piece__art landing-piece__art--sculpt"></div>
        <span class="landing-piece__label">Sculpture Rooms</span>
      </article>

      <div class="landing__content">
        <div class="landing-card animate-scale-in">
          <p class="landing-card__eyebrow">Artist-Led Marketplace</p>
          <h1 class="landing-card__title">Find original art with the studio story still attached.</h1>
          <p class="landing-card__text">Explore immersive artist portfolios, limited releases, and private collector relationships shaped by each artist, not by a generic storefront.</p>

          <div class="landing-card__actions">
            ${actions}
          </div>

          <div class="landing-card__metrics">
            <div class="landing-card__metric">
              <span class="landing-card__metric-value">Original Works</span>
              <span class="landing-card__metric-label">Portfolio-led inventory curated by the artist.</span>
            </div>
            <div class="landing-card__metric">
              <span class="landing-card__metric-value">Private Buyers</span>
              <span class="landing-card__metric-label">Each buyer relationship stays inside the artist portfolio.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="landing__legal">
        <a href="/privacy-policy" class="landing__legal-link" data-link>Privacy Policy</a>
        <a href="/terms-of-use" class="landing__legal-link" data-link>Terms of Use</a>
        <a href="/data-removal" class="landing__legal-link" data-link>Data Removal</a>
      </div>
    </section>
  `;
}
