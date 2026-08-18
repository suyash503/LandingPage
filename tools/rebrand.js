/* One-shot rebrand: Foldline (invented subscription agency) → Suyash Web
   Studio, first-person voice, Fiverr-style project packages, and a contact
   form that actually delivers. Kept for review; edit src/ and run build.js. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'foldline.template.html');
const PARTS = process.argv[2];
const read = (f) => fs.readFileSync(path.join(PARTS, f), 'utf8').replace(/\r\n/g, '\n');

let s = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');

/** Replace `before` with `after`, asserting it appears exactly `count` times. */
function sub(before, after, count = 1) {
  const hits = s.split(before).length - 1;
  if (hits !== count) throw new Error(`expected ${count}x, found ${hits}: ${before.slice(0, 70)}`);
  s = s.split(before).join(after);
}
/** Replace everything from `open` up to and including `close`. */
function region(open, close, replacement) {
  const a = s.indexOf(open);
  if (a === -1) throw new Error('region start not found: ' + open.slice(0, 60));
  const b = s.indexOf(close, a);
  if (b === -1) throw new Error('region end not found: ' + close.slice(0, 60));
  s = s.slice(0, a) + replacement.replace(/\n$/, '') + s.slice(b + close.length);
}

// ── head ──────────────────────────────────────────────────────────────────
sub('<title>Foldline — a landing page team on tap for $299 a month</title>',
    '<title>Suyash Web Studio — landing pages, designed and built</title>');
sub('content="Send a brief, get a designed landing page in 48 hours, revise until you\'re happy, and we build and publish it live. Unlimited requests, $299 a month, pause anytime."',
    'content="I design and build landing pages that convert — hand-coded, responsive, delivered with the source files. Two live demos you can open, and fixed prices from $120."');

// ── styles for tiers + form ───────────────────────────────────────────────
sub('  /* ───────── quick look (Popover API + view transitions) ───────── */',
    read('tiers.css') + '\n  /* ───────── quick look (Popover API + view transitions) ───────── */');

// ── brand marks ───────────────────────────────────────────────────────────
sub('font-size:25px;letter-spacing:-.01em">Foldline</span>',
    'font-size:25px;letter-spacing:-.01em">Suyash Web Studio</span>');
sub('display:inline-block"></span>Foldline</span>',
    'display:inline-block"></span>Suyash Web Studio</span>');
sub('© 2026 Foldline', '© 2026 Suyash Web Studio');
sub('>Foldline · 11:02<', '>Suyash · 11:02<');

// ── hero ──────────────────────────────────────────────────────────────────
region('      <sc-if value="{{ showBadge }}"',
       'margin:0 0 68px">Pause any month. Cancel anytime. Every file and account stays yours.</p>',
       read('hero2.html'));

// ── stat band ─────────────────────────────────────────────────────────────
sub('<div class="fl-stat-n" style="color:var(--gold,#E8C547)"><span class="fl-count" data-count="48">48</span> hrs</div><div class="fl-stat-l">To your first draft</div>',
    '<div class="fl-stat-n" style="color:var(--gold,#E8C547)"><span class="fl-count" data-count="3">3</span> days</div><div class="fl-stat-l">To your first draft</div>');
sub('<div class="fl-stat-n">Unlimited</div><div class="fl-stat-l">Requests &amp; revisions</div>',
    '<div class="fl-stat-n">Hand-coded</div><div class="fl-stat-l">No page builders</div>');
sub('<div class="fl-stat-n">$<span class="fl-count" data-count="299">299</span></div><div class="fl-stat-l">Flat, per month</div>',
    '<div class="fl-stat-n">$<span class="fl-count" data-count="120">120</span></div><div class="fl-stat-l">Projects start from</div>');

// ── how it works ──────────────────────────────────────────────────────────
sub('You write the brief. We do everything after it.', 'You describe the offer. I do everything after it.');
sub('No design calls to sit through, no revision threads to chase, no developer to hire afterwards. One portal, one queue, one bill.',
    'No agency onboarding, no discovery deck, no separate developer to hire once the design is signed off. One person, start to finish.');
sub('Brief it in ten minutes', 'Tell me the offer');
sub('A short form in your portal: the offer, the audience, the proof you hold. A voice note works just as well.',
    'What you sell, who buys it, and the proof you already hold. A voice note works just as well as a document.');
sub('First draft in 48 hours', 'First draft in 3 days');
sub('A designed page, structured around your offer — not a template with your logo dropped in.',
    'A designed page built around your offer — not a template with your logo dropped into it.');
sub('Comment until it\'s right', 'Comment until it&#39;s right');
sub('Click any element and leave a note. Revisions come back same day, as many rounds as it takes.',
    'Point at anything that is off and I revise it, usually the same day, within your package&#39;s rounds.');
