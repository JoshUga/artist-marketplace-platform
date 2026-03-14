/**
 * Artist detail/profile page.
 */
import api from '../services/api.js';
import { createProductCard, createSkeletonCard } from '../components/card.js';

export async function renderArtistDetailPage(params) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
      <div class="skeleton" style="height: 300px; border-radius: var(--border-radius-md);"></div>
    </div>
  `;

  try {
    const data = await api.get(`/artists/${params.id}`);
    const artist = data.data;

    let portfolioHTML = '<div class="grid grid-cols-3" id="portfolio-grid"></div>';

    app.innerHTML = `
      <div class="artist-profile animate-fade-in">
        <div class="artist-profile-header">
          <div class="container">
            <div class="artist-profile-info">
              <div class="avatar avatar-xl">
                <img src="${artist.profile_image_url || 'https://placehold.co/150x150/e2e8f0/475569?text=' + artist.artist_name.charAt(0)}" alt="${artist.artist_name}">
              </div>
              <div>
                <h1>${artist.artist_name} ${artist.is_verified ? '<i class="bi bi-patch-check-fill" style="color: var(--primary-color);"></i>' : ''}</h1>
                <p>${artist.bio || 'Artist on ArtMarket'}</p>
                <div class="artist-social">
                  ${artist.instagram ? `<a href="https://instagram.com/${artist.instagram}" target="_blank" rel="noopener noreferrer"><i class="bi bi-instagram"></i></a>` : ''}
                  ${artist.twitter ? `<a href="https://twitter.com/${artist.twitter}" target="_blank" rel="noopener noreferrer"><i class="bi bi-twitter"></i></a>` : ''}
                  ${artist.website ? `<a href="${artist.website}" target="_blank" rel="noopener noreferrer"><i class="bi bi-globe"></i></a>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
          <h2 class="section-title"><i class="bi bi-images"></i> Portfolio</h2>
          ${portfolioHTML}
        </div>
      </div>
    `;

    // Load portfolio
    try {
      const portfolioData = await api.get(`/artists/${params.id}/portfolio`);
      const grid = document.getElementById('portfolio-grid');
      if (portfolioData.data && portfolioData.data.length > 0) {
        grid.innerHTML = '';
        portfolioData.data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card animate-fade-in';
          card.innerHTML = `
            <div class="card-image"><img src="${item.image_url}" alt="${item.title}" loading="lazy"></div>
            <div class="card-body">
              <h3 class="card-title">${item.title}</h3>
              <p class="card-text">${item.description || ''}</p>
            </div>
          `;
          grid.appendChild(card);
        });
      } else {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="bi bi-images"></i><h3>No portfolio items yet</h3></div>';
      }
    } catch (e) {
      // Portfolio failed to load
    }
  } catch (error) {
    app.innerHTML = `
      <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
        <div class="empty-state">
          <i class="bi bi-person-x"></i>
          <h3>Artist not found</h3>
          <a href="/artists" class="btn btn-primary" data-link>Browse Artists</a>
        </div>
      </div>
    `;
  }
}
