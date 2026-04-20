/**
 * Structural “looks” for streak-style cards (partition / background geometry).
 * L01 = curved split (red on the right). Layout ids 01–11 and 13–15; 12 is unused and maps to 01.
 */

export const LAYOUT_IDS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '13',
  '14',
  '15'
];

const ALIAS = {
  circular: '01',
  mirror: '02',
  wedge: '03',
  'top-band': '04',
  'bottom-band': '05',
  column: '06',
  corner: '07',
  wash: '08',
  ribbon: '09',
  sash: '09',
  rail: '10',
  blob: '11',
  hairline: '13',
  frame: '14',
  step: '15',
  l01: '01',
  l02: '02',
  l03: '03',
  l04: '04',
  l05: '05',
  l06: '06',
  l07: '07',
  l08: '08',
  l09: '09',
  l10: '10',
  l11: '11',
  l13: '13',
  l14: '14',
  l15: '15'
};

export function normalizeLayoutKey(raw) {
  let s = String(raw ?? '01').trim().toLowerCase().replace(/^l/, '');
  if (!s) s = '01';
  if (ALIAS[s]) s = ALIAS[s];
  if (s.length === 1) s = `0${s}`;
  if (s === '12') return '01';
  if (LAYOUT_IDS.includes(s)) return s;
  return '01';
}

export function splitGeometry(width, height, split = 0.467) {
  const x0 = Math.round(width * split);
  const w = width;
  const h = height;
  const slantPath = `M ${x0} 0 C ${x0 + Math.round(0.098 * w)} ${Math.round(0.29 * h)} ${x0 + Math.round(0.076 * w)} ${Math.round(0.71 * h)} ${x0 - Math.round(0.022 * w)} ${h} L ${w} ${h} L ${w} 0 Z`;
  const sidePath = `M ${x0} 0 C ${x0 + Math.round(0.085 * w)} ${Math.round(0.315 * h)} ${x0 + Math.round(0.063 * w)} ${Math.round(0.685 * h)} ${x0 - Math.round(0.028 * w)} ${h} L ${w} ${h} L ${w} 0 Z`;
  const seamPath = `M ${x0 - 2} 0 C ${x0 + Math.round(0.089 * w)} ${Math.round(0.31 * h)} ${x0 + Math.round(0.067 * w)} ${Math.round(0.68 * h)} ${x0 - Math.round(0.03 * w)} ${h}`;
  return { x0, slantPath, sidePath, seamPath };
}

function clipOpen(id, width, height, rx) {
  return `<clipPath id="clipCard_${id}"><rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}"/></clipPath>
  <g clip-path="url(#clipCard_${id})">`;
}

function clipClose(id, width, height, rx, noiseOpacity = 0.35) {
  return `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="url(#noise_${id})" opacity="${noiseOpacity}"/></g>`;
}

function curvedRightRed({ width, height, v, id, rx, split }) {
  const { slantPath, sidePath, seamPath } = splitGeometry(width, height, split);
  return `${clipOpen(id, width, height, rx)}
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bloom_${id})" opacity="0.85"/>
    <path d="${slantPath}" fill="url(#slant_${id})" filter="url(#seamGlow_${id})" opacity="0.92"/>
    <path d="${sidePath}" fill="url(#bannerSide_${id})" opacity="0.55"/>
    <path d="${seamPath}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
    ${clipClose(id, width, height, rx)}`;
}

function mirroredCurvedRed({ width, height, v, id, rx, split }) {
  const { slantPath, sidePath, seamPath } = splitGeometry(width, height, split);
  return `${clipOpen(id, width, height, rx)}
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bloom_${id})" opacity="0.55"/>
    <g transform="translate(${width} 0) scale(-1 1)">
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bloom_${id})" opacity="0.35"/>
      <path d="${slantPath}" fill="url(#slant_${id})" filter="url(#seamGlow_${id})" opacity="0.92"/>
      <path d="${sidePath}" fill="url(#bannerSide_${id})" opacity="0.55"/>
      <path d="${seamPath}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
    </g>
    ${clipClose(id, width, height, rx)}`;
}

