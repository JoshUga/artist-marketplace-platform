/**
 * Reusable card components.
 */
export function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'card product-card animate-fade-in';
  card.innerHTML = `
    <div class="card-image">
      <img src="${product.image_url || 'https://placehold.co/400x300/e2e8f0/475569?text=Artwork'}" 
           alt="${product.title}" loading="lazy">
      ${product.is_featured ? '<span class="badge badge-accent">Featured</span>' : ''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${product.title}</h3>
      <p class="card-text">${(product.description || '').substring(0, 100)}${(product.description || '').length > 100 ? '...' : ''}</p>
      <div class="card-footer">
        <span class="price">$${Number(product.price).toFixed(2)}</span>
        <a href="/products/${product.id}" class="btn btn-primary btn-sm" data-link>
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
    <div class="card-body" style="text-align: center; padding: var(--spacing-lg);">
      <div class="avatar avatar-lg" style="margin: 0 auto var(--spacing-md);">
        <img src="${artist.profile_image_url || 'https://placehold.co/100x100/e2e8f0/475569?text=' + artist.artist_name.charAt(0)}" alt="${artist.artist_name}">
      </div>
      <h3 class="card-title">${artist.artist_name}</h3>
      ${artist.is_verified ? '<span class="badge badge-success"><i class="bi bi-patch-check"></i> Verified</span>' : ''}
      <p class="card-text">${(artist.bio || 'Artist on ArtMarket').substring(0, 80)}</p>
      <a href="/artists/${artist.id}" class="btn btn-outline btn-sm" data-link>View Profile</a>
    </div>
  `;
  return card;
}

export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="skeleton" style="height: 200px; border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;"></div>
    <div class="card-body">
      <div class="skeleton skeleton-text" style="width: 70%;"></div>
      <div class="skeleton skeleton-text" style="width: 90%;"></div>
      <div class="skeleton skeleton-text" style="width: 50%;"></div>
    </div>
  `;
  return card;
}
