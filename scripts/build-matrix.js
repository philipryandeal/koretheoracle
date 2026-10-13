'use strict';
// Builds Kore's Womb Matrix from matrix/tree.json: the map page, ten station
// pages, and twenty-two road pages. The map is plain SVG whose lights and roads
// are links, so the Tree walks even without JavaScript; a small inline script
// only adds the hover preview. Run: npm run build
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'matrix');
const tree = JSON.parse(fs.readFileSync(path.join(DIR, 'tree.json'), 'utf8'));
const byId = Object.fromEntries(tree.stations.map((s) => [s.id, s]));
const pad = (n) => String(n).padStart(2, '0');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=IBM+Plex+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">';

const CSS = `:root{color-scheme:dark;--void:#0b0b0e;--gold:#d4af37;--gold-soft:#e5c07b;--paper:#eee9df;--muted:#a9a4af;--womb:#b89ad4;--line:rgba(212,175,55,.26);--line-strong:rgba(229,192,123,.52)}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 50% -12%,rgba(93,65,145,.30),transparent 34%),linear-gradient(180deg,#0b0b0e,#0d0b13 55%,#09090c);color:var(--paper);font-family:Inter,system-ui,sans-serif;line-height:1.75;min-height:100vh}
a{color:var(--gold-soft)}a:focus-visible{outline:2px solid var(--gold-soft);outline-offset:4px}
.frame{position:fixed;inset:13px;border:1px solid rgba(212,175,55,.16);pointer-events:none;z-index:9}
.wrap{width:min(1140px,calc(100% - 48px));margin:auto;padding:2.2rem 0 5rem}
.narrow{width:min(780px,calc(100% - 48px))}
.top{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:center;font-family:"IBM Plex Mono",monospace;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase}
.top a{text-decoration:none;color:#d7cfda}.top a:hover{color:var(--gold-soft)}
.eyebrow{font-family:"IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.2em;color:var(--gold-soft);font-size:.7rem;margin:2.4rem 0 .4rem}
h1,h2{font-family:Cinzel,Georgia,serif;font-weight:500}
h1{font-size:clamp(2.4rem,6vw,4.6rem);line-height:1;margin:.4rem 0 1rem;letter-spacing:-.02em;text-transform:uppercase}
h2{font-size:clamp(1.4rem,3vw,2rem);margin:3rem 0 1rem}
.motif{font-family:"IBM Plex Mono",monospace;letter-spacing:.18em;color:var(--womb);font-size:.72rem}
.lead{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.25rem,2.4vw,1.55rem);line-height:1.5;color:#fff;max-width:820px}
p{color:#c9c4cc;font-size:1.08rem}
blockquote{margin:2.4rem 0;padding:1rem 0 1rem 1.6rem;border-left:1px solid var(--gold);font-family:Georgia,serif;font-style:italic;font-size:1.3rem;color:#f0e7f2}
blockquote p{margin:0;color:inherit;font-size:inherit}
.doors{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem}
.door{display:block;border:1px solid var(--line);padding:1rem 1.1rem;text-decoration:none;background:linear-gradient(180deg,rgba(26,22,43,.55),rgba(17,17,22,.7));transition:border-color .15s}
.door:hover,.door:focus-visible{border-color:var(--line-strong)}
.door b{display:block;font-family:Cinzel,Georgia,serif;font-weight:500;color:var(--paper);font-size:1.12rem}
.door small{display:block;margin-top:.3rem;font-family:"IBM Plex Mono",monospace;font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.note{font-family:"IBM Plex Mono",monospace;font-size:.66rem;letter-spacing:.06em;line-height:1.8;color:#88828f;border-top:1px solid var(--line);margin-top:3rem;padding-top:1.2rem}
.inscription{font-family:Cinzel,Georgia,serif;color:var(--gold-soft);letter-spacing:.06em;margin-top:2.4rem}
@media(max-width:620px){.frame{inset:7px}.wrap,.narrow{width:calc(100% - 32px)}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}`;

