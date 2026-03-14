/**
 * Home page - featured products and hero section.
 */
import api from '../services/api.js';
import { createProductCard, createSkeletonCard } from '../components/card.js';

export async function renderHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="hero">
      <div class="container">
        <h1 class="animate-fade-in">Discover Unique Art</h1>
        <p class="animate-fade-in" style="animation-delay: 0.1s">
          Connect with talented artists and find one-of-a-kind pieces for your collection.
        </p>
        <div class="animate-fade-in" style="animation-delay: 0.2s">
          <a href="/artists" class="btn btn-primary btn-lg" data-link>
            <i class="bi bi-brush"></i> Explore Artists
          </a>
          <a href="/register" class="btn btn-outline btn-lg" data-link style="margin-left: var(--spacing-sm);">
            <i class="bi bi-person-plus"></i> Join Now
          </a>
        </div>
      </div>
    </section>

    <section class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
      <h2 class="section-title animate-fade-in">
        <i class="bi bi-stars"></i> Featured Artwork
      </h2>
      <div class="grid grid-cols-4" id="products-grid"></div>
    </section>
  `;

  const grid = document.getElementById('products-grid');

  // Show skeletons
  for (let i = 0; i < 8; i++) {
    grid.appendChild(createSkeletonCard());
  }

  try {
    const data = await api.get('/products/?per_page=8&sort_by=created_at&sort_order=desc');
    grid.innerHTML = '';

    if (data.data && data.data.length > 0) {
      data.data.forEach((product, index) => {
        const card = createProductCard(product);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
      });
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="bi bi-palette"></i>
          <h3>No artwork yet</h3>
          <p>Be the first artist to list your work!</p>
          <a href="/register" class="btn btn-primary" data-link>Get Started</a>
        </div>
      `;
    }
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="bi bi-palette"></i>
        <h3>Welcome to ArtMarket</h3>
        <p>Connect the backend services to see artwork listings.</p>
      </div>
    `;
  }
}
