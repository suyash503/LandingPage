/* Wire the enquiry form to FormSubmit: minimal fields, one-tap package chips
   that pre-select from the pricing CTAs, and a real delivery path to the
   studio inbox. Run once; edit src/ and tools/build.js from here on. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'foldline.template.html');
const PARTS = process.argv[2];
const read = (f) => fs.readFileSync(path.join(PARTS, f), 'utf8').replace(/\r\n/g, '\n');

let s = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');

function sub(before, after, count = 1) {
  const hits = s.split(before).length - 1;
  if (hits !== count) throw new Error(`expected ${count}x, found ${hits}: ${before.slice(0, 70)}`);
  s = s.split(before).join(after);
}
function region(open, close, replacement) {
  const a = s.indexOf(open);
  if (a === -1) throw new Error('region start not found: ' + open.slice(0, 60));
  const b = s.indexOf(close, a);
  if (b === -1) throw new Error('region end not found: ' + close.slice(0, 60));
  s = s.slice(0, a) + replacement.replace(/\n$/, '') + s.slice(b + close.length);
}

// ── chip styles ───────────────────────────────────────────────────────────
sub('  /* ───────── enquiry form ───────── */',
    read('chips.css') + '\n  /* ───────── enquiry form ───────── */');

// ── form markup ───────────────────────────────────────────────────────────
region('        <form class="fl-form"', '</form>\n', read('form.html') + '\n');

// A shorter promise now that the form asks for almost nothing.
sub("What you sell, who buys it, and when you need it live. I'll reply with a fixed price and a delivery date — usually the same day.",
    "Three taps and you're done. I'll reply with a fixed price and a delivery date, usually the same day.");

// ── pricing CTAs carry the package through to the form ────────────────────
sub('<a class="fl-btn" href="#start">Start with Starter</a>',
    '<a class="fl-btn" href="#start" data-pick="pk-starter">Start with Starter</a>');
sub('<a class="fl-btn" data-primary="" href="#start">Start with Complete</a>',
    '<a class="fl-btn" data-primary="" href="#start" data-pick="pk-complete">Start with Complete</a>');
sub('<a class="fl-btn" href="#start">Start with Studio</a>',
    '<a class="fl-btn" href="#start" data-pick="pk-studio">Start with Studio</a>');
sub('<a class="fl-btn" href="#start">Ask for a quote',
    '<a class="fl-btn" href="#start" data-pick="pk-unsure">Ask for a quote');

// ── behaviour: default chip + pre-select from a pricing CTA ───────────────
sub(`    // ── count-up on first view ───────────────────────────────────────────`,
`    // ── package chips ────────────────────────────────────────────────────
    // \`checked\` is left out of the markup on purpose: the runtime would turn
    // it into a controlled React prop with no onChange and freeze the radios.
    const pick = (id) => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    };
    pick('pk-unsure');
    document.querySelectorAll('[data-pick]').forEach((cta) => {
      on(cta, 'click', () => pick(cta.getAttribute('data-pick')));
    });

    // ── count-up on first view ───────────────────────────────────────────`);

// ── submission ────────────────────────────────────────────────────────────
region('  // Static hosting has no backend', '}\n\n</script>', read('send.js') + '\n</script>');
region('  // ⚠ Paste your Formspree endpoint here', "\n  state =", '\n  state =');

fs.writeFileSync(SRC, s, 'utf8');
console.log('form wired:', s.length, 'bytes');
