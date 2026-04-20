import { cardThemeIsLight, themeVars } from './card-themes.js';
import {
  bannerContentLayout,
  compactContentLayout,
  normalizeLayoutKey,
  renderPartitionBackdrop,
  streakHeroLayout
} from './card-layouts.js';

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Singular/plural for short stat labels (e.g. "1 star" vs "6 stars"). */
function countUnit(n, singular, plural) {
  const x = Number(n);
  const v = Number.isFinite(x) ? Math.trunc(x) : 0;
  return `${v} ${v === 1 ? singular : plural}`;
}

function truncPlain(s, maxLen) {
  const t = String(s ?? '');
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function fmtRange(a, b) {
  if (!a || !b) return '—';
  return a === b ? a : `${a} — ${b}`;
}

function newSvgUid() {
  return `u${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 6)}`;
}

function fontStack() {
  return "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial";
}

function baseDefs(v, id) {
  return `
  <defs>
    <linearGradient id="bg_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${v.bg0}"/>
      <stop offset="100%" stop-color="${v.bg1}"/>
    </linearGradient>
    <linearGradient id="accent_${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${v.accent0}"/>
      <stop offset="100%" stop-color="${v.accent1}"/>
    </linearGradient>
    <radialGradient id="hot_${id}" cx="18%" cy="10%" r="60%">
      <stop offset="0%" stop-color="${v.accent0}" stop-opacity="0.32"/>
      <stop offset="55%" stop-color="${v.accent0}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${v.accent0}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bannerSide_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${v.accent0}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#2a000a" stop-opacity="1"/>
    </linearGradient>
    <filter id="softShadow_${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="glow_${id}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feColorMatrix in="b" type="matrix"
        values="
          1 0 0 0 0
          0 0.15 0 0 0
          0 0 0.2 0 0
          0 0 0 1 0" result="c"/>
      <feMerge>
        <feMergeNode in="c"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="noiseF_${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0.28 0"/>
    </filter>
    <pattern id="noise_${id}" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" filter="url(#noiseF_${id})" opacity="0.22"/>
    </pattern>
    <radialGradient id="bloom_${id}" cx="82%" cy="38%" r="58%">
      <stop offset="0%" stop-color="${v.accent1}" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="${v.accent0}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="slant_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${v.accent0}"/>
      <stop offset="55%" stop-color="#6b0f24"/>
      <stop offset="100%" stop-color="#120306"/>
    </linearGradient>
    <linearGradient id="glassTop_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
      <stop offset="35%" stop-color="rgba(255,255,255,0.03)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="streakNum_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${v.accent1}"/>
    </linearGradient>
    <filter id="panelShadow_${id}" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.35"/>
    </filter>
    <filter id="seamGlow_${id}" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;
}

function redZoneText(theme) {
  const isLight = cardThemeIsLight(theme);
  return {
    redText: isLight ? '#1c0a0c' : '#ffffff',
    redMuted: isLight ? 'rgba(28,10,12,0.65)' : 'rgba(255,255,255,0.78)'
  };
}

function glassStatPanel({ x, y, w, h, label, bodyMarkup, v, id }) {
  return `
  <g transform="translate(${x} ${y})" filter="url(#panelShadow_${id})">
    <rect x="0" y="0" width="${w}" height="${h}" rx="16" fill="rgba(255,255,255,0.05)" stroke="${v.border}"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="16" fill="url(#glassTop_${id})"/>
    <text x="20" y="28" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="900" letter-spacing="0.2em">${esc(
      label
    )}</text>
    ${bodyMarkup}
  </g>`;
}

function frame({ width, height, v, id }) {
  return `
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="18" fill="url(#bg_${id})" stroke="${v.border}"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="18" fill="url(#hot_${id})"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="18" fill="url(#noise_${id})"/>`;
}

function renderStreakCardSvg({ user, stats, theme, id, accent, layout }) {
  const v = themeVars(theme, accent);
  const { redText, redMuted } = redZoneText(theme);
  const lay = normalizeLayoutKey(layout);

  const aria = `GitHub streak statistics for ${user}`;
  const curr = stats.currentStreak ?? 0;
  const best = stats.longestStreak ?? 0;
  const total = stats.totalContributions ?? 0;
  const dateLine =
    stats.rangeStart && stats.rangeEnd ? `${stats.rangeStart} — ${stats.rangeEnd}` : '';

  const width = 520;
  const height = 248;
  const meta = streakHeroLayout(lay, width, height);
  const py0 = meta.panelY0 ?? 52;
  const py1 = meta.panelY1 ?? 132;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    aria
  )}">
  ${baseDefs(v, id)}
  ${renderPartitionBackdrop({ layout: lay, width, height, v, id, rx: 22 })}

  ${glassStatPanel({
    x: meta.panelX,
    y: py0,
    w: meta.panelW,
    h: 72,
    label: 'LONGEST',
    bodyMarkup: `<text x="20" y="54" fill="${v.title}" font-family="${fontStack()}" font-size="20" font-weight="900">${esc(
      best
    )}<tspan fill="${v.text}" font-size="13" font-weight="800"> days</tspan></text>`,
    v,
    id
  })}
  ${glassStatPanel({
    x: meta.panelX,
    y: py1,
    w: meta.panelW,
    h: 72,
    label: 'TOTAL',
    bodyMarkup: `<text x="20" y="54" fill="${v.title}" font-family="${fontStack()}" font-size="18" font-weight="900">${esc(
      total
    )}<tspan fill="${v.text}" font-size="12" font-weight="700"> contributions</tspan></text>`,
    v,
    id
  })}

  <g transform="translate(${meta.heroTx} ${meta.heroTy})">
    <text x="0" y="0" fill="${redMuted}" font-family="${fontStack()}" font-size="10" font-weight="800" letter-spacing="0.24em">CURRENT STREAK</text>
    <text x="0" y="88" fill="url(#streakNum_${id})" font-family="${fontStack()}" font-size="76" font-weight="900" filter="url(#glow_${id})">${esc(
      curr
    )}</text>
    <text x="4" y="114" fill="${redText}" font-family="${fontStack()}" font-size="13" font-weight="800" letter-spacing="0.06em" opacity="0.92">DAY STREAK</text>
  </g>

  <text x="${width / 2}" y="${height - 20}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="11" font-weight="700" letter-spacing="0.06em">
    ${esc(dateLine)}
  </text>
</svg>`;
}

function renderCompactCardSvg({ user, stats, theme, id, accent, layout }) {
  const v = themeVars(theme, accent);
  const { redText, redMuted } = redZoneText(theme);
  const lay = normalizeLayoutKey(layout);

  const aria = `GitHub streak statistics for ${user}`;
  const curr = stats.currentStreak ?? 0;
  const best = stats.longestStreak ?? 0;
  const total = stats.totalContributions ?? 0;
  const dateLine =
    stats.rangeStart && stats.rangeEnd ? `${stats.rangeStart} — ${stats.rangeEnd}` : '';

  const width = 680;
  const height = 204;
  const cc = compactContentLayout(lay, width);
  const gap = 10;
  const inner = Math.max(120, cc.innerRight - cc.tileBaseX);
  const tileW = Math.floor((inner - gap * 2) / 3);
  const rowY = cc.rowY;
  const tileH = 76;
  const baseX = cc.tileBaseX;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    aria
  )}">
  ${baseDefs(v, id)}
  ${renderPartitionBackdrop({ layout: lay, width, height, v, id, rx: 22 })}

  ${glassStatPanel({
    x: baseX,
    y: rowY,
    w: tileW,
    h: tileH,
    label: 'CURRENT',
    bodyMarkup: `<text x="20" y="56" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="26" font-weight="900" filter="url(#glow_${id})">${esc(
      curr
    )}<tspan fill="${v.text}" font-size="12" font-weight="800"> days</tspan></text>`,
    v,
    id
  })}
  ${glassStatPanel({
    x: baseX + tileW + gap,
    y: rowY,
    w: tileW,
    h: tileH,
    label: 'LONGEST',
    bodyMarkup: `<text x="20" y="56" fill="${v.title}" font-family="${fontStack()}" font-size="24" font-weight="900">${esc(
      best
    )}<tspan fill="${v.text}" font-size="12" font-weight="800"> days</tspan></text>`,
    v,
    id
  })}
  ${glassStatPanel({
    x: baseX + (tileW + gap) * 2,
    y: rowY,
    w: tileW,
    h: tileH,
    label: 'TOTAL',
    bodyMarkup: `<text x="20" y="56" fill="${v.title}" font-family="${fontStack()}" font-size="22" font-weight="900">${esc(total)}</text>`,
    v,
    id
  })}

  <g transform="translate(${cc.heroTx} 42)">
    <text x="0" y="0" fill="${redMuted}" font-family="${fontStack()}" font-size="10" font-weight="800" letter-spacing="0.2em">CURRENT STREAK</text>
    <text x="0" y="82" fill="url(#streakNum_${id})" font-family="${fontStack()}" font-size="80" font-weight="900" filter="url(#glow_${id})">${esc(
      curr
    )}</text>
    <text x="4" y="108" fill="${redText}" font-family="${fontStack()}" font-size="13" font-weight="800" letter-spacing="0.06em" opacity="0.9">DAY STREAK</text>
  </g>

  <text x="${width / 2}" y="${height - 18}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="11" font-weight="700" letter-spacing="0.06em">
    ${esc(dateLine)}
  </text>
