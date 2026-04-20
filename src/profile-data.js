import { githubJson, isRateLimitError } from './github-fetch.js';

const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;

function key(user) {
  return user.trim().toLowerCase();
}

/**
 * Public profile fields from GET /users/{username} (no extra scopes).
 */
export async function getProfileCardData({ user } = {}) {
  const k = `profile:${key(user)}`;
  const now = Date.now();
  const cached = cache.get(k);
  if (cached && cached.expiresAt > now) {
    return { ...cached.payload, cached: true };
  }

  const run = async () => {
    const url = `https://api.github.com/users/${encodeURIComponent(user)}`;
    const u = await githubJson(url);
    const created = u.created_at ? String(u.created_at).slice(0, 10) : '';
    return {
      login: u.login ?? user,
      name: (u.name && String(u.name).trim()) || u.login || user,
      bio: u.bio ? String(u.bio).trim() : '',
      followers: Number(u.followers) || 0,
      following: Number(u.following) || 0,
      publicRepos: Number(u.public_repos) || 0,
      publicGists: Number(u.public_gists) || 0,
      company: u.company ? String(u.company).trim() : '',
      location: u.location ? String(u.location).trim() : '',
      blog: u.blog ? String(u.blog).trim() : '',
      twitter: u.twitter_username ? String(u.twitter_username).trim() : '',
      htmlUrl: u.html_url ? String(u.html_url) : `https://github.com/${encodeURIComponent(u.login || user)}`,
      createdAt: created,
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
