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
                  <label class="form-label" for="profile-image-file">Profile Picture</label>
                  <div class="upload-dropzone upload-dropzone--profile" id="profile-upload-dropzone" role="button" tabindex="0" aria-describedby="profile-upload-hint profile-upload-file-name">
                    <input id="profile-image-file" type="file" class="upload-dropzone__input" accept="image/*">
                    <div class="upload-dropzone__preview" id="profile-upload-preview" aria-hidden="true">
                      <img id="profile-upload-preview-image" alt="Selected profile image preview">
                    </div>
                    <div class="upload-dropzone__icon" aria-hidden="true">
                      <i class="bi bi-person-bounding-box"></i>
                    </div>
                    <p class="upload-dropzone__title">Drop profile photo or click to browse</p>
                    <p class="upload-dropzone__hint" id="profile-upload-hint">PNG, JPG, WEBP, GIF</p>
                    <p class="upload-dropzone__file" id="profile-upload-file-name">No file selected</p>
                  </div>
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
            <ul class="workspace__inbox" id="workspace-inbox-list">
              <li>Loading messages...</li>
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
            <label class="form-label" for="art-image-file">Upload Artwork Image</label>
            <div class="upload-dropzone" id="art-upload-dropzone" role="button" tabindex="0" aria-describedby="art-upload-hint art-upload-file-name">
              <input id="art-image-file" type="file" class="upload-dropzone__input" accept="image/*">
              <div class="upload-dropzone__preview" id="art-upload-preview" aria-hidden="true">
                <img id="art-upload-preview-image" alt="Selected artwork preview">
              </div>
              <div class="upload-dropzone__icon" aria-hidden="true">
                <i class="bi bi-cloud-arrow-up"></i>
              </div>
              <p class="upload-dropzone__title">Drop image here or click to browse</p>
              <p class="upload-dropzone__hint" id="art-upload-hint">PNG, JPG, WEBP, GIF</p>
              <p class="upload-dropzone__file" id="art-upload-file-name">No file selected</p>
            </div>
          </div>
          <div class="form-group">
            <p class="form-label">Artwork source</p>
            <p class="upload-dropzone__hint">Artwork image must be uploaded. External image URLs are disabled.</p>
          </div>
          <div class="form-group">
            <label class="form-label" for="art-availability">Availability</label>
            <select id="art-availability" class="form-input">
              <option value="digital">Digital art</option>
              <option value="physical">Physical copy available</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <div class="rich-editor" id="art-description-editor" contenteditable="true" data-placeholder="Write a rich description for this piece..."></div>
            <div class="rich-editor__toolbar" role="toolbar" aria-label="Description formatting">
              <button type="button" class="rich-editor__btn" data-rich-command="bold"><i class="bi bi-type-bold"></i></button>
              <button type="button" class="rich-editor__btn" data-rich-command="italic"><i class="bi bi-type-italic"></i></button>
              <button type="button" class="rich-editor__btn" data-rich-command="underline"><i class="bi bi-type-underline"></i></button>
              <button type="button" class="rich-editor__btn" data-rich-command="insertUnorderedList"><i class="bi bi-list-ul"></i></button>
              <button type="button" class="rich-editor__btn" data-rich-command="insertOrderedList"><i class="bi bi-list-ol"></i></button>
            </div>
            <label class="form-label" for="art-description-html">HTML/CSS Source (optional)</label>
            <textarea id="art-description-html" class="form-textarea rich-editor__source" placeholder="Optional raw HTML/CSS for this description"></textarea>
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
  const inboxList = document.getElementById('workspace-inbox-list');
  const contentForm = document.getElementById('content-form');
  const contentSubmitBtn = document.getElementById('content-submit-btn');
  const richDescriptionEditor = document.getElementById('art-description-editor');
  const richDescriptionSource = document.getElementById('art-description-html');
  const richDescriptionButtons = Array.from(document.querySelectorAll('[data-rich-command]'));
  const profileImageInput = document.getElementById('profile-image-file');
  const profileUploadDropzone = document.getElementById('profile-upload-dropzone');
  const profileUploadFileName = document.getElementById('profile-upload-file-name');
  const profileUploadPreview = document.getElementById('profile-upload-preview');
  const profileUploadPreviewImage = document.getElementById('profile-upload-preview-image');
  const imageFileInput = document.getElementById('art-image-file');
  const uploadDropzone = document.getElementById('art-upload-dropzone');
  const uploadFileName = document.getElementById('art-upload-file-name');
  const uploadPreview = document.getElementById('art-upload-preview');
  const uploadPreviewImage = document.getElementById('art-upload-preview-image');
  const drawer = document.getElementById('content-drawer');
  const drawerBackdrop = document.getElementById('content-drawer-backdrop');
  const closeDrawerBtn = document.getElementById('content-drawer-close');
  const logoutBtn = document.getElementById('workspace-logout-btn');
  let artistProfile = null;
  let selectedProfilePreviewUrl = null;
  let selectedImagePreviewUrl = null;

  const normalizeImageUrl = (value) => {
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
  };

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

  const setSelectedImageFile = (file) => {
    if (!imageFileInput || !uploadFileName) return;

    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl);
      selectedImagePreviewUrl = null;
    }

    if (!file) {
      imageFileInput.value = '';
      uploadFileName.textContent = 'No file selected';
      uploadDropzone?.classList.remove('has-file');
      uploadPreview?.classList.remove('is-visible');
      if (uploadPreviewImage) uploadPreviewImage.src = '';
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    imageFileInput.files = dataTransfer.files;
    uploadFileName.textContent = `Selected: ${file.name}`;
    uploadDropzone?.classList.add('has-file');

    selectedImagePreviewUrl = URL.createObjectURL(file);
    if (uploadPreviewImage) {
      uploadPreviewImage.src = selectedImagePreviewUrl;
    }
    uploadPreview?.classList.add('is-visible');
  };

  const setSelectedProfileImageFile = (file) => {
    if (!profileImageInput || !profileUploadFileName) return;

    if (selectedProfilePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedProfilePreviewUrl);
    }
    selectedProfilePreviewUrl = null;

    if (!file) {
      profileImageInput.value = '';
      profileUploadFileName.textContent = 'No file selected';
      profileUploadDropzone?.classList.remove('has-file');
      profileUploadPreview?.classList.remove('is-visible');
      if (profileUploadPreviewImage) profileUploadPreviewImage.src = '';
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    profileImageInput.files = dataTransfer.files;
    profileUploadFileName.textContent = `Selected: ${file.name}`;
    profileUploadDropzone?.classList.add('has-file');

    selectedProfilePreviewUrl = URL.createObjectURL(file);
    if (profileUploadPreviewImage) {
      profileUploadPreviewImage.src = selectedProfilePreviewUrl;
    }
    profileUploadPreview?.classList.add('is-visible');
  };

  const showExistingProfileImage = (url) => {
    if (!profileUploadPreview || !profileUploadPreviewImage || !profileUploadFileName) return;

    if (selectedProfilePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedProfilePreviewUrl);
    }
    selectedProfilePreviewUrl = url || null;

    if (!url) {
      profileUploadFileName.textContent = 'No file selected';
      profileUploadDropzone?.classList.remove('has-file');
      profileUploadPreview.classList.remove('is-visible');
      profileUploadPreviewImage.src = '';
      return;
    }

    profileUploadFileName.textContent = 'Current profile image';
    profileUploadDropzone?.classList.add('has-file');
    profileUploadPreviewImage.src = url;
    profileUploadPreview.classList.add('is-visible');
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

  imageFileInput?.addEventListener('change', () => {
    const selectedFile = imageFileInput.files?.[0] || null;
    setSelectedImageFile(selectedFile);
  });

  uploadDropzone?.addEventListener('click', () => {
    imageFileInput?.click();
  });

  uploadDropzone?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      imageFileInput?.click();
    }
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    uploadDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadDropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    uploadDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadDropzone.classList.remove('is-dragover');
    });
  });

  uploadDropzone?.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadDropzone.classList.remove('is-dragover');

    const droppedFiles = Array.from(event.dataTransfer?.files || []);
    const imageFile = droppedFiles.find((file) => file.type.startsWith('image/'));

    if (!imageFile) {
      showToast('Please drop an image file.', 'error');
      return;
    }

    setSelectedImageFile(imageFile);
  });

  const applyRichDescriptionCommand = (command) => {
    richDescriptionEditor?.focus();
    document.execCommand(command, false);
  };

  richDescriptionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyRichDescriptionCommand(button.dataset.richCommand);
    });
  });

  profileImageInput?.addEventListener('change', () => {
    const selectedFile = profileImageInput.files?.[0] || null;
    setSelectedProfileImageFile(selectedFile);
  });

  profileUploadDropzone?.addEventListener('click', () => {
    profileImageInput?.click();
  });

  profileUploadDropzone?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      profileImageInput?.click();
    }
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    profileUploadDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      profileUploadDropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    profileUploadDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      profileUploadDropzone.classList.remove('is-dragover');
    });
  });

  profileUploadDropzone?.addEventListener('drop', (event) => {
    event.preventDefault();
    profileUploadDropzone.classList.remove('is-dragover');

    const droppedFiles = Array.from(event.dataTransfer?.files || []);
    const imageFile = droppedFiles.find((file) => file.type.startsWith('image/'));

    if (!imageFile) {
      showToast('Please drop an image file.', 'error');
      return;
    }

    setSelectedProfileImageFile(imageFile);
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
            <a href="/portfolio/${item.artist_id}/item/${item.id}" data-link aria-label="Open ${item.title} details">
              <img src="${normalizeImageUrl(item.image_url)}" alt="${item.title}" loading="lazy">
            </a>
          </div>
          <div class="workspace__content-meta">
            <h4><a href="/portfolio/${item.artist_id}/item/${item.id}" data-link>${item.title}</a></h4>
            <div class="workspace__content-description">${item.description || '<p>No description added yet.</p>'}</div>
            <small>Type: ${item.availability === 'physical' ? 'Physical copy' : 'Digital art'}</small>
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
    document.getElementById('profile-website').value = profile?.website || '';
    document.getElementById('profile-instagram').value = profile?.instagram || '';
    document.getElementById('profile-twitter').value = profile?.twitter || '';
    showExistingProfileImage(normalizeImageUrl(profile?.profile_image_url || ''));

    if (profileSaveBtn) {
      profileSaveBtn.textContent = profile?.id ? 'Save Profile Changes' : 'Create Artist Profile';
    }

    renderProfilePreview(profile);
  };

  const formatMessageDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
  };

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const renderInboxMessages = (messages = []) => {
    if (!inboxList) return;

    if (!messages.length) {
      inboxList.innerHTML = '<li>No contact messages yet. Messages from your portfolio Contact page will appear here.</li>';
      return;
    }

    inboxList.innerHTML = messages
      .map((item) => {
        const sentAt = formatMessageDate(item.created_at);
        const safeName = escapeHtml(item.sender_name);
        const safeEmail = escapeHtml(item.sender_email);
        const safeMessage = escapeHtml(item.message);
        return `
          <li>
            <strong>${safeName}</strong> <span>(${safeEmail})</span>
            <p>${safeMessage}</p>
            ${sentAt ? `<small>${sentAt}</small>` : ''}
          </li>
        `;
      })
      .join('');
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
        renderInboxMessages([]);
        activatePanel('profile');
        return;
      }

      const portfolioResponse = await api.get(`/artists/${artistProfile.id}/portfolio?per_page=100`);
      renderContentItems(portfolioResponse.data || []);

      try {
        const messagesResponse = await api.get(`/artists/${artistProfile.id}/messages?per_page=100`);
        renderInboxMessages(messagesResponse.data || []);
      } catch (error) {
        renderInboxMessages([]);
      }
    } catch (error) {
      contentGrid.innerHTML = `
        <article class="workspace__content-card workspace__content-card--empty">
          <div class="workspace__content-meta">
            <h4>Unable to load content</h4>
            <p>We could not fetch your content library right now. Try again in a moment.</p>
          </div>
        </article>
      `;

      renderInboxMessages([]);
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

    window.open(`/portfolio/${artistProfile.id}/home`, '_blank', 'noopener,noreferrer');
  });

  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const artistName = document.getElementById('profile-artist-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const profileImageFile = profileImageInput?.files?.[0] || null;
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

      if (profileImageFile && artistProfile?.id) {
        const formData = new FormData();
        formData.append('file', profileImageFile);
        await api.post(`/artists/${artistProfile.id}/profile/upload`, formData);
        artistProfile = await loadArtistProfile();
      }

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
    const imageFile = document.getElementById('art-image-file')?.files?.[0] || null;
    const availability = document.getElementById('art-availability')?.value || 'digital';
    const richDescriptionHtml = richDescriptionSource?.value?.trim() || richDescriptionEditor?.innerHTML?.trim() || '';

    if (!title || !imageFile) {
      showToast('Title and uploaded image are required.', 'error');
      return;
    }

    contentSubmitBtn.disabled = true;
    contentSubmitBtn.innerHTML = '<span class="spinner"></span> Publishing...';

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadResponse = await api.post(`/artists/${artistProfile.id}/portfolio/upload`, formData);
      const finalImageUrl = uploadResponse?.data?.image_url;

      if (!finalImageUrl) {
        throw new Error('Image upload failed. Please try again.');
      }

      await api.post(`/artists/${artistProfile.id}/portfolio`, {
        title,
        image_url: finalImageUrl,
        availability,
        description: richDescriptionHtml || null,
      });

      showToast('Content published to your portfolio site.', 'success');
      contentForm.reset();
      setSelectedImageFile(null);
      if (richDescriptionEditor) richDescriptionEditor.innerHTML = '';
      if (richDescriptionSource) richDescriptionSource.value = '';
      document.getElementById('art-availability').value = 'digital';
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