</svg>`;
}

function renderBannerCardSvg({ user, stats, theme, id, accent, layout }) {
  const v = themeVars(theme, accent);
  const { redText, redMuted } = redZoneText(theme);
  const lay = normalizeLayoutKey(layout);

  const width = 920;
  const height = 248;
  const aria = `GitHub streak statistics for ${user}`;
  const bc = bannerContentLayout(lay, width);

  const curr = stats.currentStreak ?? 0;
  const best = stats.longestStreak ?? 0;
  const total = stats.totalContributions ?? 0;
  const dateLine =
    stats.rangeStart && stats.rangeEnd ? `${stats.rangeStart} — ${stats.rangeEnd}` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    aria
  )}">
  ${baseDefs(v, id)}
  ${renderPartitionBackdrop({ layout: lay, width, height, v, id, rx: 22 })}

  ${glassStatPanel({
    x: bc.glassX,
    y: 56,
    w: bc.glassW,
    h: 72,
    label: 'LONGEST',
    bodyMarkup: `<text x="20" y="54" fill="${v.title}" font-family="${fontStack()}" font-size="22" font-weight="900">${esc(
      best
    )}<tspan fill="${v.text}" font-size="14" font-weight="800"> days</tspan></text>`,
    v,
    id
  })}
  ${glassStatPanel({
    x: bc.glassX,
    y: 140,
    w: bc.glassW,
    h: 72,
    label: 'TOTAL',
    bodyMarkup: `<text x="20" y="54" fill="${v.title}" font-family="${fontStack()}" font-size="20" font-weight="900">${esc(
      total
    )}<tspan fill="${v.text}" font-size="13" font-weight="700"> contributions</tspan></text>`,
    v,
    id
  })}

  <g transform="translate(${bc.heroTx} 44)">
    <text x="0" y="0" fill="${redMuted}" font-family="${fontStack()}" font-size="11" font-weight="800" letter-spacing="0.28em">CURRENT STREAK</text>
    <text x="0" y="100" fill="url(#streakNum_${id})" font-family="${fontStack()}" font-size="96" font-weight="900" filter="url(#glow_${id})">${esc(
      curr
    )}</text>
    <text x="4" y="132" fill="${redText}" font-family="${fontStack()}" font-size="15" font-weight="800" letter-spacing="0.06em" opacity="0.92">DAY STREAK</text>
  </g>

  <text x="${width / 2}" y="${height - 20}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="11" font-weight="700" letter-spacing="0.06em">
    ${esc(dateLine)}
  </text>
</svg>`;
}

