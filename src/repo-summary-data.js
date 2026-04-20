import { githubJson, hasGithubToken, isRateLimitError } from './github-fetch.js';

const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;

function key(user) {
  return user.trim().toLowerCase();
}

function maxListPages() {
  return hasGithubToken() ? 10 : 2;
}

/**
 * List public owned repos (paged), sum stars/forks on non-forks, top repos by stars.
 * No per-repo language calls — one GET per page only.
 */
export async function getRepoSummaryData({ user } = {}) {
  const k = `reposum:${key(user)}`;
  const now = Date.now();
  const cached = cache.get(k);
  if (cached && cached.expiresAt > now) {
    return { ...cached.payload, cached: true };
  }

  const run = async () => {
    const all = [];
    const pages = maxListPages();
    for (let page = 1; page <= pages; page++) {
      const url = `https://api.github.com/users/${encodeURIComponent(
        user
      )}/repos?per_page=100&page=${page}&type=owner&sort=updated`;
      const batch = await githubJson(url);
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < 100) break;
    }

    const owned = all.filter((r) => r && !r.fork);
    let totalStars = 0;
    let totalForks = 0;
    for (const r of owned) {
      totalStars += Number(r.stargazers_count) || 0;
      totalForks += Number(r.forks_count) || 0;
    }

    const topRepos = [...owned]
      .sort((a, b) => (Number(b.stargazers_count) || 0) - (Number(a.stargazers_count) || 0))
      .slice(0, 6)
      .map((r) => ({
        name: r.name || '',
        stars: Number(r.stargazers_count) || 0,
        forks: Number(r.forks_count) || 0,
        description: r.description ? String(r.description).trim() : ''
      }));

    return {
      totalStars,
      totalForks,
      reposListed: owned.length,
      topRepos,
      stale: false,
      cached: false
    };
  };

  try {
    const payload = await run();
    cache.set(k, {
      expiresAt: now + CACHE_TTL_MS,
      fetchedAt: now,
      payload: { ...payload, cached: false, stale: false }
    });
    return payload;
  } catch (err) {
    if (isRateLimitError(err) && cached?.payload && now - cached.fetchedAt < STALE_FALLBACK_MS) {
      return { ...cached.payload, cached: true, stale: true };
    }
    throw err;
  }
}
