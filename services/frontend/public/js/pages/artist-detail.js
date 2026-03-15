/**
 * Standalone artist portfolio website page.
 */
import api from '../services/api.js';
import { showToast } from '../components/toast.js';

const NAV_SECTIONS = ['home', 'about', 'gallery', 'contact'];
const VALID_SECTIONS = [...NAV_SECTIONS, 'bio'];
const BIO_PREVIEW_LENGTH = 220;

function normalizeSection(section) {
  if (!section) return 'home';
  const value = String(section).toLowerCase();
  return VALID_SECTIONS.includes(value) ? value : 'home';
}

function getArtistBio(artist) {
  const bio = (artist?.bio || '').trim();
  return bio || `${artist.artist_name} is currently shaping a body of work rooted in contemporary craft and expressive detail.`;
}

function buildBioPreview(text, maxLength = BIO_PREVIEW_LENGTH) {
  const clean = (text || '').trim();
  if (clean.length <= maxLength) {
    return { text: clean, isTruncated: false };
  }

  const cutoff = clean.lastIndexOf(' ', maxLength);
  const safeCutoff = cutoff > Math.floor(maxLength * 0.6) ? cutoff : maxLength;
  return { text: `${clean.slice(0, safeCutoff).trim()}...`, isTruncated: true };
}

function createBioPreviewMarkup(artist, maxLength = BIO_PREVIEW_LENGTH, className = '') {
  const fullBio = getArtistBio(artist);
  const preview = buildBioPreview(fullBio, maxLength);

  return `
    <p class="${className}">${preview.text}</p>
    ${preview.isTruncated ? `<a href="/portfolio/${artist.id}/bio" class="portfolio-site__view-more" data-link>View more</a>` : ''}
  `;
}

function getInitials(name) {
  return (name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'A';
}

function formatSince(dateValue) {
  try {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 'Recently joined' : `Since ${date.getFullYear()}`;
  } catch {
    return 'Recently joined';
  }
}

function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string') return value;
  let normalized = value.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8888\/unsafe\//i, '/img/unsafe/');

  const encodedSourceMatch = normalized.match(/^(\/img\/unsafe\/)(http%3A.*)$/i);
  if (encodedSourceMatch) {
    try {
      normalized = `${encodedSourceMatch[1]}${decodeURIComponent(encodedSourceMatch[2])}`;
    } catch {
      return normalized;
    }
  }

  normalized = normalized.replace('/img/unsafe/http://gateway/', '/img/unsafe/http://gateway.local/');

  return normalized;
}

function createTopNavigation(artistId, activeSection) {
  return NAV_SECTIONS.map((section) => {
    const isActive = section === activeSection;
    const label = section.charAt(0).toUpperCase() + section.slice(1);
    return `<a class="portfolio-site__nav-link ${isActive ? 'is-active' : ''}" href="/portfolio/${artistId}/${section}" data-link>${label}</a>`;
  }).join('');
}

