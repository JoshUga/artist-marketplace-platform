function renderLegalLayout(title, intro, sections) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="container" style="padding: var(--spacing-3xl) var(--spacing-md);">
      <div class="card card--flat" style="max-width: 900px; margin: 0 auto;">
        <div class="card__body" style="padding: var(--spacing-2xl); display: grid; gap: var(--spacing-xl);">
          <div>
            <p class="text-muted" style="text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: var(--spacing-sm);">Legal</p>
            <h1 style="margin-bottom: var(--spacing-sm);">${title}</h1>
            <p class="text-muted">${intro}</p>
          </div>
          ${sections.map(({ heading, text }) => `
            <section>
              <h2 style="margin-bottom: var(--spacing-sm);">${heading}</h2>
              <p class="text-muted">${text}</p>
            </section>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function renderPrivacyPolicyPage() {
  renderLegalLayout(
    'Privacy Policy',
    'This page explains how ArtMarket collects and uses account, portfolio, and inquiry information inside the platform.',
    [
      {
        heading: 'Information We Store',
        text: 'We store account identity details, portfolio content you publish, and inquiry activity required to operate artist storefronts and collector access.',
      },
      {
        heading: 'How We Use It',
        text: 'Data is used to authenticate users, present artist portfolios, manage buyer relationships within each artist profile, and keep the service secure.',
      },
      {
        heading: 'Sharing And Retention',
        text: 'We do not expose private account information publicly except where artists intentionally publish it in their profile. Data is retained only as long as required for platform operations and compliance.',
      },
    ]
  );
}

export function renderTermsOfUsePage() {
  renderLegalLayout(
    'Terms of Use',
    'These terms govern use of ArtMarket by artists and collectors interacting with artist-owned portfolios.',
    [
      {
        heading: 'Account Responsibilities',
        text: 'Users are responsible for maintaining account security, publishing accurate information, and using the platform in a lawful and professional manner.',
      },
      {
        heading: 'Portfolio Ownership',
        text: 'Artists retain ownership of their portfolio content and are responsible for the works, commissions, and buyer interactions associated with their storefront.',
      },
      {
        heading: 'Platform Conduct',
        text: 'Fraudulent listings, abusive behavior, copyright violations, and attempts to disrupt the service may result in account restriction or removal.',
      },
    ]
  );
}

export function renderDataRemovalPage() {
  renderLegalLayout(
    'Data Removal',
    'ArtMarket supports requests to delete account data and artist portfolio content when permitted by operational and legal requirements.',
    [
      {
        heading: 'Requesting Removal',
        text: 'To request deletion, contact support from the email address tied to your account and specify whether the request covers account identity, portfolio assets, or both.',
      },
      {
        heading: 'What Gets Removed',
        text: 'We remove or anonymize account records, published portfolio content, and associated profile details unless retention is required for security, billing, or legal obligations.',
      },
      {
        heading: 'Processing Time',
        text: 'Verified deletion requests are typically processed within a reasonable operational window after identity confirmation and internal review.',
      },
    ]
  );
}