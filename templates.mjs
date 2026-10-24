import { escapeHtml as esc } from './markdown.mjs';

// ---------- 小さな道具 ----------
export function dateParts(s) {
  const m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return { y: '0000', m: '00', d: '00' };
  return { y: m[1], m: m[2].padStart(2, '0'), d: m[3].padStart(2, '0') };
}
export const fmtDate = (s) => {
  const p = dateParts(s);
  return `${p.y}.${p.m}.${p.d}`;
};
export const isoDate = (s) => {
  const p = dateParts(s);
  return `${p.y}-${p.m}-${p.d}`;
};

function marked(text, highlight) {
  const t = esc(text);
  if (!highlight) return t;
  const h = esc(highlight);
  return t.includes(h) ? t.replace(h, `<span class="mk">${h}</span>`) : t;
}

// ---------- 図案（SVG） ----------
const rays = (cx, cy, r1, r2, n) =>
  Array.from({ length: n }, (_, k) => {
    const a = (k * 360) / n;
    return `<line x1="${cx}" y1="${cy - r2}" x2="${cx}" y2="${cy - r1}" transform="rotate(${a} ${cx} ${cy})"/>`;
  }).join('');

const svgOpen = (vb, align = 'xMidYMid') =>
  `<svg viewBox="${vb}" preserveAspectRatio="${align} slice" aria-hidden="true" focusable="false">`;

export const sunMark = () =>
  `<svg class="sun-mark" width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="8" class="m-core"/><path d="M20 3v4M32.02 7.98l-2.83 2.83M37 20h-4M32.02 32.02l-2.83-2.83M20 37v-4M7.98 32.02l2.83-2.83M3 20h4M7.98 7.98l2.83 2.83" class="m-rays"/></svg>`;

// 先頭タイルの飾り（大きな太陽）
const tileSun = () =>
  `<svg class="tile-sun" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><circle cx="200" cy="200" r="100" class="s-gray"/><g class="s-rays" stroke-width="5">${rays(200, 200, 134, 170, 12)}</g></svg>`;

// 記事ページの横長ビジュアル
export const wideSun = () =>
  `${svgOpen('0 0 1040 455', 'xMaxYMid')}<circle cx="760" cy="228" r="110" class="s-gray"/><g class="s-rays" stroke-width="5">${rays(760, 228, 150, 185, 12)}</g><line x1="80" y1="380" x2="420" y2="380" class="s-ink" stroke-width="2" opacity="0.5"/></svg>`;

const arrow = (size = 18) =>
  `<svg class="go" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;

// ---------- 共通の枠 ----------
export function createRenderer(config, categoriesBySlug, categoriesByName) {
  const site = config.title;
  const abs = (p) => config.url.replace(/\/$/, '') + p;

  const catName = (post) => categoriesByName.get(post.category)?.name || post.category || '未分類';
  const catChip = (post, small = true) => {
    const c = categoriesByName.get(post.category);
    const cls = small ? 'chip chip-sm' : 'chip';
    return c
      ? `<a class="${cls}" href="/category/${c.slug}/">${esc(c.name)}</a>`
      : `<span class="${cls}">${esc(catName(post))}</span>`;
  };

  const adsOn = Boolean(config.adsense?.clientId);
  const adUnit = (slot) =>
    adsOn && slot
      ? `<aside class="ad" aria-label="広告"><span class="ad-label">広告</span><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.adsense.clientId)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></aside>`
      : '';

  function layout({ title, description, path, body, type = 'website', jsonLd = '', withAbout = false }) {
    const full = title === site ? site : `${title} | ${site}`;
    const desc = description || config.description;
    const url = abs(path);
    return `<!doctype html>
<html lang="${config.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site)}" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Outfit:wght@700;800&display=swap">
<link rel="stylesheet" href="/assets/style.css">
${adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.adsense.clientId)}" crossorigin="anonymous"></script>` : ''}
${jsonLd}
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
${header()}
<main id="main">
${body}
</main>
${footer(withAbout)}
</body>
</html>
`;
  }

  function header() {
    return `<header class="site-header container">