const LANG_COLORS_NOIR = [
  '#ff003c',
  '#ff2d55',
  '#ff4d6d',
  '#e63950',
  '#be123c',
  '#9f1239',
  '#fb7185',
  '#7f1d1d'
];

const LANG_COLORS_LIGHT = [
  '#b91c1c',
  '#dc2626',
  '#e11d48',
  '#be123c',
  '#9f1239',
  '#f43f5e',
  '#991b1b',
  '#881337'
];

function langColor(theme, index) {
  const pal = cardThemeIsLight(theme) ? LANG_COLORS_LIGHT : LANG_COLORS_NOIR;
  return pal[index % pal.length];
}

function renderLanguagesCardSvg({ user, langStats, theme, id, accent }) {
  const v = themeVars(theme, accent);
  const width = 560;
  const padX = 36;
  const aria = `Most used languages for ${user}`;

  const items = langStats?.items ?? [];
  const totalBytes = langStats?.totalBytes ?? 0;

  const cols = 2;
  const colGap = 32;
  const colW = (width - padX * 2 - colGap) / 2;
  const rowH = 40;
  const nRows = items.length === 0 ? 0 : Math.ceil(items.length / cols);
  const eyebrowY = 28;
  const titleBaseline = 58;
  const accentY = 20;
  const accentH = 50;
  const barY = 80;
  const barH = 20;
  const barX = padX;
  const barW = width - padX * 2;
  const gapBeforeLegend = 26;
  const legendY0 = barY + barH + gapBeforeLegend;
  const footerBand = 36;
  const height = Math.max(240, legendY0 + Math.max(1, nRows) * rowH + footerBand);

  let segments = '';
  if (totalBytes > 0 && items.length > 0) {
    let x = barX;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const isLast = i === items.length - 1;
      let segW = isLast
        ? barW - (x - barX)
        : Math.max(it.ratio > 0 ? 1 : 0, Math.floor(it.ratio * barW));
      if (segW < 0) segW = 0;
      const fill = langColor(theme, i);
      if (segW > 0) {
        segments += `<rect x="${x}" y="${barY}" width="${segW}" height="${barH}" fill="${fill}"/>`;
      }
      x += segW;
    }
  }

  const maxNameChars = Math.max(10, Math.min(22, Math.floor((colW - 96) / 8)));

  const legendRows = [];
  items.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lx = padX + col * (colW + colGap);
    const ly = legendY0 + row * rowH;
    const fill = langColor(theme, i);
    const pct = it.pct.toFixed(2);
    const rawName = String(it.name);
    const label =
      rawName.length <= maxNameChars ? rawName : `${rawName.slice(0, Math.max(1, maxNameChars - 1))}…`;
    legendRows.push(`
    <g transform="translate(${lx} ${ly})">
      <circle cx="8" cy="${rowH / 2}" r="6" fill="${fill}" opacity="0.95"/>
      <text x="22" y="${rowH / 2 + 5}" fill="${v.title}" font-family="${fontStack()}" font-size="14" font-weight="800">${esc(
      label
    )}</text>
      <text x="${colW - 4}" y="${rowH / 2 + 5}" text-anchor="end" fill="${v.muted}" font-family="${fontStack()}" font-size="13" font-weight="700" letter-spacing="0.02em">${esc(
      pct
    )}%</text>
    </g>`);
  });

  const reposNote =
    totalBytes > 0
      ? `Based on ~${langStats?.reposScanned ?? 0} public repos`
      : '';
  const staleNote = langStats?.stale ? ' · Cached (GitHub rate limit)' : '';
  const footerNote = `${reposNote}${staleNote}`.trim();

  const emptyMsg =
    totalBytes === 0
      ? `<text x="${width / 2}" y="${barY + barH / 2 + 6}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="13" font-weight="700">No public language data (empty repos or API limit).</text>`
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(aria)}">
  ${baseDefs(v, id)}
  <defs>
    <clipPath id="langBarClip_${id}">
      <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${Math.floor(barH / 2)}" ry="${Math.floor(barH / 2)}"/>
    </clipPath>
    <linearGradient id="langTrack_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.03)"/>
    </linearGradient>
    <filter id="langBarShadow_${id}" x="-5%" y="-40%" width="110%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  ${frame({ width, height, v, id })}

  <rect x="${padX}" y="${accentY}" width="4" height="${accentH}" rx="2" fill="url(#accent_${id})" opacity="0.95"/>

  <text x="${padX + 14}" y="${eyebrowY}" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="900" letter-spacing="0.2em">LANGUAGES</text>
  <text x="${padX + 14}" y="${titleBaseline}" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="19" font-weight="900">Most Used Languages</text>

  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${Math.floor(barH / 2)}" fill="url(#langTrack_${id})" stroke="${v.border}"/>
  <g clip-path="url(#langBarClip_${id})" filter="url(#langBarShadow_${id})">
    ${segments}
  </g>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${Math.floor(barH / 2)}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>

  ${emptyMsg}
  ${legendRows.join('')}

  <text x="${width / 2}" y="${height - 14}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="700" letter-spacing="0.04em">
    ${footerNote ? esc(footerNote) : ''}
  </text>
</svg>`;
}

function wrapPlainLines(text, maxLen, maxLines) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxLen) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > maxLen ? `${w.slice(0, maxLen - 1)}…` : w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  while (lines.length < maxLines) lines.push('');
  return lines.slice(0, maxLines);
}

function statChip({ x, y, w, label, value, v, id }) {
  return `
  <g transform="translate(${x} ${y})" filter="url(#panelShadow_${id})">
    <rect x="0" y="0" width="${w}" height="64" rx="14" fill="rgba(255,255,255,0.05)" stroke="${v.border}"/>
    <rect x="0" y="0" width="${w}" height="64" rx="14" fill="url(#glassTop_${id})"/>
    <text x="14" y="22" fill="${v.muted}" font-family="${fontStack()}" font-size="9" font-weight="800" letter-spacing="0.16em">${esc(
      label
    )}</text>
    <text x="14" y="50" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="22" font-weight="900">${esc(
      String(value)
    )}</text>
  </g>`;
}

function renderProfileCardSvg({ user, profile, theme, id, accent }) {
  const v = themeVars(theme, accent);
  const width = 580;
  const pad = 32;
  const p = profile ?? {};
  const bioLines = wrapPlainLines(p.bio || '', 52, 3);
  const lineStart = 168;
  const lineGap = 22;
  const bioCount = bioLines.filter((l) => l).length;
  const chipY = lineStart + bioCount * lineGap + 10;
  const height = Math.max(300, chipY + 64 + 48);

  const meta = [
    p.company ? `Company · ${p.company}` : '',
    p.location ? `Location · ${p.location}` : '',
    p.blog ? `Web · ${p.blog}` : '',
    p.twitter ? `@${p.twitter}` : ''
  ]
    .filter(Boolean)
    .slice(0, 2);
  const metaY = height - 28;
  const metaText = meta.join('   ·   ') || `Joined ${p.createdAt || '—'}`;

  let bioSvg = '';
  bioLines.forEach((line, i) => {
    if (!line) return;
    bioSvg += `<text x="${pad}" y="${lineStart + i * lineGap}" fill="${v.text}" font-family="${fontStack()}" font-size="13" font-weight="600">${esc(
      line
    )}</text>`;
  });

  const chipW = Math.floor((width - pad * 2 - 16) / 3);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    `GitHub profile for ${user}`
  )}">
  ${baseDefs(v, id)}
  ${frame({ width, height, v, id })}
  <rect x="${pad}" y="20" width="4" height="46" rx="2" fill="url(#accent_${id})" opacity="0.95"/>
  <text x="${pad + 14}" y="38" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="900" letter-spacing="0.2em">PROFILE</text>
  <text x="${pad + 14}" y="72" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="22" font-weight="900">${esc(p.name || user)}</text>
  <text x="${pad + 14}" y="96" fill="${v.muted}" font-family="${fontStack()}" font-size="13" font-weight="700">@${esc(p.login || user)}</text>
  ${bioSvg}
  ${statChip({ x: pad, y: chipY, w: chipW, label: 'FOLLOWERS', value: p.followers ?? 0, v, id })}
  ${statChip({ x: pad + chipW + 8, y: chipY, w: chipW, label: 'FOLLOWING', value: p.following ?? 0, v, id })}
  ${statChip({ x: pad + (chipW + 8) * 2, y: chipY, w: chipW, label: 'REPOS', value: p.publicRepos ?? 0, v, id })}
  <text x="${pad}" y="${metaY}" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="700" letter-spacing="0.04em">${esc(
    metaText
  )}</text>
  <text x="${width - pad}" y="${metaY}" text-anchor="end" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="700">${esc(
    p.stale ? 'Cached' : ''
  )}</text>
</svg>`;
}