function renderHomeSection(artist, portfolioItems) {
  const featured = portfolioItems.slice(0, 3);
  const highlightMarkup = featured.length
    ? featured.map((item) => `
        <article class="portfolio-site__highlight-item">
          <a href="/portfolio/${artist.id}/item/${item.id}" class="portfolio-site__item-link" data-link aria-label="Open ${item.title} details">
            <img src="${normalizeImageUrl(item.image_url)}" alt="${item.title}" loading="lazy">
          </a>
          <div>
            <h3><a href="/portfolio/${artist.id}/item/${item.id}" class="portfolio-site__item-link" data-link>${item.title}</a></h3>
            <p>${item.description || 'A featured piece from the artist collection.'}</p>
          </div>
        </article>
      `).join('')
    : `
      <article class="portfolio-site__empty">
        <i class="bi bi-images"></i>
        <h3>Fresh work is coming soon</h3>
        <p>This artist is preparing new highlights for their homepage.</p>
      </article>
    `;

  return `
    <section class="portfolio-site__section portfolio-site__section--home animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">Welcome</p>
        <h2>${artist.artist_name}'s Creative Website</h2>
      </div>
      <div class="portfolio-site__home-grid">
        <article class="portfolio-site__panel">
          <h3>Creative Direction</h3>
          ${createBioPreviewMarkup(artist, 200, 'portfolio-site__bio-preview')}
          <ul class="portfolio-site__facts">
            <li><strong>Status</strong><span>${artist.is_verified ? 'Verified artist' : 'Independent artist'}</span></li>
            <li><strong>Portfolio pieces</strong><span>${portfolioItems.length}</span></li>
            <li><strong>Journey</strong><span>${formatSince(artist.created_at)}</span></li>
          </ul>
        </article>
        <article class="portfolio-site__panel">
          <h3>Featured Works</h3>
          <div class="portfolio-site__highlights">
            ${highlightMarkup}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderAboutSection(artist, portfolioItems) {
  return `
    <section class="portfolio-site__section portfolio-site__section--about animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">About</p>
        <h2>The story behind ${artist.artist_name}</h2>
      </div>
      <div class="portfolio-site__about-grid">
        <article class="portfolio-site__panel">
          <h3>Artist Statement</h3>
          ${createBioPreviewMarkup(artist, 300, 'portfolio-site__bio-preview')}
          <p>Each piece is developed with an emphasis on texture, color rhythm, and emotional resonance.</p>
        </article>
        <article class="portfolio-site__panel">
          <h3>Quick Profile</h3>
          <ul class="portfolio-site__facts">
            <li><strong>Name</strong><span>${artist.artist_name}</span></li>
            <li><strong>Website</strong><span>${artist.website ? `<a href="${artist.website}" target="_blank" rel="noopener noreferrer">Visit official site</a>` : 'Not provided'}</span></li>
            <li><strong>Instagram</strong><span>${artist.instagram ? `@${artist.instagram}` : 'Not provided'}</span></li>
            <li><strong>Twitter</strong><span>${artist.twitter ? `@${artist.twitter}` : 'Not provided'}</span></li>
            <li><strong>Published works</strong><span>${portfolioItems.length}</span></li>
          </ul>
        </article>
      </div>
    </section>
  `;
}

function renderFullBioSection(artist) {
  const fullBio = getArtistBio(artist);

  return `
    <section class="portfolio-site__section portfolio-site__section--bio animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">Biography</p>
        <h2>About ${artist.artist_name}</h2>
      </div>
      <article class="portfolio-site__panel">
        <p class="portfolio-site__bio-full">${fullBio}</p>
        <div style="margin-top: var(--spacing-md);">
          <a href="/portfolio/${artist.id}/about" class="btn btn--outline" data-link>
            <i class="bi bi-arrow-left"></i>
            Back to About
          </a>
        </div>
      </article>
    </section>
  `;
}

function renderGallerySection(portfolioItems) {
  const galleryMarkup = portfolioItems.length
    ? portfolioItems.map((item, index) => `
        <article class="portfolio-site__item" style="animation-delay: ${Math.min(index * 0.07, 0.35)}s">
          <div class="portfolio-site__item-media">
            <a href="/portfolio/${item.artist_id}/item/${item.id}" class="portfolio-site__item-link" data-link aria-label="Open ${item.title} details">
              <img src="${normalizeImageUrl(item.image_url)}" alt="${item.title}" loading="lazy">
            </a>
          </div>
          <div class="portfolio-site__item-body">
            <h3><a href="/portfolio/${item.artist_id}/item/${item.id}" class="portfolio-site__item-link" data-link>${item.title}</a></h3>
            <p>${item.description || 'No additional notes for this piece yet.'}</p>
          </div>
        </article>
      `).join('')
    : `
      <article class="portfolio-site__empty">
        <i class="bi bi-images"></i>
        <h3>Gallery in progress</h3>
        <p>This artist has not published any gallery items yet.</p>
      </article>
    `;

  return `
    <section class="portfolio-site__section portfolio-site__section--gallery animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">Gallery</p>
        <h2>Portfolio Collection</h2>
      </div>
      <div class="portfolio-site__grid">
        ${galleryMarkup}
      </div>
    </section>
  `;
}

function renderContactSection(artist) {
  const mapQuery = encodeURIComponent(`${artist.artist_name} art studio`);
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&z=12&output=embed`;

  return `
    <section class="portfolio-site__section portfolio-site__section--contact animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">Contact</p>
        <h2>Connect with ${artist.artist_name}</h2>
      </div>
      <div class="portfolio-site__contact-grid">
        <article class="portfolio-site__panel">
          <h3>Studio Map</h3>
          <div class="portfolio-site__map-wrap">
            <iframe
              title="${artist.artist_name} studio map"
              src="${mapUrl}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen>
            </iframe>
          </div>
          <p class="portfolio-site__muted">Map is approximate and based on publicly available location data.</p>
        </article>
        <article class="portfolio-site__panel">
          <h3>Send a Message</h3>
          <form id="portfolio-contact-form" class="portfolio-site__contact-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="contact-name">Your Name</label>
              <input class="form-input" id="contact-name" name="name" maxlength="80" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">Email</label>
              <input class="form-input" id="contact-email" name="email" type="email" maxlength="120" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-message">Message</label>
              <textarea class="form-textarea" id="contact-message" name="message" maxlength="600" required></textarea>
            </div>
            <button class="btn btn--primary btn--block" type="submit">
              <i class="bi bi-send"></i>
              Send Message
            </button>
          </form>
        </article>
      </div>
    </section>
  `;
}

