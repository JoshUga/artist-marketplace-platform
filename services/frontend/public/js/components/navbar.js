/**
 * Navigation bar component.
 */
import store from '../utils/state.js';
import router from '../utils/router.js';

export function createNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar__inner container">
      <a href="/" class="navbar__brand" data-link>
        <i class="bi bi-palette"></i>
        <span>ArtMarket</span>
      </a>
      <div class="navbar__links" id="nav-links-desktop">
        <a href="/" class="navbar__link" data-link><i class="bi bi-house"></i> Home</a>
        <a href="/artists" class="navbar__link" data-link><i class="bi bi-brush"></i> Artists</a>
        <div id="auth-nav-links-desktop"></div>
      </div>
      <div class="navbar__actions">
        <button class="btn btn--icon btn--ghost" id="theme-toggle" aria-label="Toggle theme">
          <i class="bi bi-moon"></i>
        </button>
        <button class="navbar__toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
          <span class="navbar__hamburger" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
    </div>
    <div class="navbar__mobile-menu" id="nav-links-mobile">
      <a href="/" class="navbar__link" data-link><i class="bi bi-house"></i> Home</a>
      <a href="/artists" class="navbar__link" data-link><i class="bi bi-brush"></i> Artists</a>
      <div id="auth-nav-links-mobile"></div>
    </div>
  `;

  setAuthLinksContent(
    nav.querySelector('#auth-nav-links-desktop'),
    nav.querySelector('#auth-nav-links-mobile')
  );
  window.addEventListener('auth-changed', updateAuthLinks);

  return nav;
}

function renderAuthLinks(isAuth) {
  if (isAuth) {
    return `
      <a href="/admin" class="navbar__link" data-link><i class="bi bi-speedometer"></i> Dashboard</a>
      <a href="#" class="navbar__link" data-logout><i class="bi bi-box-arrow-right"></i> Logout</a>
    `;
  }

  return `
    <a href="/login" class="navbar__link" data-link><i class="bi bi-box-arrow-in-right"></i> Login</a>
    <a href="/register" class="navbar__link" data-link><i class="bi bi-person-plus"></i> Register</a>
  `;
}

function setAuthLinksContent(desktopContainer, mobileContainer) {
  if (!desktopContainer || !mobileContainer) return;

  const isAuth = !!localStorage.getItem('access_token');

  const markup = renderAuthLinks(isAuth);
  desktopContainer.innerHTML = markup;
  mobileContainer.innerHTML = markup;
}

function updateAuthLinks() {
  setAuthLinksContent(
    document.getElementById('auth-nav-links-desktop'),
    document.getElementById('auth-nav-links-mobile')
  );
}

export function setupNavEvents() {
  // Hamburger toggle
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('nav-links-mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', mobileMenu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const icon = themeToggle.querySelector('i');
      icon.className = next === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
    });
  }

  // Link navigation - delegate click handling
  document.addEventListener('click', (e) => {
    const logoutLink = e.target.closest('[data-logout]');
    if (logoutLink) {
      e.preventDefault();
      import('../services/auth.js')
        .then(async ({ logout }) => {
          await logout();
          router.navigate('/');
        });
      return;
    }

    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        router.navigate(href);
        // Close mobile menu
        const navLinks = document.getElementById('nav-links-mobile');
        if (navLinks) navLinks.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}