function renderStarsCardSvg({ user, repoSummary, theme, id, accent }) {
  const v = themeVars(theme, accent);
  const width = 520;
  const height = 220;
  const pad = 32;
  const r = repoSummary ?? {};
  const stars = r.totalStars ?? 0;
  const forks = r.totalForks ?? 0;
  const listed = r.reposListed ?? 0;
  const footer = `${listed} public repos scanned in this card${r.stale ? ' · cached' : ''}`;

  const bigW = Math.floor((width - pad * 2 - 12) / 2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    `GitHub stars and forks for ${user}`
  )}">
  ${baseDefs(v, id)}
  ${frame({ width, height, v, id })}
  <rect x="${pad}" y="20" width="4" height="44" rx="2" fill="url(#accent_${id})" opacity="0.95"/>
  <text x="${pad + 14}" y="38" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="900" letter-spacing="0.2em">REPOS</text>
  <text x="${pad + 14}" y="68" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="20" font-weight="900">Stars &amp; forks</text>
  <g transform="translate(${pad} 102)">
    <rect x="0" y="0" width="${bigW}" height="72" rx="16" fill="rgba(255,255,255,0.05)" stroke="${v.border}"/>
    <rect x="0" y="0" width="${bigW}" height="72" rx="16" fill="url(#glassTop_${id})"/>
    <text x="18" y="28" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="800" letter-spacing="0.18em">TOTAL STARS</text>
    <text x="18" y="58" fill="${v.title}" font-family="${fontStack()}" font-size="28" font-weight="900">${esc(String(stars))}</text>
  </g>
  <g transform="translate(${pad + bigW + 12} 102)">
    <rect x="0" y="0" width="${bigW}" height="72" rx="16" fill="rgba(255,255,255,0.05)" stroke="${v.border}"/>
    <rect x="0" y="0" width="${bigW}" height="72" rx="16" fill="url(#glassTop_${id})"/>
    <text x="18" y="28" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="800" letter-spacing="0.18em">TOTAL FORKS</text>
    <text x="18" y="58" fill="${v.title}" font-family="${fontStack()}" font-size="28" font-weight="900">${esc(String(forks))}</text>
  </g>
  <text x="${width / 2}" y="${height - 18}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="700">${esc(
    footer
  )}</text>
