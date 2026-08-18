/* One-shot patch that turned the published Foldline page into the portfolio
   build: real work section, modern CSS layer, responsive grids, honest copy.
   Kept in the repo so the edit is reviewable; `tools/build.js` is what you
   run after editing `src/foldline.template.html` by hand. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'foldline.template.html');
const PARTS = process.argv[2];
const read = (f) => fs.readFileSync(path.join(PARTS, f), 'utf8').replace(/\r\n/g, '\n');

let lines = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n').split('\n');

/** Replace the inclusive line range [from, to] with `text`. */
function splice(from, to, text) {
  lines.splice(from, to - from + 1, ...text.replace(/\n$/, '').split('\n'));
}
/** First index whose line contains `needle`, searching from `start`. */
function find(needle, start = 0) {
  const i = lines.findIndex((l, n) => n >= start && l.includes(needle));
  if (i === -1) throw new Error('anchor not found: ' + needle);
  return i;
}
/** Exactly-once string substitution across the whole template. */
function sub(before, after) {
  const i = find(before);
  if (lines.filter((l) => l.includes(before)).length !== 1)
    throw new Error('anchor is not unique: ' + before);
  lines[i] = lines[i].split(before).join(after);
}

// ── 1. modern CSS layer, appended inside <helmet> ────────────────────────
splice(find('</helmet>'), find('</helmet>'), read('new.css') + '\n</helmet>');

// ── 2. fixed-position chrome that has to sit outside the sticky header ───
sub(
  '<div style="width:100%;background:#0B0A09;overflow-x:hidden;position:relative">',
  '<div style="width:100%;background:#0B0A09;overflow-x:hidden;position:relative">\n' +
    '\n  <div class="fl-progress" aria-hidden="true"></div>\n' +
    '  <div class="fl-spot" aria-hidden="true"></div>\n'
);

// ── 3. nav: scroll-spy links + a small-screen sheet ──────────────────────
const navStart = find('<nav style="display:flex;align-items:center;gap:34px">');
const navEnd = find('</nav>', navStart);
splice(navStart, navEnd, `      <nav class="fl-navwrap" style="display:flex;align-items:center;gap:34px">
        <a class="fl-navlink" href="#work" style="font-size:14.5px;color:rgba(245,241,232,.66)">Work</a>
        <a class="fl-navlink" href="#how" style="font-size:14.5px;color:rgba(245,241,232,.66)">How it works</a>
        <a class="fl-navlink" href="#included" style="font-size:14.5px;color:rgba(245,241,232,.66)">What's included</a>
        <a class="fl-navlink" href="#pricing" style="font-size:14.5px;color:rgba(245,241,232,.66)">Pricing</a>
        <a href="#start" style="background:var(--gold,#E8C547);color:#0B0A09;font-size:14.5px;font-weight:600;padding:12px 22px;border-radius:999px;box-shadow:0 0 0 1px rgba(232,197,71,.4),0 8px 30px -12px rgba(232,197,71,.6);transition:transform .18s ease" style-hover="background:var(--gold-deep,#C9A62F);color:#0B0A09;transform:translateY(-1px)">Claim a slot</a>
      </nav>
      <button class="fl-menu" type="button" aria-label="Open the menu">Menu</button>`);

sub('</header>', `</header>

  <div class="fl-sheet" id="fl-nav-sheet" popover="auto">
    <a href="#work">Work</a>
    <a href="#how">How it works</a>
    <a href="#included">What's included</a>
    <a href="#pricing">Pricing</a>
    <a href="#start">Claim a slot</a>
  </div>`);

// ── 4. hero: placeholder collage → real screenshots + ticker ─────────────
const heroStart = find('<div style="position:relative;padding:0 0 84px">');
splice(heroStart, find('  </section>', heroStart), read('hero.html'));

// ── 5. stat band: drop the invented client counts ────────────────────────
const statStart = find('<div style="max-width:1240px;margin:0 auto;padding:34px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:32px">');
splice(statStart, statStart + 5, `    <div class="fl-stats" data-pad="">
      <div><div class="fl-stat-n" style="color:var(--gold,#E8C547)"><span class="fl-count" data-count="48">48</span> hrs</div><div class="fl-stat-l">To your first draft</div></div>
      <div><div class="fl-stat-n">Unlimited</div><div class="fl-stat-l">Requests &amp; revisions</div></div>
      <div><div class="fl-stat-n">$<span class="fl-count" data-count="299">299</span></div><div class="fl-stat-l">Flat, per month</div></div>
      <div><div class="fl-stat-n"><span class="fl-count" data-count="2">2</span></div><div class="fl-stat-l">Live demos you can open</div></div>
    </div>`);

// ── 6. work section → the two real projects ──────────────────────────────
const workStart = find('<section id="work"');
splice(workStart, find('  </section>', workStart), read('work.html'));

// ── 7. remaining invented social proof ───────────────────────────────────
sub('most members ship three to five pages a month',
    'a typical month is three to five pages');
sub('Pause any month · Cancel anytime · 74 members, 318 pages live',
    'Pause any month · Cancel anytime · Every file and account stays yours');

// ── 8. responsive classes on the grids that had no breakpoints ───────────
const GRIDS = [
  ['repeat(5,1fr)', 'fl-g5'],
  ['repeat(4,1fr)', 'fl-g4'],
  ['repeat(3,1fr)', 'fl-g3'],
  ['1fr 300px', 'fl-aside'],
  ['.85fr 1.15fr', 'fl-split'],
  ['1.15fr .85fr', 'fl-split'],
  ['.72fr 1.28fr', 'fl-split'],
  ['1fr 1fr', 'fl-g2']
];
let tagged = 0;
lines = lines.map((line) => {
  if (!line.includes('grid-template-columns:') || line.includes('class="fl-')) return line;
  const hit = GRIDS.find(([cols]) => line.includes('grid-template-columns:' + cols));
  if (!hit) return line;
  tagged++;
  return line.replace(/<div style="/, `<div class="${hit[1]}" style="`);
});

// ── 9. horizontal padding + section rhythm knobs for small screens ───────
let padded = 0;
lines = lines.map((line) => {
  if (!/padding:1[0-9]{2}px 40px|padding:0 40px|padding:44px 40px 64px|padding:14px 40px/.test(line)) return line;
  if (line.includes('data-pad=')) return line;
  padded++;
  return line.replace(/(<(?:div|section|footer|header)\b)/, '$1 data-pad="" data-tight=""');
});

// ── 10. component logic ──────────────────────────────────────────────────
const logicStart = find('class Component extends DCLogic {');
splice(logicStart, find('</script>', logicStart) - 1, read('logic.js'));

fs.writeFileSync(SRC, lines.join('\n'), 'utf8');
console.log(`patched: ${tagged} grids tagged, ${padded} containers padded, ${lines.length} lines`);
