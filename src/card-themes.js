/** Full palette per card “look” (15 presets + legacy aliases). */

export const THEME_PRESETS = {
  'noir-crimson': {
    bg0: '#050508',
    bg1: '#0c0a12',
    border: 'rgba(255, 255, 255, 0.10)',
    title: '#fafafa',
    text: 'rgba(250, 250, 250, 0.82)',
    muted: 'rgba(250, 250, 250, 0.55)',
    accent0: '#ff003c',
    accent1: '#ff4d6d',
    glow: 'rgba(255, 0, 60, 0.45)'
  },
  'noir-magma': {
    bg0: '#0a0806',
    bg1: '#140e0c',
    border: 'rgba(255, 245, 235, 0.10)',
    title: '#fff7ed',
    text: 'rgba(255, 247, 237, 0.86)',
    muted: 'rgba(255, 230, 210, 0.55)',
    accent0: '#ff4d00',
    accent1: '#ff9f66',
    glow: 'rgba(255, 77, 0, 0.42)'
  },
  'noir-rose': {
    bg0: '#0c080a',
    bg1: '#120a10',
    border: 'rgba(255, 228, 240, 0.10)',
    title: '#fff1f2',
    text: 'rgba(255, 241, 242, 0.86)',
    muted: 'rgba(253, 214, 226, 0.55)',
    accent0: '#fb7185',
    accent1: '#fda4af',
    glow: 'rgba(251, 113, 133, 0.42)'
  },
  'noir-violet': {
    bg0: '#08060c',
    bg1: '#0f0a18',
    border: 'rgba(237, 233, 254, 0.10)',
    title: '#f5f3ff',
    text: 'rgba(245, 243, 255, 0.86)',
    muted: 'rgba(216, 210, 254, 0.55)',
    accent0: '#a78bfa',
    accent1: '#c4b5fd',
    glow: 'rgba(167, 139, 250, 0.42)'
  },
  'noir-electric': {
    bg0: '#060a0c',
    bg1: '#0a1216',
    border: 'rgba(207, 250, 254, 0.10)',
    title: '#ecfeff',
    text: 'rgba(236, 254, 255, 0.86)',
    muted: 'rgba(165, 243, 252, 0.55)',
    accent0: '#22d3ee',
    accent1: '#67e8f9',
    glow: 'rgba(34, 211, 238, 0.42)'
  },
  'noir-jade': {
    bg0: '#060c0a',
    bg1: '#0a1410',
    border: 'rgba(209, 250, 229, 0.10)',
    title: '#ecfdf5',
    text: 'rgba(236, 253, 245, 0.86)',
    muted: 'rgba(167, 243, 208, 0.55)',
    accent0: '#34d399',
    accent1: '#6ee7b7',
    glow: 'rgba(52, 211, 153, 0.42)'
  },
  'noir-gold': {
    bg0: '#0c0a06',
    bg1: '#141008',
    border: 'rgba(254, 243, 199, 0.10)',
    title: '#fffbeb',
    text: 'rgba(255, 251, 235, 0.86)',
    muted: 'rgba(253, 230, 138, 0.5)',
    accent0: '#fbbf24',
    accent1: '#fcd34d',
    glow: 'rgba(251, 191, 36, 0.4)'
  },
  'noir-ice': {
    bg0: '#060a10',
    bg1: '#0a1018',
    border: 'rgba(224, 242, 254, 0.10)',
    title: '#f0f9ff',
    text: 'rgba(240, 249, 255, 0.86)',
    muted: 'rgba(186, 230, 253, 0.55)',
    accent0: '#38bdf8',
    accent1: '#7dd3fc',
    glow: 'rgba(56, 189, 248, 0.42)'
  },
  'light-paper': {
    bg0: '#fafafa',
    bg1: '#f4f4f5',
    border: 'rgba(24, 24, 27, 0.12)',
    title: '#18181b',
    text: 'rgba(24, 24, 27, 0.78)',
    muted: 'rgba(82, 82, 91, 0.65)',
    accent0: '#dc2626',
    accent1: '#f43f5e',
    glow: 'rgba(220, 38, 38, 0.32)'
  },
  'light-rose': {
    bg0: '#fff1f2',
    bg1: '#ffe4e6',
    border: 'rgba(136, 19, 55, 0.12)',
    title: '#881337',
    text: 'rgba(136, 19, 55, 0.82)',
    muted: 'rgba(157, 23, 77, 0.55)',
    accent0: '#e11d48',
    accent1: '#fb7185',
    glow: 'rgba(225, 29, 72, 0.28)'
  },
  'light-indigo': {
    bg0: '#f8fafc',
    bg1: '#eef2ff',
    border: 'rgba(49, 46, 129, 0.12)',
    title: '#1e1b4b',
    text: 'rgba(30, 27, 75, 0.78)',
    muted: 'rgba(67, 56, 202, 0.55)',
    accent0: '#4f46e5',
    accent1: '#818cf8',
    glow: 'rgba(79, 70, 229, 0.28)'
  },
  'light-teal': {
    bg0: '#f0fdfa',
    bg1: '#ccfbf1',
    border: 'rgba(15, 118, 110, 0.14)',
    title: '#134e4a',
    text: 'rgba(19, 78, 74, 0.78)',
    muted: 'rgba(13, 148, 136, 0.55)',
    accent0: '#0d9488',
    accent1: '#2dd4bf',
    glow: 'rgba(13, 148, 136, 0.28)'
  },
  'light-slate': {
    bg0: '#f8fafc',
    bg1: '#f1f5f9',
    border: 'rgba(51, 65, 85, 0.14)',
    title: '#0f172a',
    text: 'rgba(15, 23, 42, 0.78)',
    muted: 'rgba(71, 85, 105, 0.6)',
    accent0: '#475569',
    accent1: '#64748b',
    glow: 'rgba(71, 85, 105, 0.25)'
  },
  'light-ember': {
    bg0: '#fffbeb',
    bg1: '#fef3c7',
    border: 'rgba(146, 64, 14, 0.14)',
    title: '#78350f',
    text: 'rgba(120, 53, 15, 0.82)',
    muted: 'rgba(180, 83, 9, 0.55)',
    accent0: '#ea580c',
    accent1: '#fb923c',
    glow: 'rgba(234, 88, 12, 0.28)'
  },
  'light-orchid': {
    bg0: '#faf5ff',
    bg1: '#f3e8ff',
    border: 'rgba(107, 33, 168, 0.14)',
    title: '#581c87',
    text: 'rgba(88, 28, 135, 0.8)',
    muted: 'rgba(126, 34, 206, 0.55)',
    accent0: '#a855f7',
    accent1: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.28)'
  }
};

