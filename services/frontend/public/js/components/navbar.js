/**
 * Navigation bar component.
 */
import store from '../utils/state.js';
import router from '../utils/router.js';

export function createNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-container container">
      <a href="/" class="navbar-brand" data-link>
        <i class="bi bi-palette"></i>
        <span>ArtMarket</span>
      </a>
      <div class="navbar-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search artwork..." class="search-input" id="global-search">
      </div>
      <div class="navbar-links" id="nav-links">
        <a href="/" class="nav-link" data-link><i class="bi bi-house"></i> Home</a>
        <a href="/artists" class="nav-link" data-link><i class="bi bi-brush"></i> Artists</a>
        <div id="auth-nav-links"></div>
      </div>
      <button class="navbar-toggle" id="nav-toggle" aria-label="Toggle menu">
        <i class="bi bi-list"></i>
      </button>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
        <i class="bi bi-moon"></i>
      </button>
    </div>
  `;

  updateAuthLinks();
  window.addEventListener('auth-changed', updateAuthLinks);

  return nav;
}

function updateAuthLinks() {
  const container = document.getElementById('auth-nav-links');
  if (!container) return;

  const isAuth = !!localStorage.getItem('access_token');
  if (isAuth) {
    const user = store.get('user');
    container.innerHTML = `
      <a href="/admin" class="nav-link" data-link><i class="bi bi-speedometer"></i> Dashboard</a>
      <a href="#" class="nav-link" id="logout-link"><i class="bi bi-box-arrow-right"></i> Logout</a>
    `;
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const { logout } = await import('../services/auth.js');
        await logout();
        router.navigate('/');
      });
    }
  } else {
    container.innerHTML = `
      <a href="/login" class="nav-link" data-link><i class="bi bi-box-arrow-in-right"></i> Login</a>
      <a href="/register" class="nav-link btn btn-primary btn-sm" data-link><i class="bi bi-person-plus"></i> Register</a>
    `;
  }
}

export function setupNavEvents() {
  // Hamburger toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
      const icon = toggle.querySelector('i');
      icon.className = links.classList.contains('active') ? 'bi bi-x' : 'bi bi-list';
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
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        router.navigate(href);
        // Close mobile menu
        const navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('active');
      }
    }
  });
}
