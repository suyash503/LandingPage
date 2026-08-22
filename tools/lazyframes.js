/* Put the two live previews behind a click. Auto-loading them pulled ~1.4MB
   of project bundles on every visit; now the poster carries the card until
   someone actually asks to see it move. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'foldline.template.html');
let s = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');

function sub(before, after, count = 1) {
  const hits = s.split(before).length - 1;
  if (hits !== count) throw new Error(`expected ${count}x, found ${hits}: ${before.slice(0, 70)}`);
  s = s.split(before).join(after);
}

// ── the frames no longer carry a src; the badge becomes the trigger ───────
for (const [file, label] of [
  ['1/Closebook.html', 'Closebook'],
  ['2/Cedar%20Basin%20Hero.dc.html', 'Cedar Basin']
]) {
  sub(`<iframe class="fl-live" src="${file}" title="${label}, live preview" loading="lazy" tabindex="-1" aria-hidden="true" scrolling="no"></iframe>
            <span class="fl-badge"><i></i>Live preview</span>`,
      `<iframe class="fl-live" data-src="${file}" title="${label}, live preview" loading="lazy" tabindex="-1" aria-hidden="true" scrolling="no"></iframe>
            <button class="fl-badge" type="button" data-loadlive=""><i></i><span class="fl-badge-t">Load live preview</span></button>`);
}

// ── badge is interactive now ──────────────────────────────────────────────
sub(`  .fl-badge i { width: 6px; height: 6px; border-radius: 999px; background: var(--gold,#E8C547); animation: om-pulse 2s ease-in-out infinite; }`,
`  .fl-badge i { width: 6px; height: 6px; border-radius: 999px; background: var(--gold,#E8C547); animation: om-pulse 2s ease-in-out infinite; flex: 0 0 auto; }
  button.fl-badge { cursor: pointer; font-family: inherit; }
  button.fl-badge:hover { background: rgba(11,10,9,.92); border-color: rgba(232,197,71,.55); color: var(--fl-ink); }
  .fl-badge[data-state="live"] { cursor: default; }
  .fl-badge[data-state="loading"] i { animation-duration: .7s; }`);

// ── click handler, next to the other work-section behaviour ───────────────
sub(`    // ── package chips ────────────────────────────────────────────────────`,
`    // ── live previews load on request ────────────────────────────────────
    // Each project is its own self-contained bundle (~470KB and ~970KB), so
    // they stay unrequested until someone asks. The poster holds the frame
    // until then, and the frame paints over it once it is ready.
    document.querySelectorAll('[data-loadlive]').forEach((btn) => {
      on(btn, 'click', () => {
        const frame = btn.closest('.fl-stage')?.querySelector('.fl-live');
        const label = btn.querySelector('.fl-badge-t');
        if (!frame || frame.getAttribute('src')) return;
        btn.setAttribute('data-state', 'loading');
        if (label) label.textContent = 'Loading…';
        frame.addEventListener('load', () => {
          btn.setAttribute('data-state', 'live');
          if (label) label.textContent = 'Live';
        }, { once: true });
        frame.setAttribute('src', frame.getAttribute('data-src'));
      });
    });

    // ── package chips ────────────────────────────────────────────────────`);

// ── say so in the section intro ───────────────────────────────────────────
sub('Both are live, not mockups in a case-study PDF. Every preview below is the real page rendering in a frame — open it full screen, resize it, read the copy, view the source.',
    'Both are live, not mockups in a case-study PDF. Hit <em style="font-style:normal;color:var(--gold,#E8C547)">Load live preview</em> and the real page renders right there in the card — or open it full screen, resize it, read the copy, view the source.');

fs.writeFileSync(SRC, s, 'utf8');
console.log('previews gated behind a click');
