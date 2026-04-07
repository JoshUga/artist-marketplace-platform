"""Portfolio template and theme normalization service."""
import re

DEFAULT_PORTFOLIO_TEMPLATE = "editorial"
DEFAULT_PORTFOLIO_THEME_NAME = "Warm Studio"
DEFAULT_PORTFOLIO_THEME = {
    "primary": "#c47a49",
    "secondary": "#a45674",
    "accent": "#e0be86",
    "background": "#0d0c12",
    "surface": "#181722",
    "text": "#ececf2",
    "muted_text": "#a8abbb",
    "font_family": "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}
ALLOWED_TEMPLATES = {"editorial", "split", "minimal-grid", "atom"}
ALLOWED_FONT_FAMILIES = {
    "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "'Playfair Display', Georgia, serif",
    "'Space Grotesk', 'Trebuchet MS', sans-serif",
    "'Cormorant Garamond', Georgia, serif",
    "'Syne', 'Space Grotesk', sans-serif",
}
HEX_COLOR_RE = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


def normalize_template_key(value: str | None) -> str:
    normalized = (value or DEFAULT_PORTFOLIO_TEMPLATE).strip().lower()
    if normalized not in ALLOWED_TEMPLATES:
        return DEFAULT_PORTFOLIO_TEMPLATE
    return normalized


def normalize_theme_name(value: str | None) -> str:
    if not value:
        return DEFAULT_PORTFOLIO_THEME_NAME
    cleaned = value.strip()
    return cleaned[:120] if cleaned else DEFAULT_PORTFOLIO_THEME_NAME


def normalize_theme_config(value: dict | None) -> dict[str, str]:
    merged = dict(DEFAULT_PORTFOLIO_THEME)
    if not isinstance(value, dict):
        return merged

    color_keys = {"primary", "secondary", "accent", "background", "surface", "text", "muted_text"}
    for key in color_keys:
        candidate = value.get(key)
        if isinstance(candidate, str) and HEX_COLOR_RE.fullmatch(candidate.strip()):
            merged[key] = candidate.strip()

    font_candidate = value.get("font_family")
    if isinstance(font_candidate, str) and font_candidate.strip() in ALLOWED_FONT_FAMILIES:
        merged["font_family"] = font_candidate.strip()

    return merged