</svg>`;
}

function renderTopReposCardSvg({ user, repoSummary, theme, id, accent }) {
  const v = themeVars(theme, accent);
  const width = 580;
  const pad = 40;
  const contentX = pad + 6;
  const rowH = 48;
  const list = repoSummary?.topRepos ?? [];
  const listTop = 112;
  /** Absolute SVG x; both stat columns use text-anchor="end" so edges line up. */
  const forksColRight = width - pad;
  const starsColRight = forksColRight - 86;
  const nameMaxChars = 28;
  const descMaxChars = 48;
  const height = Math.max(248, listTop + Math.max(1, list.length) * rowH + 40);
  const staleNote = repoSummary?.stale ? ' · Cached' : '';

  const rows = list.map((it, i) => {
    const rowTop = listTop + i * rowH;
    const titleBase = rowTop + 18;
    const desc = it.description ? truncPlain(it.description, descMaxChars) : '';
    const name = truncPlain(it.name, nameMaxChars);
    const starLabel = countUnit(it.stars, 'star', 'stars');
    const forkLabel = countUnit(it.forks, 'fork', 'forks');
    return `
    <g>
      <text x="${contentX}" y="${titleBase}" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="14" font-weight="900">${esc(name)}</text>
      <text x="${starsColRight}" y="${titleBase}" text-anchor="end" fill="${v.muted}" font-family="${fontStack()}" font-size="12" font-weight="700">${esc(starLabel)}</text>
      <text x="${forksColRight}" y="${titleBase}" text-anchor="end" fill="${v.muted}" font-family="${fontStack()}" font-size="12" font-weight="700">${esc(forkLabel)}</text>
      ${
        desc
          ? `<text x="${contentX}" y="${titleBase + 20}" fill="${v.muted}" font-family="${fontStack()}" font-size="11" font-weight="600">${esc(desc)}</text>`
          : ''
      }
    </g>`;
  });

  const empty =
    list.length === 0
      ? `<text x="${width / 2}" y="${listTop + 28}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="13" font-weight="700">No public repos in scan range.</text>`
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    `Top GitHub repos for ${user}`
  )}">
  ${baseDefs(v, id)}
  ${frame({ width, height, v, id })}
  <rect x="${pad}" y="26" width="4" height="50" rx="2" fill="url(#accent_${id})" opacity="0.95"/>
  <text x="${pad + 14}" y="46" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="900" letter-spacing="0.2em">TOP REPOS</text>
  <text x="${pad + 14}" y="82" fill="url(#accent_${id})" font-family="${fontStack()}" font-size="19" font-weight="900">Most starred</text>
  ${rows.join('')}
  ${empty}
  <text x="${width / 2}" y="${height - 20}" text-anchor="middle" fill="${v.muted}" font-family="${fontStack()}" font-size="10" font-weight="700">${esc(
    `Non-fork repos · ${repoSummary?.reposListed ?? 0} scanned${staleNote}`
  )}</text>
