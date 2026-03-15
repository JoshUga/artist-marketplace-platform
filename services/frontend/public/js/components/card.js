/**
 * Reusable card components.
 */
export function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'card product-card animate-fade-in';
  card.innerHTML = `
    <a href="/products/${product.id}" class="card__image" data-link aria-label="View ${product.title}">
      <img src="${product.image_url || 'https://placehold.co/400x300/e2e8f0/475569?text=Artwork'}" 
           alt="${product.title}" loading="lazy">
      ${product.is_featured ? '<span class="badge badge--warning card__badge">Featured</span>' : ''}
    </a>
    <div class="card__body">
      <h3 class="card__title">${product.title}</h3>
      <p class="card__text">${(product.description || '').substring(0, 100)}${(product.description || '').length > 100 ? '...' : ''}</p>
      <div class="card__meta">
        <span class="card__price">$${Number(product.price).toFixed(2)}</span>
        <a href="/products/${product.id}" class="btn btn--primary btn--sm" data-link>
          <i class="bi bi-eye"></i> View
        </a>
      </div>
    </div>
  `;
  return card;
}

export function createArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'card artist-card animate-fade-in';
  card.innerHTML = `
    <div class="card__body" style="text-align: center; padding: var(--spacing-lg);">
      <div class="avatar avatar--lg" style="margin: 0 auto var(--spacing-md);">
        <img src="${artist.profile_image_url || 'https://placehold.co/100x100/e2e8f0/475569?text=' + artist.artist_name.charAt(0)}" alt="${artist.artist_name}">
      </div>
      <h3 class="card__title">${artist.artist_name}</h3>
      ${artist.is_verified ? '<span class="badge badge--secondary"><i class="bi bi-patch-check"></i> Verified</span>' : ''}
      <p class="card__text">${(artist.bio || 'Artist on ArtMarket').substring(0, 80)}</p>
      <a href="/portfolio/${artist.id}/home" class="btn btn--outline btn--sm" data-link>View Portfolio Site</a>
    </div>
  `;
  return card;
}

export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="skeleton" style="height: 200px; border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;"></div>
    <div class="card__body">
      <div class="skeleton skeleton--text" style="width: 70%;"></div>
      <div class="skeleton skeleton--text" style="width: 90%;"></div>
      <div class="skeleton skeleton--text" style="width: 50%;"></div>
    </div>
  `;
  return card;
}
