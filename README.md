# GitHub Card Studio 

A small **Node.js + Express** app that renders **GitHub stats cards as SVG**: streak layouts, language mix, profile snapshot, aggregate stars/forks, and top repositories by stars. Use the bundled **web UI** to tune options and copy README-ready **Markdown**, **HTML**, or a raw **URL**.

## Features

| Card | Query (`card=`) | What it shows |
|------|-----------------|----------------|
| **Streak** | `streak` (default) | Current streak, longest streak, total contributions (scrapes the public contributions calendar). |
| **Compact / banner** | `compact`, `banner` | Same data as streak, different canvas sizes and composition. |
| **Languages** | `languages` | Public-repo language breakdown (GitHub REST: repos + per-repo `languages`). |
| **Profile** | `profile` | Name, handle, bio, followers/following/public repos, light meta (GitHub `GET /users/{user}`). |
| **Stars & forks** | `stars` | Totals across your **non-fork** public repos (paged `GET /users/{user}/repos`). |
| **Top repos** | `top-repos` | Up to **6** public **non-fork** repos ranked by **stars** (same paged list as `stars`). |

**Aliases** (normalized server-side): e.g. `user` → `profile`, `repo-stats` / `star` → `stars`, `repos` / `toprepos` → `top-repos`, `lang` / `langs` → `languages`.

Shared query options where supported:

- **`theme`** — one of **15** palettes (default `noir-crimson`). Dark: `noir-crimson`, `noir-magma`, `noir-rose`, `noir-violet`, `noir-electric`, `noir-jade`, `noir-gold`, `noir-ice`. Light: `light-paper`, `light-rose`, `light-indigo`, `light-teal`, `light-slate`, `light-ember`, `light-orchid`. Legacy: `noir-red` → `noir-crimson`, `light` → `light-paper`.
- **`accent`** — optional 3- or 6-digit hex **without** `#` (e.g. `ff003c`).
- **`scale`** — **0.35–2.5**, multiplies root SVG `width` / `height` (display size; `viewBox` unchanged).

**Streak family only** (`streak`, `compact`, `banner`):

- **`layout`** — partition geometry **`01`–`11`**, **`13`–`15`** (default **`01`**). **`12` is removed**; old URLs using `12` fall back to **`01`**. Ignored for non-streak cards.

## Run locally

```bash
npm install
npm run start
```

Then open **`http://localhost:3000/`** for the studio. Other useful paths:

| Path | Purpose |
|------|---------|
| `GET /` | Web UI (`public/`) |
| `GET /api?user=…` | SVG card (see query params below) |
| `GET /api/languages?user=…` | Same as `card=languages` |
| `GET /api-help` | Plain-text API cheat sheet |
| `GET /healthz` | `{ "ok": true }` |


**PowerShell smoke test** (from project root):

```powershell
npm install
npm run start
```

In another terminal:

```powershell
Invoke-WebRequest "http://localhost:3000/healthz" -UseBasicParsing
Invoke-WebRequest "http://localhost:3000/api?user=octocat&card=profile" -OutFile .\card-profile.svg
```

## API reference

### `GET /api`

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | GitHub username. |
| `card` | No | `streak` (default), `compact`, `banner`, `languages`, `profile`, `stars`, `top-repos`. |
| `theme` | No | Palette id (see above). |
| `layout` | No | Streak/compact/banner layout id only. |
| `accent` | No | Hex accent override. |
| `scale` | No | Display scale factor. |

**Examples** (replace host and username):

```http
GET /api?user=octocat
GET /api?user=octocat&card=compact&layout=03&theme=noir-magma
GET /api?user=octocat&card=languages
GET /api?user=octocat&card=profile&theme=light-paper
GET /api?user=octocat&card=stars&scale=0.9
GET /api?user=octocat&card=top-repos
```

### `GET /api/languages`

Same response as `GET /api?user=…&card=languages`.

### Responses

- Success: **`200`**, `Content-Type: image/svg+xml`, `Cache-Control: public, max-age=1800`, header **`X-Card`** with the resolved card id.
- Missing `user`: **`400`** plain text.
- Upstream / generation failure: **`502`** plain text (`Failed to generate card: …`).

## Environment variables

