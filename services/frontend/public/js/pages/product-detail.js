/**
 * Product detail page.
 */
import api from '../services/api.js';
import { showToast } from '../components/toast.js';

export async function renderProductDetailPage(params) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
      <div class="skeleton" style="height: 400px; border-radius: var(--border-radius-md);"></div>
    </div>
  `;

  try {
    const data = await api.get(`/products/${params.id}`);
    const product = data.data;

    app.innerHTML = `
      <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
        <div class="product-detail animate-fade-in">
          <div class="product-detail-image">
            <img src="${product.image_url || 'https://placehold.co/600x400/e2e8f0/475569?text=Artwork'}" alt="${product.title}">
          </div>
          <div class="product-detail-info">
            <h1>${product.title}</h1>
            <div class="price-display">
              <span class="price-large">$${Number(product.price).toFixed(2)}</span>
              <span class="badge">${product.currency}</span>
            </div>
            ${product.medium ? `<p><strong>Medium:</strong> ${product.medium}</p>` : ''}
            ${product.dimensions ? `<p><strong>Dimensions:</strong> ${product.dimensions}</p>` : ''}
            <p class="product-description">${product.description || 'No description available.'}</p>
            <div class="product-meta">
              <span><i class="bi bi-eye"></i> ${product.view_count} views</span>
              <span><i class="bi bi-box"></i> ${product.quantity} available</span>
            </div>
            <button class="btn btn-primary btn-lg" style="margin-top: var(--spacing-lg);">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container" style="padding: var(--spacing-2xl) var(--spacing-md);">
        <div class="empty-state">
          <i class="bi bi-exclamation-circle"></i>
          <h3>Product not found</h3>
          <a href="/" class="btn btn-primary" data-link>Back to Home</a>
        </div>
      </div>
    `;
  }
}