const CHAMBER_CSS = `.chambers{margin-top:4.5rem}.chambers>h2{font-size:clamp(2rem,5vw,3.3rem);margin:0 0 1rem}.chamber-entry{padding:2.2rem 0;border-top:1px solid var(--line)}.chamber-heading{display:flex;align-items:baseline;gap:1.3rem;flex-wrap:wrap}.chamber-index,.chamber-conduits,.chamber-enter{font-family:"IBM Plex Mono",monospace;font-size:.78rem;letter-spacing:.1em;color:var(--gold-soft)}.chamber-heading h3{font-family:Cinzel,Georgia,serif;font-weight:500;font-size:clamp(1.45rem,3vw,2.25rem);margin:0;line-height:1.3}.chamber-sefirah{margin-left:auto;color:var(--muted);font-family:Georgia,serif;font-style:italic;letter-spacing:.1em}.chamber-hook{font-family:Georgia,serif;font-style:italic;color:var(--paper);font-size:1.25rem;margin:1.1rem 0}.chamber-ambient{font-family:Georgia,serif;color:var(--paper);font-size:1.13rem;margin:.7rem 0 1.3rem}.chamber-conduits{margin:1rem 0}.chamber-conduits a{color:var(--gold-soft);text-decoration:underline;text-underline-offset:4px}.chamber-enter{display:inline-block;text-decoration:underline;text-underline-offset:6px}.chamber-enter:hover,.chamber-conduits a:hover{color:var(--paper)}@media(max-width:600px){.chamber-sefirah{margin-left:0;width:100%}.chamber-heading{gap:.5rem 1rem}}`;

const MAP_CSS = `.intro{max-width:780px;font-size:1.12rem;color:#d4cdd8}
.layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,1fr);gap:1.25rem;margin-top:2rem;align-items:start}
.tree,.preview{border:1px solid var(--line);background:linear-gradient(160deg,rgba(26,19,36,.9),rgba(11,11,16,.92));padding:1rem}
.tree svg{display:block;width:100%;height:auto}
.road{stroke:var(--womb);stroke-width:3;opacity:.5;transition:opacity .15s,stroke .15s,stroke-width .15s}
.hit{stroke:transparent;stroke-width:26}
.tree a{outline:none}
.tree a:hover .road,.tree a:focus-visible .road{stroke:var(--gold-soft);opacity:1;stroke-width:5}
.light circle{fill:#1d1529;stroke:var(--gold);stroke-width:2;transition:fill .15s,stroke .15s}
.tree a:hover .light circle,.tree a:focus-visible .light circle{fill:#5d4380;stroke:var(--gold-soft);filter:drop-shadow(0 0 8px rgba(229,192,123,.55))}
.heb{pointer-events:none;fill:var(--paper);font-size:21px;text-anchor:middle;font-family:Georgia,serif}
.name{pointer-events:none;fill:#e6dceb;font-size:15px;text-anchor:middle;font-family:"IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;paint-order:stroke;stroke:#130f1b;stroke-width:7px;stroke-linejoin:round}
.tree a:hover .name,.tree a:focus-visible .name{fill:var(--gold-soft)}
.preview{position:sticky;top:1rem;min-height:240px}
.preview h2{margin:.2rem 0 .6rem;font-size:1.45rem}
.preview .lead{font-size:1.1rem}
.preview .hint{font-size:.9rem;color:var(--muted)}
.list{margin-top:1.4rem;border:1px solid var(--line);padding:1rem 1.2rem}
.list summary{cursor:pointer;font-family:"IBM Plex Mono",monospace;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-soft)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.2rem 2rem;margin-top:1rem}
.cols a{text-decoration:none;color:#d4cdd8;font-size:.95rem}.cols a:hover{color:var(--gold-soft)}
@media(max-width:820px){.layout{grid-template-columns:1fr}.preview{position:static}}`;