</svg>`;
}

function normalizeCardName(card) {
  const c = String(card ?? 'streak').trim().toLowerCase();
  if (c === 'language' || c === 'langs' || c === 'lang') return 'languages';
  if (c === 'user' || c === 'profile') return 'profile';
  if (c === 'stars' || c === 'star' || c === 'repo-stats') return 'stars';
  if (c === 'top-repos' || c === 'toprepos' || c === 'repos') return 'top-repos';
  if (c === 'streak' || c === 'compact' || c === 'banner' || c === 'languages') return c;
  return 'streak';
}

export function renderCardSvg({
  user,
  stats,
  langStats,
  profile,
  repoSummary,
  theme,
  card,
  accent,
  layout
}) {
  const id = newSvgUid();
  const c = normalizeCardName(card);
  const lay = normalizeLayoutKey(layout);
  if (c === 'languages') return renderLanguagesCardSvg({ user, langStats, theme, id, accent });
  if (c === 'profile') return renderProfileCardSvg({ user, profile, theme, id, accent });
  if (c === 'stars') return renderStarsCardSvg({ user, repoSummary, theme, id, accent });
  if (c === 'top-repos') return renderTopReposCardSvg({ user, repoSummary, theme, id, accent });
  if (c === 'compact') return renderCompactCardSvg({ user, stats, theme, id, accent, layout: lay });
  if (c === 'banner') return renderBannerCardSvg({ user, stats, theme, id, accent, layout: lay });
  return renderStreakCardSvg({ user, stats, theme, id, accent, layout: lay });
}