/** Partition metadata for placing glass panels vs hero (streak / banner family). */
export function streakHeroLayout(layout, width, height) {
  const L = normalizeLayoutKey(layout);
  const split = 0.467;
  const x0 = Math.round(width * split);
  const xDarkStart = width - x0;

  if (L === '02') {
    return {
      panelX: Math.round(xDarkStart + 20),
      panelW: Math.max(140, width - Math.round(xDarkStart + 48)),
      heroTx: 36,
      heroTy: 44,
      heroAlign: 'left'
    };
  }
  if (L === '06') {
    const xs = Math.round(width * 0.52);
    return {
      panelX: 28,
      panelW: Math.max(140, xs - 52),
      heroTx: Math.round(xs + 24),
      heroTy: 44,
      heroAlign: 'left'
    };
  }
  if (L === '13') {
    const xs = Math.round(width * 0.5);
    return {
      panelX: 28,
      panelW: Math.max(140, xs - 56),
      heroTx: Math.round(width * 0.54),
      heroTy: 42,
      heroAlign: 'left'
    };
  }
  if (L === '03') {
    return {
      panelX: 28,
      panelW: Math.max(155, x0 - 48),
      heroTx: Math.round(width * 0.44),
      heroTy: 36,
      heroAlign: 'left'
    };
  }
  if (L === '07') {
    return {
      panelX: 28,
      panelW: Math.max(150, Math.round(width * 0.48)),
      heroTx: Math.round(width * 0.42),
      heroTy: 44,
      heroAlign: 'left'
    };
  }
  if (L === '10') {
    return {
      panelX: 28,
      panelW: Math.max(140, Math.round(width * 0.42)),
      heroTx: Math.round(width * 0.48),
      heroTy: 44,
      heroAlign: 'left'
    };
  }
  if (L === '09') {
    return {
      panelX: 28,
      panelW: Math.max(150, Math.round(width * 0.4)),
      heroTx: Math.round(width * 0.5),
      heroTy: 40,
      heroAlign: 'left'
    };
  }
  if (L === '04') {
    return {
      panelX: 28,
      panelW: Math.max(160, x0 - 52),
      heroTx: Math.round(width * 0.52),
      heroTy: 52,
      heroAlign: 'left'
    };
  }
  if (L === '05') {
    return {
      panelX: 28,
      panelW: Math.max(160, x0 - 52),
      heroTx: Math.round(width * 0.48),
      heroTy: 40,
      heroAlign: 'left',
      panelY0: 48,
      panelY1: 128
    };
  }
  return {
    panelX: 28,
    panelW: Math.max(160, x0 - 52),
    heroTx: Math.round(width * 0.48),
    heroTy: 44,
    heroAlign: 'left'
  };
}

/** Compact card: tile strip + hero X (backdrop uses `layout` separately). */
export function compactContentLayout(layout, width) {
  const L = normalizeLayoutKey(layout);
  const rowY = 52;
  const split = 0.5;
  const xMid = Math.round(width * split);

  if (L === '02') {
    const redW = Math.round(width * 0.467);
    return {
      tileBaseX: redW + 18,
      heroTx: 32,
      rowY,
      innerRight: width - 20
    };
  }
  if (L === '06') {
    const xEdge = Math.round(width * 0.52);
    return { tileBaseX: 24, heroTx: Math.round(width * 0.56), rowY, innerRight: xEdge - 16 };
  }
  if (L === '13') {
    const xEdge = Math.round(width * 0.5);
    return { tileBaseX: 24, heroTx: Math.round(width * 0.53), rowY, innerRight: xEdge - 20 };
  }
  if (L === '10') {
    return { tileBaseX: 28, heroTx: Math.round(width * 0.5), rowY, innerRight: xMid - 12 };
  }
  return { tileBaseX: 24, heroTx: Math.round(width * 0.54), rowY, innerRight: xMid - 40 };
}

