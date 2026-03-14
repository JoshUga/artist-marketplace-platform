/**
 * Artist workspace dashboard page.
 */
import store from '../utils/state.js';
import { showToast } from '../components/toast.js';

export function renderAdminPage() {
  const app = document.getElementById('app');
  const user = store.get('user');
  const displayName = user?.full_name || 'Artist';

  app.innerHTML = `
    <div class="workspace">
      <aside class="workspace__sidebar" id="workspace-sidebar">
        <div class="workspace__brand">
          <i class="bi bi-palette2"></i>
          <div>
            <strong>Artist Studio</strong>
            <span>${displayName}</span>
          </div>
        </div>
        <nav class="workspace__nav" id="workspace-nav">
          <button class="workspace__nav-item is-active" data-panel-target="overview"><i class="bi bi-grid"></i> Overview</button>
          <button class="workspace__nav-item" data-panel-target="analytics"><i class="bi bi-graph-up-arrow"></i> Analytics</button>
          <button class="workspace__nav-item" data-panel-target="content"><i class="bi bi-plus-square"></i> Add Content</button>
          <button class="workspace__nav-item" data-panel-target="portfolio"><i class="bi bi-images"></i> Portfolio</button>
          <button class="workspace__nav-item" data-panel-target="inbox"><i class="bi bi-chat-left-text"></i> Buyer Inbox</button>
        </nav>
      </aside>

      <main class="workspace__main">
        <header class="workspace__header">
          <button class="workspace__menu-btn" id="workspace-menu-btn" aria-label="Open menu">
            <i class="bi bi-list"></i>
          </button>
          <div>
            <p class="workspace__eyebrow">Dashboard</p>
            <h1 class="workspace__title">Welcome back, ${displayName}</h1>
          </div>
          <button class="btn btn--primary workspace__header-btn" data-panel-target="content">+ Add Artwork</button>
        </header>

        <section class="workspace__panel is-active" data-panel="overview">
          <div class="workspace__stats">
            <article class="workspace__stat-card">
              <span>Portfolio Items</span>
              <strong>24</strong>
              <small>+4 this month</small>
            </article>
            <article class="workspace__stat-card">
              <span>Profile Views</span>
              <strong>1,842</strong>
              <small>+11% week over week</small>
            </article>
            <article class="workspace__stat-card">
              <span>Private Buyers</span>
              <strong>63</strong>
              <small>12 active conversations</small>
            </article>
          </div>
          <div class="workspace__cards-grid">
            <article class="workspace__card">
              <h3>Upcoming Releases</h3>
              <p>Schedule limited drops and pre-release previews for invited collectors.</p>
            </article>
            <article class="workspace__card">
              <h3>Commission Queue</h3>
              <p>5 commission requests are waiting for review with budget and timeline notes.</p>
            </article>
          </div>
        </section>

        <section class="workspace__panel" data-panel="analytics">
          <div class="workspace__card">
            <h3>Engagement Analytics</h3>
            <p>Track visibility, interest, and buyer intent across your portfolio.</p>
            <div class="workspace__chart">
              <div style="--h: 42%"></div>
              <div style="--h: 68%"></div>
              <div style="--h: 54%"></div>
              <div style="--h: 82%"></div>
              <div style="--h: 74%"></div>
              <div style="--h: 90%"></div>
            </div>
          </div>
        </section>

        <section class="workspace__panel" data-panel="content">
          <form class="workspace__card workspace__form" id="content-form">
            <h3>Add New Artwork</h3>
            <div class="form-group">
              <label class="form-label" for="art-title">Title</label>
              <input id="art-title" class="form-input" required placeholder="Midnight Study No. 4">
            </div>
            <div class="form-group">
              <label class="form-label" for="art-price">Price</label>
              <input id="art-price" type="number" min="0" step="0.01" class="form-input" required placeholder="2500">
            </div>
            <div class="form-group">
              <label class="form-label" for="art-medium">Medium</label>
              <input id="art-medium" class="form-input" placeholder="Oil on canvas">
            </div>
            <div class="form-group">
              <label class="form-label" for="art-description">Description</label>
              <textarea id="art-description" class="form-textarea" placeholder="Share context behind this piece..."></textarea>
            </div>
            <button class="btn btn--primary" type="submit">Save Draft</button>
          </form>
        </section>

        <section class="workspace__panel" data-panel="portfolio">
          <div class="workspace__cards-grid">
            <article class="workspace__portfolio-item">
              <div class="workspace__portfolio-thumb workspace__portfolio-thumb--one"></div>
              <div>
                <h4>Drift in Copper Light</h4>
                <p>Oil, 2026 • Listed</p>
              </div>
            </article>
            <article class="workspace__portfolio-item">
              <div class="workspace__portfolio-thumb workspace__portfolio-thumb--two"></div>
              <div>
                <h4>After Rain, Gallery Street</h4>
                <p>Acrylic, 2026 • Reserved</p>
              </div>
            </article>
            <article class="workspace__portfolio-item">
              <div class="workspace__portfolio-thumb workspace__portfolio-thumb--three"></div>
              <div>
                <h4>Fragments of Silence</h4>
                <p>Mixed media, 2025 • Draft</p>
              </div>
            </article>
          </div>
        </section>

        <section class="workspace__panel" data-panel="inbox">
          <div class="workspace__card">
            <h3>Buyer Inbox</h3>
            <ul class="workspace__inbox">
              <li><strong>Alex M.</strong> asked about a custom variation for Drift in Copper Light.</li>
              <li><strong>Sophia R.</strong> requested a private preview of your next release.</li>
              <li><strong>Daniel K.</strong> confirmed commission budget and timeline details.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  `;

  const sidebar = document.getElementById('workspace-sidebar');
  const toggleBtn = document.getElementById('workspace-menu-btn');
  const panelButtons = Array.from(document.querySelectorAll('[data-panel-target]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const contentForm = document.getElementById('content-form');

  const activatePanel = (panelName) => {
    panelButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.panelTarget === panelName);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === panelName);
    });
    sidebar?.classList.remove('is-open');
  };

  panelButtons.forEach((button) => {
    button.addEventListener('click', () => activatePanel(button.dataset.panelTarget));
  });

  toggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('is-open');
  });

  contentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Artwork draft saved. Connect publish endpoints to make this live.', 'info');
    contentForm.reset();
    activatePanel('portfolio');
  });
}