sub('You approve, we publish', 'You approve, I hand over');
sub('We build the real page, wire the tracking and push it live on your domain. Nothing goes live before your yes.',
    'I build the real page, check it on a phone and hand you the files — deployed live too, on Complete and Studio.');

// The portal mock was a placeholder box; show a real build instead.
sub(`        <div style="background-image:repeating-linear-gradient(135deg,rgba(245,241,232,.05) 0 1px,transparent 1px 11px);display:flex;align-items:center;justify-content:center;text-align:center;padding:24px">
          <span style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,241,232,.4);line-height:1.9">Drop portal screenshot — page in review<br>1800 × 1000</span>
        </div>`,
`        <div style="overflow:hidden">
          <img src="assets/work/closebook.webp" width="1000" height="625" alt="A landing page draft under review" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top center">
        </div>`);
sub('Your portal', 'How revisions work');
sub('Request 07 — Spring offer page', 'Draft 2 — spring offer page');
sub('Approve &amp; publish', 'Approve &amp; hand over');

// ── what's included ───────────────────────────────────────────────────────
sub('Design, build, publish, and the files. If a step stands between your offer and a working page, it\'s in the subscription.',
    'Design, build, handover and the files. If a step stands between your offer and a working page, it is part of the job.');
sub('See the one price →', 'See the packages →');
sub('You give us the facts; we sharpen the headline, the proof and the CTA.',
    'You give me the facts; I sharpen the headline, the proof and the CTA.');
sub('On your domain, after your approval. We handle the deploy.',
    'On your domain, after your approval. I handle the deploy on Complete and Studio.');
sub('Design files and code handed over. Yours to keep, edit or take elsewhere.',
    'Design files and code handed over on every package. Yours to keep, edit or take elsewhere.');
sub('Live page needs a change? It\'s just another request in the queue.',
    'Studio includes 30 days of small edits after the page goes live.');
sub('Ongoing edits', 'Edits after launch');

// ── who it's for ──────────────────────────────────────────────────────────
sub('One request at a time keeps the queue honest — you always know exactly what we\'re working on.',
    'One project at a time keeps the schedule honest — you always know exactly where yours stands.');
sub('White-label us and keep your margin on the retainer.', 'White-label me and keep your margin on the build.');
sub('You can build anything; you\'d rather not design it.', 'You can build anything; you would rather not design it.');
sub('A fresh page per offer, per audience, every month.', 'A fresh page per offer, per audience, per campaign.');

// ── work section intro ────────────────────────────────────────────────────
sub('Both are live in this repo, not mockups in a case-study PDF. Every preview below is the real page rendering in a frame — open it full screen, resize it, read the copy, view the source.',
    'Both are live, not mockups in a case-study PDF. Every preview below is the real page rendering in a frame — open it full screen, resize it, read the copy, view the source.');
sub('Both projects are concept builds made to show range — the brands are invented, the craft is not. Client work is shared privately on request.',
    'Both projects are concept builds made to show range — the brands are invented, the craft is not. Client work is shared privately on request.');

// ── pricing → packages ────────────────────────────────────────────────────
region('  <sc-if value="{{ showPricing }}"', '  </sc-if>', read('pricing2.html'));

// ── faq ───────────────────────────────────────────────────────────────────
sub('The things people ask before their first brief.', 'The things people ask before they book.');
region('        <div>\n          <details style="border-top:1px solid rgba(245,241,232,.12);padding:26px 0">',
       '</details>\n        </div>', read('faq2.html'));

// ── contact ───────────────────────────────────────────────────────────────
region('  <section id="start"', '  </section>\n', read('start2.html') + '\n');

// ── sticky bar ────────────────────────────────────────────────────────────
sub('<strong style="font-weight:600;color:#F5F1E8">$299/month, unlimited requests.</strong> Three slots open for September.',
    '<strong style="font-weight:600;color:#F5F1E8">Landing pages from $120.</strong> First draft in three days.');
sub('border-radius:999px" style-hover="background:var(--gold-deep,#C9A62F);color:#0B0A09">Claim a slot</a>',
    'border-radius:999px" style-hover="background:var(--gold-deep,#C9A62F);color:#0B0A09">Start a project</a>');

// remaining CTA labels
s = s.split('>Claim a slot<').join('>Start a project<');
s = s.split('>Claim a September slot<').join('>Start a project<');

// ── component logic: real form submission ─────────────────────────────────
sub('  state = { submitted: false };',
    "  // ⚠ Paste your Formspree endpoint here (https://formspree.io/f/xxxxxxxx).\n" +
    "  //   Until you do, the form shows an error instead of silently losing enquiries.\n" +
    "  static FORM_ENDPOINT = 'https://formspree.io/f/PASTE_YOUR_FORM_ID';\n\n" +
    '  state = { submitted: false, sending: false, error: null };');
region('  renderVals() {', '}\n</script>', read('rendervals.js') + '\n</script>');

fs.writeFileSync(SRC, s, 'utf8');
console.log('rebranded:', s.length, 'bytes');
