/**
 * Centralized template registry and normalization.
 */

const TEMPLATE_DEFINITIONS = [
  {
    key: 'editorial',
    label: 'Editorial Hero',
    blurb: 'Magazine-style hero narrative with dramatic lead image and layered storytelling.',
  },
  {
    key: 'split',
    label: 'Split Story',
    blurb: 'Two-column studio system with anchored artist profile and scrolling content rail.',
  },
  {
    key: 'minimal-grid',
    label: 'Minimal Grid',
    blurb: 'Quiet white-space gallery with compact cards and strict visual rhythm.',
  },
  {
    key: 'atom',
    label: 'Atom 1.0',
    blurb: 'Bold single-page landing flow inspired directly by atom-1.0.0 structure.',
  },
];

const TEMPLATE_KEYS = TEMPLATE_DEFINITIONS.map((item) => item.key);

export function getTemplateOptions() {
  return TEMPLATE_DEFINITIONS.slice();
}

export function normalizeTemplateKey(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return TEMPLATE_KEYS.includes(normalized) ? normalized : 'editorial';
}

export function getTemplateByKey(value) {
  const key = normalizeTemplateKey(value);
  return TEMPLATE_DEFINITIONS.find((item) => item.key === key) || TEMPLATE_DEFINITIONS[0];
}

export function getTemplateLabel(value) {
  return getTemplateByKey(value).label;
}

export function deriveTemplateFromProfile(profile) {
  const candidate = profile?.portfolio_template
    || profile?.portfolio_template_key
    || profile?.template
    || profile?.portfolio_theme?.template
    || profile?.portfolioTheme?.template;
  return normalizeTemplateKey(candidate);
}
