/**
 * Artists listing page.
 */
import api from '../services/api.js';
import { createArtistCard, createSkeletonCard } from '../components/card.js';

export async function renderArtistsPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
      <h1 class="animate-fade-in" style="margin-bottom: var(--spacing-lg);">
        <i class="bi bi-brush"></i> Discover Artists
      </h1>
      <div class="grid grid--3" id="artists-grid"></div>
    </section>
  `;

  const grid = document.getElementById('artists-grid');
  for (let i = 0; i < 6; i++) grid.appendChild(createSkeletonCard());

  try {
    const data = await api.get('/artists/?per_page=12');
    grid.innerHTML = '';
    if (data.data && data.data.length > 0) {
      data.data.forEach((artist, i) => {
        const card = createArtistCard(artist);
        card.style.animationDelay = `${i * 0.1}s`;
        grid.appendChild(card);
      });
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="bi bi-people"></i>
          <h3>No artists yet</h3>
          <p>Be the first to register as an artist!</p>
        </div>
      `;
    }
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="bi bi-people"></i>
        <h3>Unable to load artists right now</h3>
        <p>Please try again in a moment. If this continues, refresh the page.</p>
      </div>
    `;
  }
}
