/**
 * Artist workspace dashboard page.
 */
import api from '../services/api.js';
import store from '../utils/state.js';
import { showToast } from '../components/toast.js';
import { logout } from '../services/auth.js';
import router from '../utils/router.js';

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
          <button class="workspace__nav-item" data-panel-target="profile"><i class="bi bi-person-vcard"></i> Profile</button>
          <button class="workspace__nav-item" data-panel-target="content"><i class="bi bi-collection"></i> Content</button>
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
          <div style="display: inline-flex; gap: var(--spacing-sm); flex-wrap: wrap;">
            <button class="btn btn--outline workspace__header-btn" id="workspace-edit-profile-btn">
              <i class="bi bi-pencil-square"></i> Edit Profile
            </button>
            <button class="btn btn--primary workspace__header-btn" id="workspace-add-content-btn">+ Add Artwork</button>
            <button class="btn btn--outline workspace__header-btn" id="workspace-open-portfolio-btn">
              <i class="bi bi-window-stack"></i> Open Portfolio Site
            </button>
            <button class="btn btn--ghost workspace__header-btn" id="workspace-logout-btn">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
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

        <section class="workspace__panel" data-panel="profile">
          <div class="workspace-profile">
            <article class="workspace__card workspace-profile__intro">
              <h3>Artist Profile</h3>
              <p>Your portfolio site pulls details directly from this profile. Keep this updated so buyers see the right identity, bio, and links.</p>
            </article>

            <form class="workspace__form workspace-profile__form" id="profile-form">
              <div class="form-group">
                <label class="form-label" for="profile-artist-name">Artist Name</label>
                <input id="profile-artist-name" class="form-input" required placeholder="Studio or artist display name">
              </div>
              <div class="form-group">
                <label class="form-label" for="profile-bio">Bio</label>
                <textarea id="profile-bio" class="form-textarea" placeholder="Share your style, process, and current body of work."></textarea>
              </div>
              <div class="workspace-profile__grid">
                <div class="form-group">
                  <label class="form-label" for="profile-image-url">Profile Image URL</label>
                  <input id="profile-image-url" type="url" class="form-input" placeholder="https://images.example.com/portrait.jpg">
                </div>
                <div class="form-group">
                  <label class="form-label" for="profile-website">Website</label>
                  <input id="profile-website" type="url" class="form-input" placeholder="https://yourstudio.com">
                </div>
              </div>
              <div class="workspace-profile__grid">
                <div class="form-group">
                  <label class="form-label" for="profile-instagram">Instagram</label>
                  <input id="profile-instagram" class="form-input" placeholder="username">
                </div>
                <div class="form-group">
                  <label class="form-label" for="profile-twitter">X / Twitter</label>
                  <input id="profile-twitter" class="form-input" placeholder="username">
                </div>
              </div>
              <button class="btn btn--primary" type="submit" id="profile-save-btn">Save Profile</button>
            </form>

            <article class="workspace__card workspace-profile__preview" id="profile-preview-card">
              <h4>Live Profile Snapshot</h4>
              <p>Changes update your standalone portfolio site experience.</p>
              <ul id="profile-preview-list"></ul>
            </article>
          </div>
        </section>

        <section class="workspace__panel" data-panel="content">
          <div class="workspace__content-head">
            <div>
              <h3>Content Library</h3>
              <p>Manage every piece that powers your independent portfolio site.</p>
            </div>
            <button class="btn btn--primary" id="content-add-btn"><i class="bi bi-plus-lg"></i> Add Content</button>
          </div>
          <div class="workspace__content-grid" id="workspace-content-grid">
            <article class="workspace__content-card is-placeholder">
              <div class="workspace__content-thumb"></div>
              <div class="workspace__content-meta">
                <h4>Loading content...</h4>
                <p>Please wait while we fetch your portfolio items.</p>
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

      <div class="workspace__drawer-backdrop" id="content-drawer-backdrop"></div>
      <aside class="workspace__drawer" id="content-drawer" aria-hidden="true">
        <div class="workspace__drawer-head">
          <div>
            <p class="workspace__eyebrow">New Content</p>
            <h3>Add Artwork</h3>
          </div>
          <button class="workspace__drawer-close" id="content-drawer-close" aria-label="Close add content drawer">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <form class="workspace__form" id="content-form">
          <div class="form-group">
            <label class="form-label" for="art-title">Title</label>
            <input id="art-title" class="form-input" required placeholder="Midnight Study No. 4">
          </div>
          <div class="form-group">
            <label class="form-label" for="art-image-url">Image URL</label>
            <input id="art-image-url" type="url" class="form-input" required placeholder="https://images.example.com/artwork.jpg">
          </div>
          <div class="form-group">
            <label class="form-label" for="art-sort-order">Display Order</label>
            <input id="art-sort-order" type="number" min="0" step="1" class="form-input" value="0">
          </div>
          <div class="form-group">
            <label class="form-label" for="art-description">Description</label>
            <textarea id="art-description" class="form-textarea" placeholder="Share context behind this piece..."></textarea>
          </div>
          <button class="btn btn--primary btn--block" type="submit" id="content-submit-btn">Publish to Content Library</button>
        </form>
      </aside>
    </div>
  `;

  const sidebar = document.getElementById('workspace-sidebar');
  const toggleBtn = document.getElementById('workspace-menu-btn');
  const panelButtons = Array.from(document.querySelectorAll('[data-panel-target]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const openDrawerButtons = [
    document.getElementById('workspace-add-content-btn'),
    document.getElementById('content-add-btn'),
  ].filter(Boolean);
  const contentGrid = document.getElementById('workspace-content-grid');
  const editProfileBtn = document.getElementById('workspace-edit-profile-btn');
  const openPortfolioBtn = document.getElementById('workspace-open-portfolio-btn');
  const profileForm = document.getElementById('profile-form');
  const profileSaveBtn = document.getElementById('profile-save-btn');
  const profilePreviewList = document.getElementById('profile-preview-list');
  const contentForm = document.getElementById('content-form');
  const contentSubmitBtn = document.getElementById('content-submit-btn');
  const drawer = document.getElementById('content-drawer');
  const drawerBackdrop = document.getElementById('content-drawer-backdrop');
  const closeDrawerBtn = document.getElementById('content-drawer-close');
  const logoutBtn = document.getElementById('workspace-logout-btn');
  let artistProfile = null;

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

  const closeDrawer = () => {
    drawer?.classList.remove('is-open');
    drawerBackdrop?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
  };

  const openDrawer = () => {
    if (!artistProfile?.id) {
      activatePanel('profile');
      showToast('Complete your artist profile before adding content.', 'info');
      return;
    }

    activatePanel('content');
    drawer?.classList.add('is-open');
    drawerBackdrop?.classList.add('is-open');
    drawer?.setAttribute('aria-hidden', 'false');
    document.getElementById('art-title')?.focus();
  };

  openDrawerButtons.forEach((button) => {
    button.addEventListener('click', openDrawer);
  });

  editProfileBtn?.addEventListener('click', () => activatePanel('profile'));

  closeDrawerBtn?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });

  const renderContentItems = (items = []) => {
    if (!contentGrid) return;
    if (!items.length) {
      contentGrid.innerHTML = `
        <article class="workspace__content-card workspace__content-card--empty">
          <div class="workspace__content-meta">
            <h4>No content yet</h4>
            <p>Add your first artwork and it will automatically appear on your portfolio site.</p>
          </div>
        </article>
      `;
      return;
    }

    contentGrid.innerHTML = items
      .map((item) => `
        <article class="workspace__content-card">
          <div class="workspace__content-thumb">
            <img src="${item.image_url}" alt="${item.title}" loading="lazy">
          </div>
          <div class="workspace__content-meta">
            <h4>${item.title}</h4>
            <p>${item.description || 'No description added yet.'}</p>
            <small>Display order: ${item.sort_order}</small>
          </div>
        </article>
      `)
      .join('');
  };

  const previewValue = (value, emptyLabel) => value?.trim() || emptyLabel;

  const renderProfilePreview = (profile) => {
    if (!profilePreviewList) return;

    profilePreviewList.innerHTML = `
      <li><strong>Name:</strong> ${previewValue(profile?.artist_name, 'Not set')}</li>
      <li><strong>Bio:</strong> ${previewValue(profile?.bio, 'No bio yet')}</li>
      <li><strong>Website:</strong> ${previewValue(profile?.website, 'Not set')}</li>
      <li><strong>Instagram:</strong> ${previewValue(profile?.instagram, 'Not set')}</li>
      <li><strong>X/Twitter:</strong> ${previewValue(profile?.twitter, 'Not set')}</li>
    `;
  };

  const fillProfileForm = (profile) => {
    document.getElementById('profile-artist-name').value = profile?.artist_name || '';
    document.getElementById('profile-bio').value = profile?.bio || '';
    document.getElementById('profile-image-url').value = profile?.profile_image_url || '';
    document.getElementById('profile-website').value = profile?.website || '';
    document.getElementById('profile-instagram').value = profile?.instagram || '';
    document.getElementById('profile-twitter').value = profile?.twitter || '';

    if (profileSaveBtn) {
      profileSaveBtn.textContent = profile?.id ? 'Save Profile Changes' : 'Create Artist Profile';
    }

    renderProfilePreview(profile);
  };

  const loadArtistProfile = async () => {
    try {
      const response = await api.get('/artists/me');
      return response.data || null;
    } catch (error) {
      if ((error.message || '').toLowerCase().includes('artist not found')) {
        return null;
      }
      throw error;
    }
  };

  const loadContentItems = async () => {
    if (!contentGrid) return;
    try {
      contentGrid.innerHTML = `
        <article class="workspace__content-card is-placeholder">
          <div class="workspace__content-thumb"></div>
          <div class="workspace__content-meta">
            <h4>Loading content...</h4>
            <p>Please wait while we fetch your portfolio items.</p>
          </div>
        </article>
      `;

      artistProfile = await loadArtistProfile();
      fillProfileForm(artistProfile);
      if (!artistProfile?.id) {
        contentGrid.innerHTML = `
          <article class="workspace__content-card workspace__content-card--notice">
            <div class="workspace__content-meta">
              <h4>Artist profile required</h4>
              <p>Create your artist profile first, then you can publish content and launch your portfolio site.</p>
            </div>
          </article>
        `;
        activatePanel('profile');
        return;
      }

      const portfolioResponse = await api.get(`/artists/${artistProfile.id}/portfolio?per_page=100`);
      renderContentItems(portfolioResponse.data || []);
    } catch (error) {
      contentGrid.innerHTML = `
        <article class="workspace__content-card workspace__content-card--empty">
          <div class="workspace__content-meta">
            <h4>Unable to load content</h4>
            <p>We could not fetch your content library right now. Try again in a moment.</p>
          </div>
        </article>
      `;
    }
  };

  openPortfolioBtn?.addEventListener('click', async () => {
    if (!artistProfile?.id) {
      try {
        artistProfile = await loadArtistProfile();
      } catch (error) {
        showToast('Unable to load your artist profile right now. Please refresh and try again.', 'error');
        return;
      }
    }

    if (!artistProfile?.id) {
      showToast('Create your artist profile before opening the portfolio site.', 'info');
      activatePanel('profile');
      return;
    }

    router.navigate(`/portfolio/${artistProfile.id}`);
  });

  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const artistName = document.getElementById('profile-artist-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const profileImageUrl = document.getElementById('profile-image-url').value.trim();
    const website = document.getElementById('profile-website').value.trim();
    const instagram = document.getElementById('profile-instagram').value.trim();
    const twitter = document.getElementById('profile-twitter').value.trim();

    if (!artistName) {
      showToast('Artist name is required.', 'error');
      return;
    }

    const payload = {
      artist_name: artistName,
      bio: bio || null,
      profile_image_url: profileImageUrl || null,
      website: website || null,
      instagram: instagram || null,
      twitter: twitter || null,
    };

    profileSaveBtn.disabled = true;
    profileSaveBtn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
      if (artistProfile?.id) {
        await api.put(`/artists/${artistProfile.id}/profile`, payload);
      } else {
        await api.post('/artists/register', payload);
      }

      artistProfile = await loadArtistProfile();
      fillProfileForm(artistProfile);
      await loadContentItems();
      showToast('Profile saved. Your portfolio site is now ready to publish.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save profile.', 'error');
    } finally {
      profileSaveBtn.disabled = false;
      profileSaveBtn.textContent = artistProfile?.id ? 'Save Profile Changes' : 'Create Artist Profile';
    }
  });

  contentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!artistProfile?.id) {
      showToast('Artist profile is required before adding content.', 'error');
      return;
    }

    const title = document.getElementById('art-title')?.value?.trim();
    const imageUrl = document.getElementById('art-image-url')?.value?.trim();
    const description = document.getElementById('art-description')?.value?.trim();
    const sortOrder = Number(document.getElementById('art-sort-order')?.value || 0);

    if (!title || !imageUrl) {
      showToast('Title and image URL are required.', 'error');
      return;
    }

    contentSubmitBtn.disabled = true;
    contentSubmitBtn.innerHTML = '<span class="spinner"></span> Publishing...';

    try {
      await api.post(`/artists/${artistProfile.id}/portfolio`, {
        title,
        image_url: imageUrl,
        description: description || null,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      });

      showToast('Content published to your portfolio site.', 'success');
      contentForm.reset();
      document.getElementById('art-sort-order').value = '0';
      closeDrawer();
      await loadContentItems();
    } catch (error) {
      showToast(error.message || 'Failed to publish content.', 'error');
    } finally {
      contentSubmitBtn.disabled = false;
      contentSubmitBtn.innerHTML = 'Publish to Content Library';
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    logoutBtn.innerHTML = '<span class="spinner"></span> Logging out...';

    try {
      await logout();
      showToast('You have been logged out.', 'success');
      router.navigate('/login');
    } catch (error) {
      showToast(error.message || 'Logout failed', 'error');
      logoutBtn.disabled = false;
      logoutBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
    }
  });

  loadContentItems();
}