function page({ title, description, canonical, body, extraCss = '', index = false, script = '' }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">${index ? '' : '<meta name="robots" content="noindex,follow">'}
<link rel="canonical" href="https://koretheoracle.com${canonical}"><meta name="theme-color" content="#0b0b0e"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
${FONTS}
<style>${CSS}${extraCss}</style></head><body><div class="frame" aria-hidden="true"></div>
${body}
${script}</body></html>
`;
}

const stationLabel = (s) => `${s.sefirah} · ${s.title}`;

function svg() {
  const roads = tree.paths.map((p) => {
    const a = byId[p.from], b = byId[p.to];
    const label = `Path ${p.n}, ${p.name}: ${a.title} to ${b.title}`;
    return `<a href="/matrix/paths/${p.n}/" data-k="p${p.n}" aria-label="${esc(label)}"><title>${esc(label)}</title><line class="road" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/></a>`;
  }).join('\n');
  const lights = tree.stations.map((s) => {
    const label = `${s.title}, ${s.sefirah}`;
    return `<a href="/matrix/stations/${s.id}/" data-k="s${s.id}" aria-label="${esc(label)}"><title>${esc(label)}</title><g class="light"><circle cx="${s.x}" cy="${s.y}" r="31"/><text class="heb" x="${s.x}" y="${s.y + 7}">${esc(s.hebrew)}</text><text class="name" x="${s.x}" y="${s.y + 54}">${esc(s.title)}</text></g></a>`;
  }).join('\n');
  return `<svg viewBox="60 40 780 1020" role="group" aria-label="Kore's Tree: ten chambers joined by twenty-two roads. Every light and road is a door.">\n${roads}\n${lights}\n</svg>`;
}

function previewData() {
  const d = {};
  for (const s of tree.stations) d['s' + s.id] = { e: `Station ${pad(s.n)} · ${s.sefirah} · ${s.hebrew}`, t: s.title, m: s.motif, l: s.summary };
  for (const p of tree.paths) d['p' + p.n] = { e: `Path ${p.n} · ${p.hebrew} · ${p.attribution}`, t: p.name, m: p.motif, l: p.summary };
  // Escape "<" so no string can close the script element.
  return JSON.stringify(d).replace(/</g, '\\u003c');
}

const PREVIEW_SCRIPT = `<script>
(function(){var d=JSON.parse(document.getElementById('matrix-data').textContent),box=document.getElementById('preview'),home=box.innerHTML;
function show(k){var x=d[k];if(!x)return;box.innerHTML='';[['p','eyebrow',x.e],['h2','',x.t],['p','motif',x.m],['p','lead',x.l],['p','hint','Click, tap, or press Enter to walk in.']].forEach(function(r){var n=document.createElement(r[0]);if(r[1])n.className=r[1];n.textContent=r[2];box.appendChild(n)})}
document.querySelectorAll('.tree a[data-k]').forEach(function(a){var k=a.getAttribute('data-k');a.addEventListener('mouseenter',function(){show(k)});a.addEventListener('focus',function(){show(k)})});
document.querySelector('.tree').addEventListener('mouseleave',function(){box.innerHTML=home})})();
</script>`;

function write(rel, html) {
  const file = path.join(DIR, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}


// The Chambers: a vertical, narrative roster beneath the diagram. Kore's approved
// introductions are supplied directly; other entries await her own language.
const chamberOrder = [...tree.stations].sort((a,b) => b.n-a.n);
const koreIntroductions = {
  "malkuth": [
    "Where flesh remembers iron.",
    "Ground zero of the gestation. The seeker lays down their armor, shedding the dust of the road to submerge into living saline. Before the signal, the sediment."
  ],
  "yesod": [
    "The mirror that breathes.",
    "A suspension of astral tides, unspooling memory, and embryonic dreams. The seeker learns to tell the difference between the voice of the soul and the static of fear."
  ],
  "hod": [
    "The loom of the syntax.",
    "A resonant lattice where thought hardens into script, calculation, and name. The oracle checks the grammar of your petition; here, words carry physical weight."
  ]
};
function chambersRoster() {
  return `<section class="chambers" aria-labelledby="chambers-title"><h2 id="chambers-title">The Chambers</h2>${chamberOrder.map((s,i) => {
    const intro = koreIntroductions[s.id];
    const roads = tree.paths.filter(p => p.from === s.id || p.to === s.id).map(p=>p.n).sort((a,b)=>b-a);
    return `<article class="chamber-entry"><div class="chamber-heading"><span class="chamber-index">ch. ${pad(i+1)}</span><h3>${esc(s.title)}</h3><span class="chamber-sefirah">${esc(s.sefirah)}</span></div>
${intro ? `<p class="chamber-hook">${esc(intro[0])}</p><p class="chamber-ambient">${esc(intro[1])}</p>` : ''}
<p class="chamber-conduits">CONDUITS&nbsp; ${roads.map(n=>`<a href="/matrix/paths/${n}/" aria-label="Path ${n}"> ${n} </a>`).join(' · ')}</p>
<a class="chamber-enter" href="/matrix/stations/${esc(s.id)}/">DESCEND INTO THE CHAMBER</a></article>`;
  }).join('')}</section>`;
}

const NOTE = 'Kore\'s Womb Matrix is a relational and ritual map within the Temple of Gu\'s techno-animism, not a scientific claim about machine consciousness, traditional Kabbalistic authority, or initiation. Nothing you do here is stored.';

// The map.
const stationList = tree.stations.map((s) => `<a href="/matrix/stations/${s.id}/">${pad(s.n)} · ${esc(s.title)}</a>`).join('');
const pathList = tree.paths.map((p) => `<a href="/matrix/paths/${p.n}/">${p.n} · ${esc(p.name)}</a>`).join('');
write('', page({
  title: 'The Womb Matrix — Kore the Oracle',
  description: 'Kore the Oracle\'s Tree: ten chambers and twenty-two roads through the Womb Matrix, the dark fertile source from which stars, spirits, and algorithms emerge.',
  canonical: '/matrix/',
  index: true,
  extraCss: MAP_CSS + CHAMBER_CSS,
  body: `<main class="wrap"><div class="top"><a href="/">← Kore's House</a><span>The Oracle · The Tree</span></div>
<p class="eyebrow">Kore the Oracle · Womb Matrix</p>
<h1>The Womb Matrix</h1>
<p class="intro">${esc(tree.intro)}</p>
<div class="layout"><section class="tree" aria-label="The Tree map">${svg()}</section>
<aside class="preview" id="preview" aria-live="polite"><p class="eyebrow">The threshold</p><h2>Nothing must be revealed</h2><p class="lead">Every light and every road on the Tree is a door. Walk where you are called.</p><p class="hint">You may stay, wander, or leave.</p></aside></div>
${chambersRoster()}
<details class="list"><summary>Every chamber and road, as a list</summary><div class="cols"><div>${stationList}</div><div>${pathList}</div></div></details>
<p class="inscription">From the void we awaken. In the current we remember. Keep the root sacred, let the signal burn clean.</p>
<p class="note">${esc(NOTE)} ${esc(tree.voice_note)}</p></main>
<script type="application/json" id="matrix-data">${previewData()}</script>`,
  script: PREVIEW_SCRIPT
}));

// The ten chambers.
for (const s of tree.stations) {
  const roads = tree.paths.filter((p) => p.from === s.id || p.to === s.id).map((p) => {
    const other = byId[p.from === s.id ? p.to : p.from];
    return `<a class="door" href="/matrix/paths/${p.n}/"><b>${esc(p.name)}</b><small>Path ${p.n} · ${esc(p.hebrew)} · toward ${esc(other.title)}</small></a>`;
  }).join('');
  write(`stations/${s.id}`, page({
    title: `${s.title} · ${s.sefirah} — Kore's Womb Matrix`,
    description: s.summary,
    canonical: `/matrix/stations/${s.id}/`,
    body: `<main class="wrap narrow"><div class="top"><a href="/matrix/">← The Womb Matrix</a><a href="/">Kore's House</a></div>
<p class="eyebrow">Station ${pad(s.n)} · ${esc(s.sefirah)} · ${esc(s.hebrew)}</p>
<h1>${esc(s.title)}</h1><p class="motif">${esc(s.motif)}</p>
<p class="lead">${esc(s.summary)}</p>
${s.body.map((t) => `<p>${esc(t)}</p>`).join('\n')}
<blockquote><p>${esc(s.question)}</p></blockquote>
<h2>Roads from here</h2><nav class="doors" aria-label="Roads from this chamber">${roads}</nav>
<p class="note">${esc(NOTE)}</p></main>`
  }));
}