| Variable | Effect |
|----------|--------|
| **`GITHUB_TOKEN`** | **Strongly recommended** in production. Raises GitHub REST rate limit (e.g. **5,000 req/h** for a classic PAT vs **60** unauthenticated). Languages + repo paging benefit the most. |
| **`PORT`** | Listen port (default `3000`; local server scans upward if busy). |

Language card tuning (see `src/languages.js`): **`LANGS_MAX_REPOS`**, list page caps, etc., when you need heavier scans with a token.

## How the data is fetched

- **Streak / compact / banner** — HTML from `https://github.com/users/{user}/contributions` (Cheerio). No GitHub token required for that page, but behavior depends on GitHub’s public HTML.
- **Languages** — REST: user repos + per-repo `languages` (token recommended).
- **Profile** — REST: `GET /users/{username}`.
- **Stars / top-repos** — REST: paged `GET /users/{username}/repos` (aggregates only; **no** per-repo language calls). Forks are excluded from aggregates / rankings.

Caches are **in-memory** (per serverless instance on Vercel); stale fallbacks may apply when GitHub returns **403/429** for cached cards.

## Embed in a README

After you deploy (see below), use the URL the studio copies, or:

```md
![GitHub streak](https://YOUR-DOMAIN/api?user=YOURNAME&card=streak&theme=noir-crimson)
```

```md
![GitHub languages](https://YOUR-DOMAIN/api?user=YOURNAME&card=languages)
```

SVGs are normal images in GitHub Markdown; **hard-refresh** or bump a cache-buster query if you see an old image after a deploy.

## Deploy on Vercel

This repo is set up for Vercel’s **Node serverless** pattern: **`api/index.js`** re-exports the Express **`app`** from **`http-app.js`**, and **`vercel.json`** rewrites incoming paths to that function so **both** `/api?...` **and** static files served by `express.static('public')` hit the same app.

### Steps

1. **Push the project** to GitHub (or GitLab / Bitbucket) if it is not already in a remote repository.
2. Go to [vercel.com](https://vercel.com), sign in, and **Add New… → Project**. Import the repository.
3. Vercel auto-detects **Node**; defaults are fine. **Root directory** should be the repo root (where `package.json` and `vercel.json` live).
4. **Environment variables** (Project → Settings → Environment Variables): add **`GITHUB_TOKEN`** with a [fine-grained or classic PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) that can read public user/repo data. Apply to **Production** and **Preview** as you prefer.
5. **Deploy**. Your production URL will look like `https://your-project.vercel.app`.
6. **Try**: `https://your-project.vercel.app/` (studio), `https://your-project.vercel.app/api?user=octocat&card=profile`, and `https://your-project.vercel.app/api-help`.

### Notes and caveats

- **Cold starts**: the first request after idle may be slower; SVG responses are still usually fine within hobby limits.
- **Function duration**: very large language scans can run longer; keep **`GITHUB_TOKEN`** set and reasonable caps so you stay under your plan’s **max duration** (see [Vercel limits](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js#max-duration)).
- **Rewrites**: `vercel.json` uses a catch-all rewrite to `/api` so Express can serve **`/`** and **`/styles.css`** from `public/` as well as **`/api`**. If anything 404s in production, confirm **`public/`** paths in `index.html` are root-relative (`/styles.css`) and that the deployment picked up `vercel.json`.
- **Caching**: responses include **`Cache-Control: public, max-age=1800`**. CDN caching is normal; wait or change query slightly while testing.

## Card sizes (approximate)

Useful when aligning README layouts:

- **`streak`** — about **520×248**
- **`compact`** — about **680×204**
- **`banner`** — about **920×248**
- **`languages`** — width **560px**, height varies with legend rows
- **`profile`** — width **580px**, height grows with bio lines
- **`stars`** — about **520×220**
- **`top-repos`** — similar width to stars; height grows with rows

## Screenshots<p align="center">

![Home](https://github.com/Gunjankadam/GithubCardStudio/blob/main/1.png)

![Home](https://github.com/Gunjankadam/GithubCardStudio/blob/main/2.png)

![Home](https://github.com/Gunjankadam/GithubCardStudio/blob/main/3.png)

## License

MIT