<a class="brand" href="/" aria-label="${esc(site)} トップへ">${sunMark()}<span class="brand-text"><span class="brand-ja">よくばり</span><span class="brand-en">GoodSun</span></span></a>
<nav class="nav" aria-label="メインメニュー">
<a href="/archive/">記事一覧</a>
<a href="/#categories">カテゴリ</a>
<a href="/about/">このブログについて</a>
</nav>
</header>`;
  }

  function footer(withAbout) {
    const about = withAbout
      ? `<div class="container foot-about">
<p class="foot-tag">${esc(config.aboutVertical)}</p>
<p class="foot-text">${esc(config.aboutShort)}</p>
</div>`
      : '';
    return `<footer class="site-footer dark">
${about}
<div class="container footer-inner">
<span>© ${new Date().getFullYear()} ${esc(site)}</span>
<nav class="footer-nav" aria-label="フッターメニュー">
<a href="/archive/">記事一覧</a>
<a href="/about/">このブログについて</a>
<a href="/privacy/">プライバシーポリシー</a>
<a href="/rss.xml">RSS</a>
</nav>
</div>
</footer>`;
  }

  // ---------- 部品 ----------
  const TILE_VARIANTS = ['gray', 'ink', 'soft', 'accent'];

  function tile(post, index) {
    const lead = index === 0;
    const variant = lead ? 'accent' : TILE_VARIANTS[(index - 1) % TILE_VARIANTS.length];
    return `<a class="tile tile--${variant}${lead ? ' tile--lead' : ''}" href="/posts/${post.slug}/">
${lead ? tileSun() : ''}
<div class="tile-meta"><span class="chip">${esc(catName(post))}</span><time class="date" datetime="${isoDate(post.date)}">${fmtDate(post.date)}</time></div>
<div class="tile-main"><h2 class="tile-title">${esc(post.title)}</h2>${arrow(lead ? 36 : 30)}</div>
</a>`;
  }

  function row(post) {
    return `<a class="row" href="/posts/${post.slug}/">
<time class="date" datetime="${isoDate(post.date)}">${fmtDate(post.date)}</time>
<span class="row-title"><span class="hl">${esc(post.title)}</span></span>
<span class="chip chip-sm">${esc(catName(post))}</span>
</a>`;
  }

  function pills(activeSlug = '') {
    const cur = (slug) => (slug === activeSlug ? ' aria-current="page"' : '');
    return `<nav id="categories" class="pills" aria-label="カテゴリ">
<a class="pill" href="/archive/"${cur('all')}>すべて</a>
${config.categories.map((c) => `<a class="pill" href="/category/${c.slug}/"${cur(c.slug)}>${esc(c.name)}</a>`).join('\n')}
</nav>`;
  }

  // ---------- ページ ----------
  function home(posts) {
    const shown = posts.slice(0, 9);
    const tiles = shown.length
      ? shown.map(tile).join('\n')
      : `<div class="tile tile--ink tile--lead tile--empty">
<div class="tile-main"><h2 class="tile-title">最初の記事を、準備しています。</h2></div>
</div>`;
    const more =
      posts.length > shown.length
        ? `<p class="more-wrap"><a class="btn" href="/archive/"><span>すべての記事を見る</span>${arrow()}</a></p>`
        : '';

    const body = `<section class="catch container" aria-label="キャッチフレーズ">
<h1 class="catch-title">${marked(config.tagline, config.taglineHighlight)}</h1>
<p class="catch-sub">${esc(config.lead)}</p>
</section>
${pills()}
<section id="tiles" class="tiles container" aria-label="記事一覧">
${tiles}
</section>
${more}`;
    return layout({ title: site, description: config.description, path: '/', body, withAbout: true });
  }

  function postPage(post, related) {
    const html = injectMiddleAd(post.html);
    const relSec = related.length
      ? `<section class="related" aria-label="あわせて読む">
