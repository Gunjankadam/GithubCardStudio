import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { getLanguageStats } from './src/languages.js';
import { getProfileCardData } from './src/profile-data.js';
import { getRepoSummaryData } from './src/repo-summary-data.js';
import { getStreakStats } from './src/streak.js';
import { renderCardSvg } from './src/svg.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

export const app = express();

function firstQuery(val) {
  if (Array.isArray(val)) return String(val[val.length - 1] ?? '').trim();
  return String(val ?? '').trim();
}

/** Canonical card id (fixes duplicate query keys, aliases, casing). */
function normalizeCard(raw) {
  const c = firstQuery(raw).toLowerCase();
  if (c === 'language' || c === 'langs' || c === 'lang') return 'languages';
  if (c === 'user' || c === 'profile') return 'profile';
  if (c === 'stars' || c === 'repo-stats' || c === 'star') return 'stars';
  if (c === 'top-repos' || c === 'toprepos' || c === 'repos') return 'top-repos';
  if (c === 'streak' || c === 'compact' || c === 'banner' || c === 'languages') return c;
  return 'streak';
}

function normalizeAccent(raw) {
  const s = firstQuery(raw).replace(/^#/, '');
  if (!s) return null;
  if (/^[0-9a-fA-F]{6}$/i.test(s)) return `#${s.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/i.test(s)) {
    const x = s
      .toLowerCase()
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${x}`;
  }
  return null;
}

/** Scales displayed pixel size; viewBox unchanged so SVG stays sharp. */
function applySvgScale(svg, scaleRaw) {
  const s = Number(scaleRaw);
  if (!Number.isFinite(s) || s <= 0 || Math.abs(s - 1) < 0.001) return svg;
  const sc = Math.min(2.5, Math.max(0.35, s));
  return svg.replace(/^<svg\b[^>]*>/, (openTag) =>
    openTag
      .replace(/\bwidth="(\d+)"/, (_, w) => `width="${Math.round(Number(w) * sc)}"`)
      .replace(/\bheight="(\d+)"/, (_, h) => `height="${Math.round(Number(h) * sc)}"`)
  );
}

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.get('/api-help', (_req, res) => {
  res.type('text/plain').send(
    [
      'GitHub card API',
      '',
      'GET /api?user=USER&card=streak|compact|banner|languages|profile|stars|top-repos',
      '  &theme=noir-crimson|noir-magma|… (15 color palettes)',
      '  &layout=01–11,13–15  optional partition structure (streak/compact/banner only; default 01)',
      '  &accent=HEX   optional 6-digit hex (e.g. ff003c or #ff1744)',
      '  &scale=NUMBER optional 0.35–2.5 (display width/height vs default)',
      '',
      'GET /api/languages?user=USER  (same as card=languages)',
      '',
      'Cards: streak / compact / banner (contributions page), languages (repo API),',
      '  profile (GET /users/{user}), stars & forks + top-repos (paged /users/{user}/repos, no per-repo language calls).',
      '',
      'UI: GET /',
      ''
    ].join('\n')
  );
});

async function sendSvgCard(req, res, cardFixed) {
  const user = firstQuery(req.query.user);
  const theme = firstQuery(req.query.theme) || 'noir-crimson';
  const layout = firstQuery(req.query.layout);
  const accent = normalizeAccent(req.query.accent);
  const scale = firstQuery(req.query.scale);

  if (!user) {
    res.status(400).type('text/plain').send('Missing required query param: user');
    return;
  }

  const card = cardFixed ?? normalizeCard(req.query.card);

  try {
    let svg;
    const baseSvgArgs = { user, theme, accent, layout };

    if (card === 'languages') {
      const langStats = await getLanguageStats({ user });
      svg = renderCardSvg({
        ...baseSvgArgs,
        stats: null,
        langStats,
        profile: null,
        repoSummary: null,
        card: 'languages'
      });
    } else if (card === 'profile') {
      const profile = await getProfileCardData({ user });
      svg = renderCardSvg({
        ...baseSvgArgs,
        stats: null,
        langStats: null,
        profile,
        repoSummary: null,
        card: 'profile'
      });
    } else if (card === 'stars' || card === 'top-repos') {
      const repoSummary = await getRepoSummaryData({ user });
      svg = renderCardSvg({
        ...baseSvgArgs,
        stats: null,
        langStats: null,
        profile: null,
        repoSummary,
        card
      });
    } else {
      const stats = await getStreakStats({ user });
      svg = renderCardSvg({
        ...baseSvgArgs,
        stats,
        langStats: null,
        profile: null,
        repoSummary: null,
        card
      });
    }

    svg = applySvgScale(svg, scale);

    res.setHeader('X-Card', card);
    res.setHeader('Vary', 'Query');
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.type('image/svg+xml').send(svg);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).type('text/plain').send(`Failed to generate card: ${message}`);
  }
}

app.get('/api/languages', (req, res) => sendSvgCard(req, res, 'languages'));

app.get('/api', (req, res) => sendSvgCard(req, res, null));

app.use(express.static(publicDir));
