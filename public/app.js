(function () {
  const $ = (id) => document.getElementById(id);

  /** Default accent hex per look (matches server presets). */
  const THEME_DEFAULT_ACCENTS = {
    'noir-crimson': '#ff003c',
    'noir-magma': '#ff4d00',
    'noir-rose': '#fb7185',
    'noir-violet': '#a78bfa',
    'noir-electric': '#22d3ee',
    'noir-jade': '#34d399',
    'noir-gold': '#fbbf24',
    'noir-ice': '#38bdf8',
    'light-paper': '#dc2626',
    'light-rose': '#e11d48',
    'light-indigo': '#4f46e5',
    'light-teal': '#0d9488',
    'light-slate': '#475569',
    'light-ember': '#ea580c',
    'light-orchid': '#a855f7'
  };

  const els = {
    user: $('user'),
    modeToggle: document.querySelector('.mode-toggle'),
    streakOnlyBlock: $('streakOnlyBlock'),
    arrangement: $('arrangement'),
    layout: $('layout'),
    theme: $('theme'),
    accent: $('accent'),
    accentHex: $('accentHex'),
    scale: $('scale'),
    scaleVal: $('scaleVal'),
    preview: $('preview'),
    md: $('md'),
    html: $('html'),
    urlRaw: $('urlRaw')
  };

  function getActiveCardMode() {
    const active = document.querySelector('.mode-btn.is-active[data-card-mode]');
    return active ? active.dataset.cardMode : 'streak';
  }

  function setCardMode(mode) {
    document.querySelectorAll('.mode-btn[data-card-mode]').forEach((btn) => {
      const on = btn.dataset.cardMode === mode;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    els.streakOnlyBlock.hidden = mode !== 'streak';
  }

  function previewAltLabel() {
    const m = getActiveCardMode();
    if (m === 'languages') return 'Languages';
    if (m === 'profile') return 'Profile';
    if (m === 'stars') return 'Stars & forks';
    if (m === 'top-repos') return 'Top repos';
    const a = els.arrangement.value;
    if (a === 'basic') return 'Streak';
    if (a === 'compact') return 'Streak · compact';
    return 'Streak · banner';
  }

  function applyThemeAccentDefaults() {
    const hex = THEME_DEFAULT_ACCENTS[els.theme.value] || '#ff003c';
    els.accent.value = hex;
    els.accentHex.value = '';
  }

  function syncPickerFromHex() {
    let h = (els.accentHex.value || '').trim().replace(/^#/, '').replace(/\s+/g, '');
    if (!h) return;
    if (/^[0-9a-fA-F]{6}$/.test(h)) els.accent.value = `#${h.toLowerCase()}`;
    else if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
      els.accent.value = `#${h.toLowerCase()}`;
    }
  }

  function buildCardUrl() {
    const origin = window.location.origin;
    const user = (els.user.value || '').trim();
    if (!user) return null;

    const params = new URLSearchParams();
    params.set('user', user);
    params.set('theme', els.theme.value);

    const hexRaw = (els.accentHex.value || '').trim().replace(/^#/, '').replace(/\s+/g, '');
    const def = THEME_DEFAULT_ACCENTS[els.theme.value];
    const picker = (els.accent.value || '').replace(/^#/, '').toLowerCase();
    const defNorm = (def || '').replace(/^#/, '').toLowerCase();
    const userTyped = /^[0-9a-fA-F]{3}$/.test(hexRaw) || /^[0-9a-fA-F]{6}$/.test(hexRaw);
    const pickerDiffers = Boolean(picker && defNorm && picker !== defNorm);
    if (userTyped) params.set('accent', hexRaw);
    else if (pickerDiffers) params.set('accent', picker);

    const sc = Number(els.scale.value);
    if (Number.isFinite(sc) && Math.abs(sc - 1) > 0.01) {
      params.set('scale', String(sc));
    }

    const mode = getActiveCardMode();
    if (mode === 'languages') params.set('card', 'languages');
    else if (mode === 'profile') params.set('card', 'profile');
    else if (mode === 'stars') params.set('card', 'stars');
    else if (mode === 'top-repos') params.set('card', 'top-repos');
    else {
      const a = els.arrangement.value;
      if (a === 'compact') params.set('card', 'compact');
      else if (a === 'banner') params.set('card', 'banner');
    }

    if (mode === 'streak' && els.layout.value && els.layout.value !== '01') {
      params.set('layout', els.layout.value);
    }

    return `${origin}/api?${params.toString()}`;
  }

  function update() {
    // Never reset the color picker here when hex is empty — that ran on every
    // update() (username, layout, etc.) and wiped picker overrides before buildCardUrl().
    if ((els.accentHex.value || '').trim()) {
      syncPickerFromHex();
    }

    const sc = Number(els.scale.value);
    els.scaleVal.textContent = Number.isFinite(sc) ? sc.toFixed(2) + '×' : '1×';

    const url = buildCardUrl();
    if (!url) {
      els.preview.innerHTML = '<p class="preview-placeholder">Enter a GitHub username to preview.</p>';
      els.md.value = '';
      els.html.value = '';
      els.urlRaw.value = '';
      return;
    }

    els.urlRaw.value = url;
    const user = (els.user.value || '').trim();
    const alt = `GitHub ${previewAltLabel()} — ${user}`;
    els.preview.replaceChildren();
    const img = document.createElement('img');
    // Bust cache for studio preview only (API sends max-age=1800; same-card URL would otherwise stick).
    const bust = `_pv=${Date.now()}`;
    img.src = url.includes('?') ? `${url}&${bust}` : `${url}?${bust}`;
    img.alt = alt;
    img.addEventListener('error', () => {
      const p = document.createElement('p');
      p.className = 'preview-placeholder';
      const m = getActiveCardMode();
      const needsGithub =
        m === 'languages' || m === 'profile' || m === 'stars' || m === 'top-repos';
      p.textContent = needsGithub
        ? 'Preview could not load. This card uses the GitHub API — without GITHUB_TOKEN on the server you may hit rate limits, or the request failed. Set GITHUB_TOKEN in production (e.g. Vercel env) or try again later.'
        : 'Preview could not load. Check the server and URL, then try again.';
      els.preview.replaceChildren(p);
    });
    els.preview.appendChild(img);
    els.md.value = `![${alt}](${url})`;
    els.html.value = `<img src="${url}" alt="${alt.replace(/"/g, '&quot;')}" />`;
  }

  function copy(txt) {
    navigator.clipboard.writeText(txt).catch(() => {});
  }

  els.modeToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-card-mode]');
    if (!btn) return;
    setCardMode(btn.dataset.cardMode);
    update();
  });

  function onAccentPickerChange() {
    els.accentHex.value = '';
    update();
  }
  els.accent.addEventListener('input', onAccentPickerChange);
  els.accent.addEventListener('change', onAccentPickerChange);
  function onAccentHexChange() {
    const raw = (els.accentHex.value || '').trim();
    if (!raw) {
      const def = THEME_DEFAULT_ACCENTS[els.theme.value];
      if (def) els.accent.value = def;
    } else {
      syncPickerFromHex();
    }
    update();
  }
  els.accentHex.addEventListener('input', onAccentHexChange);
  els.accentHex.addEventListener('change', onAccentHexChange);
  els.theme.addEventListener('change', () => {
    applyThemeAccentDefaults();
    update();
  });
  ['user', 'arrangement', 'layout', 'scale'].forEach((k) => {
    els[k].addEventListener('input', update);
    els[k].addEventListener('change', update);
  });

  $('btnCopyMd').addEventListener('click', () => copy(els.md.value));
  $('btnCopyHtml').addEventListener('click', () => copy(els.html.value));
  $('btnCopyUrl').addEventListener('click', () => copy(els.urlRaw.value));
  $('btnOpen').addEventListener('click', () => {
    const u = buildCardUrl();
    if (u) window.open(u, '_blank', 'noopener,noreferrer');
  });

  applyThemeAccentDefaults();
  update();
})();