const LEGACY_THEME = {
  'noir-red': 'noir-crimson',
  light: 'light-paper'
};

export function normalizeThemeKey(raw) {
  const t = String(raw ?? 'noir-crimson').toLowerCase().trim();
  const mapped = LEGACY_THEME[t] || t;
  if (THEME_PRESETS[mapped]) return mapped;
  return 'noir-crimson';
}

export function cardThemeIsLight(theme) {
  const k = normalizeThemeKey(theme);
  return k.startsWith('light-');
}

export function themeVars(theme, accentHex) {
  const k = normalizeThemeKey(theme);
  const v = { ...THEME_PRESETS[k] };
  let h = accentHex ? String(accentHex).trim().replace(/^#/, '') : '';
  if (/^[0-9a-fA-F]{3}$/i.test(h)) {
    h = h
      .toLowerCase()
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const ac = h && /^[0-9a-fA-F]{6}$/i.test(h) ? `#${h.toLowerCase()}` : null;
  if (ac) {
    v.accent0 = ac;
    v.accent1 = mixWhiteHex(ac, 0.38);
    const rgb = hexToRgb(ac);
    if (rgb) v.glow = `rgba(${rgb.r},${rgb.g},${rgb.b},0.48)`;
  }
  return v;
}

function hexToRgb(hex) {
  const h = String(hex).replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function mixWhiteHex(hex, t) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = (c) => Math.round(c + (255 - c) * t);
  const r = mix(rgb.r);
  const g = mix(rgb.g);
  const b = mix(rgb.b);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