export function bannerContentLayout(layout, width) {
  const L = normalizeLayoutKey(layout);
  if (L === '02') {
    const redW = Math.round(width * 0.467);
    return { glassX: redW + 24, glassW: 288, heroTx: 44 };
  }
  if (L === '06') {
    const xEdge = Math.round(width * 0.52);
    return { glassX: 36, glassW: Math.min(300, xEdge - 56), heroTx: xEdge + 20 };
  }
  if (L === '13') {
    const xEdge = Math.round(width * 0.5);
    return { glassX: 36, glassW: Math.min(280, xEdge - 48), heroTx: Math.round(width * 0.52) };
  }
  if (L === '10') {
    return { glassX: 36, glassW: 268, heroTx: Math.round(width * 0.48) };
  }
  return { glassX: 40, glassW: 288, heroTx: 560 };
}

export function renderPartitionBackdrop({ layout, width, height, v, id, rx = 22 }) {
  const L = normalizeLayoutKey(layout);
  const w = width;
  const h = height;
  const x0 = Math.round(w * 0.467);
  const x06 = Math.round(w * 0.52);

  switch (L) {
    case '01':
      return curvedRightRed({ width, height, v, id, rx, split: 0.467 });
    case '02':
      return mirroredCurvedRed({ width, height, v, id, rx, split: 0.467 });
    case '03': {
      // Sharp diagonal wedge: accent below a line from upper-left → lower-right (not a corner triangle).
      const yTop = Math.round(h * 0.08);
      const yBot = Math.round(h * 0.9);
      const path = `M 0 ${yTop} L ${w} ${yBot} L ${w} ${h} L 0 ${h} Z`;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#bloom_${id})" opacity="0.4"/>
        <path d="${path}" fill="url(#slant_${id})" opacity="0.92"/>
        <path d="${path}" fill="url(#bannerSide_${id})" opacity="0.38"/>
        <path d="M 0 ${yTop} L ${w} ${yBot}" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
        ${clipClose(id, w, h, rx)}`;
    }
    case '04': {
      const bh = Math.round(h * 0.34);
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${bh}" fill="url(#slant_${id})" opacity="0.88"/>
        <rect x="0" y="0" width="${w}" height="${bh}" fill="url(#bannerSide_${id})" opacity="0.35"/>
        ${clipClose(id, w, h, rx, 0.32)}`;
    }
    case '05': {
      // Thin “toe kick” band only — stays below stat panels + footer text (no overlap with TOTAL).
      const bandH = Math.max(28, Math.round(h * 0.14));
      const y0 = h - bandH - 12;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#bloom_${id})" opacity="0.5"/>
        <rect x="0" y="${y0}" width="${w}" height="${bandH}" fill="url(#slant_${id})" opacity="0.88"/>
        <rect x="0" y="${y0}" width="${w}" height="${bandH}" fill="url(#bannerSide_${id})" opacity="0.42"/>
        <line x1="0" y1="${y0}" x2="${w}" y2="${y0}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
        ${clipClose(id, w, h, rx)}`;
    }
    case '06':
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="${x06}" y="0" width="${w - x06}" height="${h}" fill="url(#slant_${id})" opacity="0.92"/>
        <rect x="${x06}" y="0" width="${w - x06}" height="${h}" fill="url(#bannerSide_${id})" opacity="0.45"/>
        <line x1="${x06}" y1="0" x2="${x06}" y2="${h}" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
        ${clipClose(id, w, h, rx)}`;
    case '07': {
      // Curved ribbon along the right edge (distinct from diagonal wedge L03).
      const strip = Math.max(22, Math.round(w * 0.065));
      const path = `M ${w - strip} 0 Q ${Math.round(w - strip * 2.2)} ${Math.round(h * 0.5)} ${w - strip} ${h} L ${w} ${h} L ${w} 0 Z`;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#bloom_${id})" opacity="0.55"/>
        <path d="${path}" fill="url(#slant_${id})" filter="url(#seamGlow_${id})" opacity="0.88"/>
        <path d="${path}" fill="url(#bannerSide_${id})" opacity="0.42"/>
        <path d="${path}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        ${clipClose(id, w, h, rx)}`;
    }
    case '08':
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#slant_${id})" opacity="0.12"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#hot_${id})" opacity="0.45"/>
        ${clipClose(id, w, h, rx, 0.4)}`;
    case '09': {
      const band = `M -40 ${Math.round(h * 0.72)} L ${Math.round(w * 0.92)} -20 L ${w + 30} ${Math.round(h * 0.08)} L ${Math.round(w * 0.35)} ${h + 40} Z`;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <path d="${band}" fill="url(#slant_${id})" opacity="0.55"/>
        <path d="${band}" fill="url(#bannerSide_${id})" opacity="0.28"/>
        ${clipClose(id, w, h, rx)}`;
    }
    case '10':
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="14" height="${h}" fill="url(#accent_${id})" opacity="0.85"/>
        <rect x="18" y="0" width="${w - 18}" height="${h}" fill="url(#bloom_${id})" opacity="0.35"/>
        ${clipClose(id, w, h, rx)}`;
    case '11': {
      const path = `M 0 ${h} L 0 ${Math.round(h * 0.42)} Q ${Math.round(w * 0.22)} ${Math.round(h * 0.55)} ${Math.round(w * 0.48)} ${h} Z`;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <path d="${path}" fill="url(#slant_${id})" filter="url(#seamGlow_${id})" opacity="0.75"/>
        <path d="${path}" fill="url(#bannerSide_${id})" opacity="0.4"/>
        ${clipClose(id, w, h, rx)}`;
    }
    case '13': {
      // “Spotlight + guides” — not a second solid column (L06). Soft pool + dashed seam + accent ticks.
      const xGuide = Math.round(w * 0.48);
      const cx = Math.round(w * 0.72);
      const cy = Math.round(h * 0.46);
      const rxE = Math.round(w * 0.26);
      const ryE = Math.round(h * 0.38);
      let ticks = '';
      for (let ty = 24; ty < h - 28; ty += 22) {
        ticks += `<line x1="${xGuide}" y1="${ty}" x2="${xGuide + 18}" y2="${ty}" stroke="${v.border}" stroke-opacity="0.35" stroke-width="1"/>`;
      }
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#bloom_${id})" opacity="0.35"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="url(#slant_${id})" opacity="0.22"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="url(#hot_${id})" opacity="0.55"/>
        <line x1="${xGuide}" y1="0" x2="${xGuide}" y2="${h}" stroke="url(#accent_${id})" stroke-width="2" opacity="0.85"/>
        <line x1="${xGuide}" y1="0" x2="${xGuide}" y2="${h}" stroke="rgba(255,255,255,0.35)" stroke-width="1" stroke-dasharray="5 9" opacity="0.9"/>
        ${ticks}
        ${clipClose(id, w, h, rx)}`;
    }
    case '14':
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}" stroke-width="3"/>
        <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="${Math.max(12, rx - 8)}" fill="url(#bg_${id})" stroke="${v.border}" stroke-width="1"/>
        <rect x="${x06}" y="12" width="${w - x06 - 12}" height="${h - 24}" fill="url(#slant_${id})" opacity="0.55"/>
        ${clipClose(id, w, h, rx, 0.28)}`;
    case '15': {
      const step = `M ${x0} 0 L ${w} 0 L ${w} ${Math.round(h * 0.25)} L ${x0 + 40} ${Math.round(h * 0.25)} L ${x0 + 40} ${Math.round(h * 0.55)} L ${w} ${Math.round(h * 0.55)} L ${w} ${h} L ${x0} ${h} Z`;
      return `${clipOpen(id, w, h, rx)}
        <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#bg_${id})" stroke="${v.border}"/>
        <path d="${step}" fill="url(#slant_${id})" opacity="0.92"/>
        <path d="${step}" fill="url(#bannerSide_${id})" opacity="0.42"/>
        <path d="M ${x0} 0 L ${x0} ${h}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        ${clipClose(id, w, h, rx)}`;
    }
    default:
      return curvedRightRed({ width, height, v, id, rx, split: 0.467 });
  }
}
