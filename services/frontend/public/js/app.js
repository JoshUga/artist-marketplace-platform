/**
 * Main application entry point.
 */
import router from './utils/router.js';
import store from './utils/state.js';
import { setupNavEvents } from './components/navbar.js';
import { renderHomePage } from './pages/home.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderArtistsPage } from './pages/artists.js';
import { renderArtistDetailPage } from './pages/artist-detail.js';
import { renderProductDetailPage } from './pages/product-detail.js';
import { renderAdminPage } from './pages/admin.js';
import {
  renderPrivacyPolicyPage,
  renderTermsOfUsePage,
  renderDataRemovalPage,
} from './pages/legal.js';
import { loadCurrentUser, isAuthenticated } from './services/auth.js';

// Apply saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Initialize app structure
function initApp() {
  const body = document.body;

  // Clear existing content
  body.innerHTML = '';

  // Add main content area
  const main = document.createElement('main');
  main.id = 'app';
  main.className = 'main-content';
  body.appendChild(main);

  // Setup navigation events
  setupNavEvents();
}

// Setup routes
function setupRoutes() {
  router
    .add('/', () => {
      if (isAuthenticated()) {
        renderAdminPage();
      } else {
        renderHomePage();
      }
    })
    .add('/login', () => renderLoginPage())
    .add('/register', () => renderRegisterPage())
    .add('/privacy-policy', () => renderPrivacyPolicyPage())
    .add('/terms-of-use', () => renderTermsOfUsePage())
    .add('/data-removal', () => renderDataRemovalPage())
    .add('/artists', () => renderArtistsPage())
    .add('/artists/:id', (params) => renderArtistDetailPage(params))
    .add('/portfolio/:id', (params) => renderArtistDetailPage(params))
    .add('/products/:id', (params) => renderProductDetailPage(params))
    .add('/admin', () => {
      if (!isAuthenticated()) {
        router.navigate('/login');
        return;
      }
      renderAdminPage();
    })
    .setNotFound(() => {
      const homeHref = isAuthenticated() ? '/admin' : '/';
      const homeLabel = isAuthenticated() ? 'Go to Dashboard' : 'Go Home';
      document.getElementById('app').innerHTML = `
        <div class="container" style="padding: var(--spacing-3xl) var(--spacing-md); text-align: center;">
          <div class="empty-state">
            <i class="bi bi-question-circle"></i>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="${homeHref}" class="btn btn--primary" data-link>${homeLabel}</a>
          </div>
        </div>
      `;
    });
}

// Boot the application
async function boot() {
  initApp();
  setupRoutes();

  // Load user if token exists
  if (isAuthenticated()) {
    await loadCurrentUser();
  }

  // Start router
  router.start();
}

// Start
document.addEventListener('DOMContentLoaded', boot);
