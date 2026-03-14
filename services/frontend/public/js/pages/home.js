/**
 * Home page - single-screen hero landing.
 */

export async function renderHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="hero hero--full">
      <div class="hero__bg" aria-hidden="true"></div>
      <div class="container hero__content">
        <h1 class="hero__title animate-slide-up">Discover Unique Art</h1>
        <p class="hero__subtitle animate-slide-up" style="animation-delay: 0.08s">
          Connect with talented artists, discover one-of-a-kind pieces, and support independent creators.
        </p>
        <div class="hero__actions animate-slide-up" style="animation-delay: 0.16s">
          <a href="/artists" class="btn btn--white btn--lg" data-link>
            <i class="bi bi-brush"></i> Explore Artists
          </a>
          <a href="/register" class="btn btn--outline btn--lg hero__cta-secondary" data-link>
            <i class="bi bi-person-plus"></i> Join Now
          </a>
        </div>
        <p class="hero__meta animate-fade-in" style="animation-delay: 0.24s">
          <i class="bi bi-shield-check"></i> Verified artists
          <span>•</span>
          <i class="bi bi-lightning-charge"></i> Fast checkout
          <span>•</span>
          <i class="bi bi-globe2"></i> Global community
        </p>
      </div>
    </section>
  `;
}
