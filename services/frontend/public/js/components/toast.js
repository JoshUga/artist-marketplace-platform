/**
 * Toast notification system.
 */
let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureContainer();

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in-right`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.info}"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close"><i class="bi bi-x"></i></button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.add('toast-exit');
  setTimeout(() => toast.remove(), 300);
}
