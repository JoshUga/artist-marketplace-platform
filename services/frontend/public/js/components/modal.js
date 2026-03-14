/**
 * Reusable modal dialog component.
 */
export function createModal(title, content, options = {}) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal animate-scale-in" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" aria-label="Close modal"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body">${typeof content === 'string' ? content : ''}</div>
      ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
    </div>
  `;

  if (typeof content !== 'string') {
    modal.querySelector('.modal-body').appendChild(content);
  }

  // Close handlers
  const close = () => {
    modal.classList.add('modal-exit');
    setTimeout(() => modal.remove(), 300);
    if (options.onClose) options.onClose();
  };

  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handler);
    }
  });

  // Focus trap
  const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]');
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  document.body.appendChild(modal);
  return { modal, close };
}
