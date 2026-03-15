/**
 * Standalone artist portfolio website page.
 */
import api from '../services/api.js';

export async function renderArtistDetailPage(params) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="portfolio-site">
      <div class="portfolio-site__loading">
        <span class="spinner"></span>
      </div>
    </section>
  `;

  try {
    const [artistResponse, portfolioResponse] = await Promise.all([
      api.get(`/artists/${params.id}`),
      api.get(`/artists/${params.id}/portfolio?per_page=100`),
    ]);

    const artist = artistResponse.data;
    const portfolioItems = portfolioResponse.data || [];
    const heroImage = portfolioItems[0]?.image_url || artist.profile_image_url || 'https://placehold.co/1600x900/1f1a22/e6ddcf?text=Artist+Portfolio';
    const initials = (artist.artist_name || 'A').charAt(0).toUpperCase();

    const socialLinks = [
      artist.instagram ? `<a href="https://instagram.com/${artist.instagram}" target="_blank" rel="noopener noreferrer"><i class="bi bi-instagram"></i><span>@${artist.instagram}</span></a>` : '',
      artist.twitter ? `<a href="https://twitter.com/${artist.twitter}" target="_blank" rel="noopener noreferrer"><i class="bi bi-twitter"></i><span>@${artist.twitter}</span></a>` : '',
      artist.website ? `<a href="${artist.website}" target="_blank" rel="noopener noreferrer"><i class="bi bi-globe2"></i><span>Website</span></a>` : '',
    ].filter(Boolean).join('');

    const portfolioGrid = portfolioItems.length
      ? portfolioItems.map((item, index) => `
          <article class="portfolio-site__item" style="animation-delay: ${Math.min(index * 0.08, 0.36)}s">
            <div class="portfolio-site__item-media">
              <img src="${item.image_url}" alt="${item.title}" loading="lazy">
            </div>
            <div class="portfolio-site__item-body">
              <h3>${item.title}</h3>
              <p>${item.description || 'No additional notes for this piece yet.'}</p>
            </div>
          </article>
        `).join('')
      : `
        <article class="portfolio-site__empty">
          <i class="bi bi-images"></i>
          <h3>Portfolio in progress</h3>
          <p>This artist has not published any portfolio content yet.</p>
        </article>
      `;

    app.innerHTML = `
      <section class="portfolio-site animate-fade-in">
        <header class="portfolio-site__hero">
          <img class="portfolio-site__hero-image" src="${heroImage}" alt="${artist.artist_name} featured artwork">
          <div class="portfolio-site__hero-overlay"></div>
          <div class="portfolio-site__hero-content container">
            <div class="portfolio-site__identity animate-scale-in">
              <div class="portfolio-site__avatar">
                <img src="${artist.profile_image_url || 'https://placehold.co/160x160/181722/e6ddcf?text=' + initials}" alt="${artist.artist_name}">
              </div>
              <div class="portfolio-site__headline">
                <h1>${artist.artist_name} ${artist.is_verified ? '<i class="bi bi-patch-check-fill"></i>' : ''}</h1>
                <p>${artist.bio || 'Artist on ArtMarket'}</p>
                <div class="portfolio-site__social">
                  ${socialLinks || '<span class="portfolio-site__social-empty">No social links shared yet.</span>'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section class="portfolio-site__about container">
          <article class="portfolio-site__about-card">
            <h2>About the Artist</h2>
            <p>${artist.bio || `${artist.artist_name} is developing a new collection. Check back soon for new work and updates.`}</p>
          </article>
          <article class="portfolio-site__about-card">
            <h2>Studio Snapshot</h2>
            <ul>
              <li><strong>Artist:</strong> ${artist.artist_name}</li>
              <li><strong>Status:</strong> ${artist.is_verified ? 'Verified artist' : 'Emerging artist'}</li>
              <li><strong>Pieces Published:</strong> ${portfolioItems.length}</li>
            </ul>
          </article>
        </section>

        <section class="portfolio-site__gallery container">
          <div class="portfolio-site__section-head">
            <p class="portfolio-site__eyebrow">Collection</p>
            <h2>Featured Content</h2>
          </div>
          <div class="portfolio-site__grid">
            ${portfolioGrid}
          </div>
        </section>
      </section>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
        <div class="empty-state">
          <i class="bi bi-person-x"></i>
          <h3>Portfolio site unavailable</h3>
          <p>We could not load this artist portfolio right now.</p>
        </div>
      </div>
    `;
  }
}
