/**
 * Admin dashboard page.
 */
import store from '../utils/state.js';

export function renderAdminPage() {
  const app = document.getElementById('app');
  const user = store.get('user');

  app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2><i class="bi bi-speedometer2"></i> Dashboard</h2>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="sidebar-link active"><i class="bi bi-speedometer"></i> Overview</a>
          <a href="#" class="sidebar-link"><i class="bi bi-people"></i> Users</a>
          <a href="#" class="sidebar-link"><i class="bi bi-box-seam"></i> Products</a>
          <a href="#" class="sidebar-link"><i class="bi bi-receipt"></i> Orders</a>
          <a href="#" class="sidebar-link"><i class="bi bi-brush"></i> Artists</a>
          <a href="#" class="sidebar-link"><i class="bi bi-tags"></i> Categories</a>
        </nav>
      </aside>
      <main class="admin-content">
        <h1 class="animate-fade-in">Welcome${user ? ', ' + user.full_name : ''}</h1>
        <div class="grid grid-cols-4" style="margin-top: var(--spacing-lg);">
          <div class="card stat-card animate-fade-in" style="animation-delay: 0.1s">
            <div class="card-body">
              <div class="stat-icon"><i class="bi bi-people"></i></div>
              <div class="stat-info">
                <span class="stat-value">--</span>
                <span class="stat-label">Total Users</span>
              </div>
            </div>
          </div>
          <div class="card stat-card animate-fade-in" style="animation-delay: 0.2s">
            <div class="card-body">
              <div class="stat-icon" style="background: var(--secondary-color);"><i class="bi bi-brush"></i></div>
              <div class="stat-info">
                <span class="stat-value">--</span>
                <span class="stat-label">Artists</span>
              </div>
            </div>
          </div>
          <div class="card stat-card animate-fade-in" style="animation-delay: 0.3s">
            <div class="card-body">
              <div class="stat-icon" style="background: var(--accent-color);"><i class="bi bi-box-seam"></i></div>
              <div class="stat-info">
                <span class="stat-value">--</span>
                <span class="stat-label">Products</span>
              </div>
            </div>
          </div>
          <div class="card stat-card animate-fade-in" style="animation-delay: 0.4s">
            <div class="card-body">
              <div class="stat-icon" style="background: var(--danger-color);"><i class="bi bi-receipt"></i></div>
              <div class="stat-info">
                <span class="stat-value">--</span>
                <span class="stat-label">Orders</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}
