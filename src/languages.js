import { githubJson, hasGithubToken as hasToken, isRateLimitError } from './github-fetch.js';

/** In-memory cache: fewer repeat hits while developing / embedding. */
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;

function cacheKey(user) {
  return user.trim().toLowerCase();
}

function defaultMaxRepos() {
  const env = Number.parseInt(process.env.LANGS_MAX_REPOS ?? '', 10);
  if (Number.isFinite(env) && env > 0) return Math.min(env, 80);
  return hasToken() ? 32 : 8;
}

function maxRepoListPages() {
  return hasToken() ? 5 : 1;
}

/**
 * Aggregate language bytes from a user's public, non-fork, non-archived repos.
 * Uses fewer API calls when GITHUB_TOKEN is unset; caches results to avoid repeat limits.
 */
export async function getLanguageStats({ user, maxRepos: maxReposArg } = {}) {
  const key = cacheKey(user);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return { ...cached.payload, cached: true };
  }

  const maxRepos = maxReposArg ?? defaultMaxRepos();
  const listPages = maxRepoListPages();

  const run = async () => {
    const repos = [];
    for (let page = 1; page <= listPages; page++) {
      const url = `https://api.github.com/users/${encodeURIComponent(
        user
      )}/repos?per_page=100&page=${page}&type=owner&sort=pushed`;
      const batch = await githubJson(url);
      if (!Array.isArray(batch) || batch.length === 0) break;
      repos.push(...batch);
      if (batch.length < 100) break;
    }

    const usable = repos
      .filter((r) => r && !r.fork && !r.archived && r.languages_url)
      .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))
      .slice(0, maxRepos);

    const totals = new Map();
    for (const repo of usable) {
      const langs = await githubJson(repo.languages_url);
      if (!langs || typeof langs !== 'object') continue;
      for (const [name, bytes] of Object.entries(langs)) {
        if (typeof bytes !== 'number' || bytes <= 0) continue;
        totals.set(name, (totals.get(name) || 0) + bytes);
      }
    }

    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const sumBytes = entries.reduce((s, [, b]) => s + b, 0);

    const maxShown = 8;
    const head = entries.slice(0, maxShown);
    const tail = entries.slice(maxShown);
    const rows = [...head];
    if (tail.length > 0) {
      const otherBytes = tail.reduce((s, [, b]) => s + b, 0);
      if (otherBytes > 0) {
        rows.push(['Other', otherBytes]);
      }
    }

    const items = rows.map(([name, bytes]) => ({
      name,
      bytes,
      ratio: sumBytes > 0 ? bytes / sumBytes : 0,
      pct: sumBytes > 0 ? (100 * bytes) / sumBytes : 0
    }));

    return {
      items,
      totalBytes: sumBytes,
      reposScanned: usable.length,
      cached: false,
      stale: false
    };
  };

  try {
    const payload = await run();
    cache.set(key, {
      expiresAt: now + CACHE_TTL_MS,
      fetchedAt: now,
      payload: { ...payload, cached: false, stale: false }
    });
    return payload;
  } catch (err) {
    if (isRateLimitError(err) && cached?.payload && now - cached.fetchedAt < STALE_FALLBACK_MS) {
      return {
        ...cached.payload,
        cached: true,
        stale: true
      };
    }
    throw err;
  }
}