function renderItemDetailSection(artist, item) {
  if (!item) {
    return `
      <section class="portfolio-site__section animate-fade-in">
        <article class="portfolio-site__empty">
          <i class="bi bi-image"></i>
          <h3>Artwork not found</h3>
          <p>This artwork may have been removed from the portfolio.</p>
          <a href="/portfolio/${artist.id}/gallery" class="btn btn--outline" data-link>Back to Gallery</a>
        </article>
      </section>
    `;
  }

  return `
    <section class="portfolio-site__section animate-fade-in">
      <div class="portfolio-site__section-head">
        <p class="portfolio-site__eyebrow">Artwork Detail</p>
        <h2>${item.title}</h2>
      </div>
      <article class="portfolio-site__panel" style="display: grid; gap: var(--spacing-md);">
        <img src="${normalizeImageUrl(item.image_url)}" alt="${item.title}" loading="eager" style="width: 100%; border-radius: var(--radius-md); max-height: 70vh; object-fit: contain; background: rgba(0,0,0,0.2);">
        <p>${item.description || 'No detailed notes were shared for this artwork yet.'}</p>
        <p class="portfolio-site__muted">Availability: ${item.availability === 'physical' ? 'Physical copy available' : 'Digital art'}</p>
        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
          <a href="/portfolio/${artist.id}/gallery" class="btn btn--outline" data-link><i class="bi bi-grid-3x3-gap"></i> Back to Gallery</a>
          <button class="btn btn--primary" type="button" id="copy-portfolio-item-link"><i class="bi bi-link-45deg"></i> Copy Link</button>
        </div>
      </article>
    </section>
  `;
}

function renderSectionContent(section, artist, portfolioItems) {
  if (section === 'bio') return renderFullBioSection(artist);
  if (section === 'about') return renderAboutSection(artist, portfolioItems);
  if (section === 'gallery') return renderGallerySection(portfolioItems);
  if (section === 'contact') return renderContactSection(artist);
  return renderHomeSection(artist, portfolioItems);
}