<div class="container related-inner">
<h2 class="section-title"><span class="mk">あわせて読む</span></h2>
<div class="related-grid">
${related
  .map(
    (r) => `<a class="rel" href="/posts/${r.slug}/">
<div class="card-meta"><span class="chip chip-sm">${esc(catName(r))}</span><time class="date" datetime="${isoDate(r.date)}">${fmtDate(r.date)}</time></div>
<h3 class="card-title"><span class="hl">${esc(r.title)}</span></h3>
</a>`,
  )
  .join('\n')}
</div>
</div>
</section>`
      : '';

    const jsonLd = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description || '',
      datePublished: isoDate(post.date),
      mainEntityOfPage: abs(`/posts/${post.slug}/`),
      publisher: { '@type': 'Organization', name: site },
    }).replace(/</g, '\\u003c')}</script>`;

    const body = `<article>
<div class="post-head">
<a class="back" href="/archive/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg><span>記事一覧へ</span></a>
<div class="card-meta">${catChip(post, false)}<time class="date date-lg" datetime="${isoDate(post.date)}">${fmtDate(post.date)}</time></div>
<h1 class="post-title">${marked(post.title, post.highlight)}</h1>
</div>
<div class="container post-hero-wrap"><div class="post-hero">${post.image ? `<img src="${esc(post.image)}" alt="">` : wideSun()}</div></div>
<div class="prose">
${html}
</div>
${adUnit(config.adsense?.slotEnd) ? `<div class="prose-ad">${adUnit(config.adsense.slotEnd)}</div>` : ''}
${relSec}
</article>`;
    return layout({
      title: post.title,
      description: post.description,
      path: `/posts/${post.slug}/`,
      body,
      type: 'article',
      jsonLd,
    });
  }

  function injectMiddleAd(html) {
    const unit = adUnit(config.adsense?.slotMiddle);
    if (!unit) return html;
    // 3つ目の見出しの直前に1枠だけ入れる
    let n = 0;
    return html.replace(/<h2>/g, (m) => (++n === 3 ? `${unit}\n<h2>` : m));
  }

  function archive(posts) {
    const byYear = new Map();
    for (const p of posts) {
      const y = dateParts(p.date).y;
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(p);
    }
    const sections = posts.length
      ? [...byYear.entries()]
          .map(
            ([y, list]) => `<section class="year">
<h2 class="year-title">${y}</h2>
<div class="rows">
${list.map(row).join('\n')}
</div>
</section>`,
          )
          .join('\n')
      : `<p class="empty">まだ記事がありません。</p>`;
    const body = `<div class="container list-page">
<h1 class="page-title"><span class="mk">記事一覧</span></h1>
${pills('all')}
${sections}
</div>`;
    return layout({ title: '記事一覧', description: `${site}の記事一覧です。`, path: '/archive/', body });
  }

  function categoryPage(cat, posts) {
    const body = `<div class="container list-page">
<p class="page-eyebrow">カテゴリ</p>
<h1 class="page-title"><span class="mk">${esc(cat.name)}</span></h1>
${pills(cat.slug)}
${posts.length ? `<div class="tiles tiles-flush">${posts.map((p, i) => tile(p, i + 1)).join('\n')}</div>` : '<p class="empty">このカテゴリの記事は、まだありません。</p>'}
</div>`;
    return layout({
      title: `${cat.name}の記事`,
      description: `${site}の「${cat.name}」カテゴリの記事一覧です。`,
      path: `/category/${cat.slug}/`,
      body,
    });
  }

  function simplePage({ title, description, html, path }) {
    const body = `<div class="page">
<h1 class="page-title"><span class="mk">${esc(title)}</span></h1>
<div class="prose prose-page">
${html}
</div>
</div>`;
    return layout({ title, description, path, body });
  }

  function notFound() {
    const body = `<div class="container list-page notfound">
<p class="page-eyebrow">404</p>
<h1 class="page-title"><span class="mk">ページが見つかりません</span></h1>
<p class="empty">URLが変わったか、ページが削除された可能性があります。</p>
<p><a class="btn" href="/"><span>トップへ戻る</span>${arrow()}</a></p>
</div>`;
    return layout({ title: 'ページが見つかりません', description: '', path: '/404.html', body });
  }

  return { home, postPage, archive, categoryPage, simplePage, notFound, abs };
}
