const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function githubJson(url) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': DEFAULT_UA
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(url, { headers });
  const remaining = resp.headers.get('x-ratelimit-remaining');

  if (resp.status === 403 || resp.status === 429) {
    const err = new Error(
      `GitHub API rate limited (HTTP ${resp.status}, remaining=${remaining}). ` +
        `Set GITHUB_TOKEN to a personal access token (classic: no scopes needed for public data) for 5,000 req/hr.`
    );
    err.code = 'GITHUB_RATE_LIMIT';
    throw err;
  }

  if (resp.status === 404) {
    const err = new Error('GitHub returned 404 (user or resource not found).');
    err.code = 'GITHUB_NOT_FOUND';
    throw err;
  }

  if (!resp.ok) {
    throw new Error(`GitHub API ${resp.status} for ${url}`);
  }

  return resp.json();
}

export function isRateLimitError(err) {
  return err && typeof err === 'object' && err.code === 'GITHUB_RATE_LIMIT';
}

export function hasGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}
