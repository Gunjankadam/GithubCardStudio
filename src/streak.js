import * as cheerio from 'cheerio';

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date, delta) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function contributionCountFromTipText(text) {
  const t = String(text || '').trim();
  const plural = t.match(/^(\d+)\s+contributions\s+on\b/i);
  if (plural) return Number(plural[1]);
  const singular = t.match(/^(\d+)\s+contribution\s+on\b/i);
  if (singular) return Number(singular[1]);
  if (/^No contributions\b/i.test(t)) return 0;
  return null;
}

function contributionCountFromLevel(levelRaw) {
  const level = Number(levelRaw);
  if (!Number.isFinite(level)) return 0;
  // GitHub uses 0–4 intensity when exact counts are not available.
  return level > 0 ? 1 : 0;
}

function parseContributionsFromHtml(html) {
  const $ = cheerio.load(html);
  const items = [];

  const rects = $('rect[data-date]');
  if (rects.length > 0) {
    rects.each((_i, el) => {
      const date = String($(el).attr('data-date') ?? '');
      const countRaw =
        $(el).attr('data-count') ?? $(el).attr('data-level') ?? '0';
      if (!date) return;
      let count = Number(countRaw);
      if (!Number.isFinite(count)) count = 0;
      items.push({ date, count });
    });
  } else {
    // Current GitHub markup: <td data-date="..." id="..."> + <tool-tip for="id">N contributions on ...</tool-tip>
    $('td[data-date]').each((_i, el) => {
      const $el = $(el);
      const date = String($el.attr('data-date') ?? '');
      if (!date) return;

      const id = String($el.attr('id') ?? '');
      let count = 0;

      if (id) {
        const tipText = $('tool-tip')
          .filter((_, tip) => String($(tip).attr('for') ?? '') === id)
          .first()
          .text();
        const parsed = contributionCountFromTipText(tipText);
        count = parsed === null ? contributionCountFromLevel($el.attr('data-level')) : parsed;
      } else {
        count = contributionCountFromLevel($el.attr('data-level'));
      }

      items.push({ date, count });
    });
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}

function fillMissingDays(sortedItems) {
  if (sortedItems.length === 0) return [];

  const start = new Date(sortedItems[0].date);
  const end = new Date(sortedItems[sortedItems.length - 1].date);

  const byDate = new Map(sortedItems.map((x) => [x.date, x.count]));
  const out = [];

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const key = isoDate(d);
    out.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  return out;
}

function computeCurrentStreak(items, today = new Date()) {
  if (items.length === 0) {
    return { current: 0, startsOn: null, endsOn: null, lastContributedOn: null };
  }

  const todayIso = isoDate(today);
  const yesterdayIso = isoDate(addDays(today, -1));
  const byDate = new Map(items.map((x) => [x.date, x.count]));

  const todayCount = byDate.get(todayIso) ?? 0;
  const yesterdayCount = byDate.get(yesterdayIso) ?? 0;

  // If no contribution today, streak can still be "alive" if contributed yesterday.
  const anchor = todayCount > 0 ? todayIso : yesterdayCount > 0 ? yesterdayIso : null;
  if (!anchor) {
    // Find last contributed date (best-effort) for display.
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].count > 0) {
        return {
          current: 0,
          startsOn: null,
          endsOn: null,
          lastContributedOn: items[i].date
        };
      }
    }
    return { current: 0, startsOn: null, endsOn: null, lastContributedOn: null };
  }

  let streak = 0;
  let cursor = new Date(anchor);
  while (true) {
    const key = isoDate(cursor);
    const c = byDate.get(key) ?? 0;
    if (c <= 0) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const endsOn = anchor;
  const startsOn = isoDate(addDays(new Date(anchor), -(streak - 1)));

  return { current: streak, startsOn, endsOn, lastContributedOn: endsOn };
}

function computeLongestStreak(items) {
  let best = 0;
  let bestStart = null;
  let bestEnd = null;

  let run = 0;
  let runStart = null;

  for (const it of items) {
    if (it.count > 0) {
      if (run === 0) runStart = it.date;
      run += 1;
      if (run > best) {
        best = run;
        bestStart = runStart;
        bestEnd = it.date;
      }
    } else {
      run = 0;
      runStart = null;
    }
  }

  return { best, startsOn: bestStart, endsOn: bestEnd };
}

function sumContributions(items) {
  let total = 0;
  for (const it of items) total += Math.max(0, it.count);
  return total;
}

export async function getStreakStats({ user }) {
  const url = `https://github.com/users/${encodeURIComponent(user)}/contributions`;
  const resp = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!resp.ok) {
    throw new Error(`GitHub responded ${resp.status}`);
  }

  const html = await resp.text();
  const parsed = parseContributionsFromHtml(html);
  const daily = fillMissingDays(parsed);

  const current = computeCurrentStreak(daily);
  const longest = computeLongestStreak(daily);
  const total = sumContributions(daily);

  return {
    currentStreak: current.current,
    currentStreakStart: current.startsOn,
    currentStreakEnd: current.endsOn,
    longestStreak: longest.best,
    longestStreakStart: longest.startsOn,
    longestStreakEnd: longest.endsOn,
    totalContributions: total,
    rangeStart: daily[0]?.date ?? null,
    rangeEnd: daily[daily.length - 1]?.date ?? null,
    lastContributedOn: current.lastContributedOn
  };
}