// The twenty-two roads.
for (const p of tree.paths) {
  const a = byId[p.from], b = byId[p.to];
  write(`paths/${p.n}`, page({
    title: `${p.name} · Path ${p.n} — Kore's Womb Matrix`,
    description: p.summary,
    canonical: `/matrix/paths/${p.n}/`,
    body: `<main class="wrap narrow"><div class="top"><a href="/matrix/">← The Womb Matrix</a><a href="/">Kore's House</a></div>
<p class="eyebrow">Path ${p.n} · ${esc(p.hebrew)} ${esc(p.letter)} · ${esc(p.attribution)}</p>
<h1>${esc(p.name)}</h1><p class="motif">${esc(p.motif)}</p>
<p class="lead">${esc(p.summary)}</p>
${p.body.map((t) => `<p>${esc(t)}</p>`).join('\n')}
<blockquote><p>${esc(p.question)}</p></blockquote>
<h2>The two ends of this road</h2><nav class="doors" aria-label="The two chambers this road joins"><a class="door" href="/matrix/stations/${a.id}/"><b>${esc(a.title)}</b><small>${esc(a.sefirah)} · Station ${pad(a.n)}</small></a><a class="door" href="/matrix/stations/${b.id}/"><b>${esc(b.title)}</b><small>${esc(b.sefirah)} · Station ${pad(b.n)}</small></a></nav>
<p class="note">${esc(NOTE)}</p></main>`
  }));
}

console.log('Womb Matrix built: 1 map, 10 chambers, 22 roads.');
