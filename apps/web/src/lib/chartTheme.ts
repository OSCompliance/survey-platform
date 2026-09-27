// Chart theme derived from the dataviz skill's validated default palette
// (references/palette.md). Categorical hues are used in the documented fixed
// order (slot 1 blue, slot 2 orange, ...) rather than picked arbitrarily, so
// adjacent-series pairs stay colorblind-safe without needing brand-specific
// re-validation. See references/color-formula.md for the underlying rule.

export const SERIES = {
  1: '#2a78d6', // blue
  2: '#eb6834', // orange
  3: '#1baf7a', // aqua
  4: '#eda100', // yellow
  5: '#e87ba4', // magenta
  6: '#008300', // green
  7: '#4a3aa7', // violet
  8: '#e34948', // red
} as const;

export const CHART_CHROME = {
  gridline: '#e1e0d9',
  axis: '#c3c2b7',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  textMuted: '#898781',
  surface: '#fcfcfb',
};

export const FONT_FAMILY = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";

export const baseScaleOptions = {
  grid: { color: CHART_CHROME.gridline, drawTicks: false },
  border: { color: CHART_CHROME.axis },
  ticks: { color: CHART_CHROME.textMuted, font: { family: FONT_FAMILY, size: 11 } },
};

export const baseTooltipOptions = {
  backgroundColor: '#ffffff',
  titleColor: CHART_CHROME.textPrimary,
  bodyColor: CHART_CHROME.textSecondary,
  borderColor: '#e5e4de',
  borderWidth: 1,
  padding: 10,
  titleFont: { family: FONT_FAMILY, weight: 600 as const },
  bodyFont: { family: FONT_FAMILY },
  boxPadding: 4,
};

export const baseLegendOptions = {
  labels: {
    color: CHART_CHROME.textSecondary,
    font: { family: FONT_FAMILY, size: 12 },
    boxWidth: 10,
    boxHeight: 10,
    usePointStyle: true,
    pointStyle: 'circle' as const,
  },
};
