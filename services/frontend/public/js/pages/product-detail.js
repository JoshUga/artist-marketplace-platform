/**
 * Product detail page.
 */
import api from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';
import { showToast } from '../components/toast.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function upsertMetaTag(attrName, attrValue, content) {
  if (!content) return;
  const selector = `meta[${attrName}="${attrValue}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setProductMeta(product) {
  const title = `${product.title} | EliteArt Studio`;
  const description = (product.description || `Explore ${product.title} on EliteArt Studio.`).slice(0, 280);
  const image = product.image_url || 'https://placehold.co/1200x630/181722/ececf2?text=EliteArt+Studio';
  const canonicalUrl = window.location.href;

  document.title = title;
  upsertMetaTag('name', 'description', description);
  upsertMetaTag('property', 'og:type', 'website');
  upsertMetaTag('property', 'og:title', title);
  upsertMetaTag('property', 'og:description', description);
  upsertMetaTag('property', 'og:image', image);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', title);
  upsertMetaTag('name', 'twitter:description', description);
  upsertMetaTag('name', 'twitter:image', image);
}

function getShareLinks(url, title) {
  const shareText = `${title} on EliteArt Studio`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(shareText);

  return [
    { label: 'Facebook', icon: 'bi-facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'WhatsApp', icon: 'bi-whatsapp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: 'Twitter/X', icon: 'bi-twitter-x', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: 'LinkedIn', icon: 'bi-linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: 'Telegram', icon: 'bi-telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'Reddit', icon: 'bi-reddit', href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { label: 'Email', icon: 'bi-envelope', href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];
}

function renderStars(rating) {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return `${filled}${empty}`;
}

export async function renderProductDetailPage(params) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md) var(--spacing-2xl);">
      <div class="skeleton" style="height: 540px; border-radius: var(--radius-md);"></div>
    </div>
  `;

  try {
    const [productData, engagementData] = await Promise.all([
      api.get(`/products/${params.id}`),
      api.get(`/products/${params.id}/engagement`),
    ]);
    const product = productData.data;
    const engagement = engagementData.data;
    setProductMeta(product);

    const productUrl = window.location.href;
    const shareLinks = getShareLinks(productUrl, product.title);
    const reviewsMarkup = (engagement.reviews || [])
      .map((review) => `
        <article class="product-review-item">
          <div class="product-review-item__header">
            <strong>${escapeHtml(review.user_name)}</strong>
            <span class="product-review-item__rating">${renderStars(review.rating)}</span>
          </div>
          <p>${escapeHtml(review.comment)}</p>
        </article>
      `)
      .join('');

    app.innerHTML = `
      <div class="container product-page">
        <div class="product-layout animate-fade-in">
          <div class="product-media card">
            <img src="${product.image_url || 'https://placehold.co/900x640/e2e8f0/475569?text=Artwork'}" alt="${escapeHtml(product.title)}">
          </div>
          <div class="product-panel card">
            <div class="card__body">
              <h1 class="product-title">${escapeHtml(product.title)}</h1>
              <div class="product-price-row">
                <span class="product-price">$${Number(product.price).toFixed(2)}</span>
                <span class="badge">${escapeHtml(product.currency)}</span>
              </div>
              ${product.medium ? `<p><strong>Medium:</strong> ${escapeHtml(product.medium)}</p>` : ''}
              ${product.dimensions ? `<p><strong>Dimensions:</strong> ${escapeHtml(product.dimensions)}</p>` : ''}
              <p class="product-description">${escapeHtml(product.description || 'No description available.')}</p>

              <div class="product-stats">
                <span><i class="bi bi-eye"></i> ${product.view_count} views</span>
                <span><i class="bi bi-heart"></i> <span id="likes-count">${engagement.likes_count || 0}</span> likes</span>
                <span><i class="bi bi-chat-dots"></i> <span id="reviews-count">${engagement.review_count || 0}</span> comments</span>
                <span><i class="bi bi-star-fill"></i> ${Number(engagement.average_rating || 0).toFixed(1)} / 5</span>
                <span><i class="bi bi-box"></i> ${product.quantity} available</span>
              </div>

              <div class="product-action-row">
                <button id="like-btn" class="btn ${engagement.liked_by_current_user ? 'btn--primary' : 'btn--outline'}" type="button">
                  <i class="bi ${engagement.liked_by_current_user ? 'bi-heart-fill' : 'bi-heart'}"></i>
                  <span>${engagement.liked_by_current_user ? 'Liked' : 'Like'}</span>
                </button>
                <button id="native-share-btn" class="btn btn--outline" type="button">
                  <i class="bi bi-share"></i>
                  <span>Share</span>
                </button>
                <button id="copy-link-btn" class="btn btn--ghost" type="button">
                  <i class="bi bi-link-45deg"></i>
                  <span>Copy Link</span>
                </button>
              </div>

              <section class="product-share-grid" aria-label="Share artwork">
                ${shareLinks
                  .map(
                    (link) => `
                      <a class="btn btn--outline btn--sm" href="${link.href}" target="_blank" rel="noopener noreferrer">
                        <i class="bi ${link.icon}"></i> ${link.label}
                      </a>
                    `
                  )
                  .join('')}
              </section>

              <button class="btn btn--primary btn--block" style="margin-top: var(--spacing-lg);" type="button">
                <i class="bi bi-cart-plus"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>

        <section class="card product-reviews">
          <div class="card__body">
            <div class="product-review-head">
              <h2>Reviews & Comments</h2>
              <p>${engagement.review_count || 0} total</p>
            </div>

            <form id="review-form" class="product-review-form">
              <div class="form-group">
                <label class="form-label" for="rating">Rating</label>
                <select id="rating" class="form-input" required>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Great</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="comment">Comment</label>
                <textarea id="comment" class="form-textarea" placeholder="Share what you think about this artwork" minlength="3" required></textarea>
              </div>
              <button class="btn btn--primary" type="submit">Post Comment</button>
              ${!isAuthenticated() ? '<p class="text-muted">Login to post comments or like this artwork.</p>' : ''}
            </form>

            <div id="reviews-list" class="product-reviews-list">
              ${reviewsMarkup || '<p class="text-muted">No reviews yet. Be the first to add one.</p>'}
            </div>
          </div>
        </section>
      </div>
    `;

    const likeBtn = document.getElementById('like-btn');
    likeBtn?.addEventListener('click', async () => {
      if (!isAuthenticated()) {
        showToast('Please login to like this artwork.', 'warning');
        return;
      }

      const liked = likeBtn.classList.contains('btn--primary');
      try {
        const response = liked
          ? await api.delete(`/products/${product.id}/likes`)
          : await api.post(`/products/${product.id}/likes`, {});
        const nextLiked = response.data.liked;
        const likesCount = response.data.likes_count;

        document.getElementById('likes-count').textContent = String(likesCount);
        likeBtn.classList.toggle('btn--primary', nextLiked);
        likeBtn.classList.toggle('btn--outline', !nextLiked);
        likeBtn.innerHTML = `<i class="bi ${nextLiked ? 'bi-heart-fill' : 'bi-heart'}"></i><span>${nextLiked ? 'Liked' : 'Like'}</span>`;
      } catch (error) {
        showToast(error.message || 'Unable to update like right now.', 'error');
      }
    });

    document.getElementById('copy-link-btn')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(productUrl);
        showToast('Product link copied.', 'success');
      } catch (error) {
        showToast('Could not copy link. Copy it manually from the address bar.', 'warning');
      }
    });

    document.getElementById('native-share-btn')?.addEventListener('click', async () => {
      if (!navigator.share) {
        showToast('Native share is not available on this browser.', 'info');
        return;
      }

      try {
        await navigator.share({
          title: product.title,
          text: `Take a look at ${product.title} on EliteArt Studio`,
          url: productUrl,
        });
      } catch (error) {
        // User cancellation should not show an error toast.
      }
    });

    document.getElementById('review-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!isAuthenticated()) {
        showToast('Please login to post a comment.', 'warning');
        return;
      }

      const rating = Number(document.getElementById('rating').value || 5);
      const commentInput = document.getElementById('comment');
      const comment = commentInput.value.trim();
      if (comment.length < 3) {
        showToast('Please enter at least 3 characters.', 'warning');
        return;
      }

      try {
        const response = await api.post(`/products/${product.id}/reviews`, { rating, comment });
        const review = response.data;
        const reviewsList = document.getElementById('reviews-list');
        const newReviewMarkup = `
          <article class="product-review-item">
            <div class="product-review-item__header">
              <strong>${escapeHtml(review.user_name)}</strong>
              <span class="product-review-item__rating">${renderStars(review.rating)}</span>
            </div>
            <p>${escapeHtml(review.comment)}</p>
          </article>
        `;

        if (reviewsList.querySelector('p.text-muted')) {
          reviewsList.innerHTML = newReviewMarkup;
        } else {
          reviewsList.insertAdjacentHTML('afterbegin', newReviewMarkup);
        }

        const reviewsCountElement = document.getElementById('reviews-count');
        const nextCount = Number(reviewsCountElement.textContent || 0) + 1;
        reviewsCountElement.textContent = String(nextCount);
        commentInput.value = '';
        showToast('Comment posted.', 'success');
      } catch (error) {
        showToast(error.message || 'Could not post comment.', 'error');
      }
    });
  } catch (error) {
    document.title = 'Product Not Found | EliteArt Studio';
    app.innerHTML = `
      <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
        <div class="empty-state">
          <i class="bi bi-exclamation-circle"></i>
          <h3>Product not found</h3>
          <a href="/" class="btn btn--primary" data-link>Back to Home</a>
        </div>
      </div>
    `;
  }
}