function setupContactForm(artistId, artistName) {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = form.querySelector('[name="name"]')?.value?.trim();
    const email = form.querySelector('[name="email"]')?.value?.trim();
    const message = form.querySelector('[name="message"]')?.value?.trim();

    if (!name || !email || !message) {
      showToast('Please complete every contact field before sending.', 'warning');
      return;
    }

    const emailIsValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    if (!emailIsValid) {
      showToast('Please provide a valid email address.', 'warning');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Sending...';
    }

    try {
      const payload = {
        sender_name: name,
        sender_email: email,
        message,
      };

      try {
        await api.post(`/artists/${artistId}/contact`, payload);
      } catch (primaryError) {
        const text = (primaryError?.message || '').toLowerCase();
        if (!text.includes('404') && !text.includes('not found')) {
          throw primaryError;
        }
        await api.post(`/artists/${artistId}/messages`, payload);
      }

      showToast(`Message sent to ${artistName}. The artist will respond soon.`, 'success');
      form.reset();
    } catch (error) {
      showToast(error.message || 'Unable to send message right now. Please try again.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-send"></i>Send Message';
      }
    }
  });
}

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
    const activeSection = normalizeSection(params.section);
    const [artistResponse, portfolioResponse] = await Promise.all([
      api.get(`/artists/${params.id}`),
      api.get(`/artists/${params.id}/portfolio?per_page=100`),
    ]);

    const artist = artistResponse.data;
    const portfolioItems = portfolioResponse.data || [];
    const selectedItem = params.itemId
      ? portfolioItems.find((item) => String(item.id) === String(params.itemId))
      : null;
    const heroImage = normalizeImageUrl(portfolioItems[0]?.image_url)
      || normalizeImageUrl(artist.profile_image_url)
      || 'https://placehold.co/1600x900/1f1a22/e6ddcf?text=Artist+Portfolio';
    const initials = getInitials(artist.artist_name);

    const socialLinks = [
      artist.instagram ? `<a href="https://instagram.com/${artist.instagram}" target="_blank" rel="noopener noreferrer"><i class="bi bi-instagram"></i><span>@${artist.instagram}</span></a>` : '',
      artist.twitter ? `<a href="https://twitter.com/${artist.twitter}" target="_blank" rel="noopener noreferrer"><i class="bi bi-twitter"></i><span>@${artist.twitter}</span></a>` : '',
      artist.website ? `<a href="${artist.website}" target="_blank" rel="noopener noreferrer"><i class="bi bi-globe2"></i><span>Website</span></a>` : '',
    ].filter(Boolean).join('');

    app.innerHTML = `
      <section class="portfolio-site animate-fade-in">
        <header class="portfolio-site__hero">
          <img class="portfolio-site__hero-image" src="${heroImage}" alt="${artist.artist_name} featured artwork">
          <div class="portfolio-site__hero-overlay"></div>
          <div class="portfolio-site__hero-content container">
            <nav class="portfolio-site__nav" aria-label="Portfolio sections">
              ${createTopNavigation(artist.id, activeSection)}
            </nav>
            <div class="portfolio-site__identity animate-scale-in">
              <div class="portfolio-site__avatar">
                <img src="${normalizeImageUrl(artist.profile_image_url) || 'https://placehold.co/160x160/181722/e6ddcf?text=' + initials}" alt="${artist.artist_name}">
              </div>
              <div class="portfolio-site__headline">
                <h1>${artist.artist_name} ${artist.is_verified ? '<i class="bi bi-patch-check-fill"></i>' : ''}</h1>
                ${createBioPreviewMarkup(artist, 180, 'portfolio-site__bio-preview portfolio-site__bio-preview--hero')}
                <div class="portfolio-site__social">
                  ${socialLinks || '<span class="portfolio-site__social-empty">No social links shared yet.</span>'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="container portfolio-site__content-wrap">
          ${params.itemId
            ? renderItemDetailSection(artist, selectedItem)
            : renderSectionContent(activeSection, artist, portfolioItems)}
        </div>
      </section>
    `;

    setupContactForm(artist.id, artist.artist_name);

    const copyButton = document.getElementById('copy-portfolio-item-link');
    copyButton?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Artwork link copied.', 'success');
      } catch {
        showToast('Could not copy link from this browser.', 'warning');
      }
    });
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
