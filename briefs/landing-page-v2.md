# Brief — Suyash Web Studio landing page, v2

**How to use this:** open Claude Code in the repo root and paste this whole file
as the prompt. Part I is context — read it, do not re-derive it. Part II is the
work. Everything in Part II is a requirement unless it says *optional*.

**Deliverable:** an edited `src/foldline.template.html`, rebuilt into
`index.html` via `node tools/build.js`; vendored library builds under
`assets/vendor/`; new assets under `assets/`.

**The one rule that breaks everything if ignored:** `index.html` is a generated
bundle. Never hand-edit it. Edit `src/foldline.template.html`, then run
`node tools/build.js`. See §1.1.

---

# Part I — What exists today

## 1. Architecture

### 1.1 The build pipeline

| Thing | Where | Notes |
|---|---|---|
| Source of truth | `src/foldline.template.html` | ~1,210 lines. All markup, CSS and JS. |
| Published bundle | `index.html` | ~280KB. Generated. **Never edit by hand.** |
| Build | `node tools/build.js` | Re-injects the template into the bundle |
| Host | GitHub Pages, `main` branch root | `.nojekyll` present; served under `/LandingPage/` |

`index.html` came out of a visual page editor. It stores the entire template as
**one JSON-encoded line** inside a `<script type="__bundler/template">` tag,
alongside an asset manifest mapping UUIDs (`912e2f4a-…`) to the font files and
the editor runtime. `tools/build.js` finds that line, re-encodes the template
with `JSON.stringify`, and escapes the closing-tag sequence exactly the way the
publisher does. It normalises CRLF so a Windows checkout cannot change the
output.

Consequence: a one-word copy change shows up as a 280KB single-line diff in
`index.html`. That is expected. Review the diff on
`src/foldline.template.html`, not on the bundle.

**Precedent that matters for Part II:** the repo already depends on `motion`
(`^13.1.1` in `package.json`) and already ships a hand-vendored mini build at
`4/motion-mini.js` for the Northgate demo. So "vendor a tree-shaken build,
commit it, no deploy-time step" is an established pattern here, not a new idea.

### 1.2 The runtime it is written against

The template targets the editor's own component runtime, not plain HTML:

- `<x-dc>` wraps the document body; `<helmet>` holds the `<style>` blocks.
- `<sc-if value="{{ showPricing }}">` conditionally renders a subtree.
- `{{ submitLabel }}` and `{{ submit }}` bind to a `renderVals()` return object.
- `style-hover="…"` and `style-focus="…"` are runtime-expanded pseudo-class
  attributes, used on inline-styled elements that have no CSS class.
- Logic lives in a `text/x-dc` script as `class Component extends DCLogic`, with
  React-shaped lifecycle: `componentDidMount`, `componentDidUpdate`,
  `componentWillUnmount`, `state`, `setState`, `props`.
- Editor-exposed props are declared in `data-props` JSON: `accentColor`
  (colour picker, four presets), `showBadge`, `showPricing`.

**This matters enormously for Part II.** `componentDidMount` / `componentWillUnmount`
is where a WebGL scene has to be created and destroyed. The existing code already
models the discipline: every listener goes through an `on()` helper that pushes
its teardown onto `this.cleanup`, and all three observers are disconnected on
unmount. A renderer, a RAF loop, geometries, materials and textures must follow
the same contract or the editor will leak a GPU context on every re-render.

One live gotcha is already documented in the source: the runtime turns a static
`checked` attribute into a controlled React prop with no `onChange` and freezes
the radios, so the package chips are pre-selected imperatively in JS
(`pick('pk-unsure')`) instead.

## 2. Design language today

### 2.1 Colour

| Role | Value | Where |
|---|---|---|
| Page ground | `#0B0A09` | `html`, `body` |
| Raised ground | `#0E0D0B` | alternating sections (`#included`, `#work`, `#faq`) |
| Card ground | `#100F0D` / `#131210` | work cards / chrome bars |
| Ink | `#F5F1E8` (`--fl-ink`) | body text |
| Muted ink | `rgba(245,241,232,.62)` (`--fl-mute`) | paragraphs |
| Hairline | `rgba(245,241,232,.12)` (`--fl-line`) | borders |
| Accent | `#E8C547` (`--gold`) | CTAs, eyebrows, numerals, check marks |
| Accent deep | `#C9A62F` (`--gold-deep`) | CTA hover |

Dark only — `color-scheme: dark`, no light palette, no `prefers-color-scheme`
branch. The accent is swappable at runtime by the `accentColor` prop, which sets
`--gold` and `--gold-deep` on `:root`.

**The token layer is thin.** Seven custom properties exist. Every other value —
roughly 120 distinct `rgba(245,241,232,…)` and `rgba(232,197,71,…)` literals —
is written inline on the element. Changing the ink colour today means a
find-and-replace across 1,200 lines.

### 2.2 Typography

| Use | Family | Notes |
|---|---|---|
| Display, headings, prices, logotype | **Instrument Serif** 400, roman + italic | Self-hosted woff2, latin + latin-ext, `font-display: swap` |
| Body, UI, buttons, inputs | `'Helvetica Neue', Helvetica, Arial, sans-serif` | System stack. No webfont. |

Headings run from `clamp(32px, 3.6vw, 48px)` to `clamp(50px, 7vw, 94px)` with
`letter-spacing: -.02em` and `text-wrap: balance`. Eyebrows are 11.5px, `.18em`
tracking, uppercase, accent-coloured. Body sits at 15–20px with 1.55–1.65
line-height and `text-wrap: pretty`.

**This is the single biggest gap between the page and its own pitch.** A studio
selling art direction is setting all of its running text in Arial.

### 2.3 Layout and spacing

- Content max-width `1240px`; hero `1010px`; form `560px`; FAQ split
  `.72fr 1.28fr`; "What's included" split `.85fr 1.15fr`.
- Section rhythm: `120–128px` block padding, `40px` inline, dropping to `78px`
  and `22px` below 860px via the `[data-pad]` / `[data-tight]` attribute hooks.
- Radii: `10px` small cards · `12px` panels · `14px` work cards, tiers, inputs ·
  `16px` quick-look · `999px` buttons, chips, tags.
- No spacing scale. Every gap is a bespoke number: 7, 9, 10, 11, 14, 16, 18, 20,
  22, 24, 26, 28, 32, 34, 40, 46, 52, 56, 68, 72.

### 2.4 Section inventory, in DOM order

| # | Section | id | Contents |
|---|---|---|---|
| 1 | Sticky header | — | Diamond mark + logotype, four nav links with scroll-spy underline, gold CTA pill, `Menu` button below 860px |
| 2 | Mobile nav sheet | `fl-nav-sheet` | Popover API bottom sheet |
| 3 | Hero | `top` | Status badge, 94px serif headline with an italic accent word, subhead, two CTAs, reassurance line |
| 4 | Hero showcase strip | — | Three screenshot plates, centre one raised and larger, each linking to a live demo |
| 5 | Marquee ticker | — | 44s infinite drift, pauses on hover, `aria-hidden` |
| 6 | Stat band | — | Four stats, count-up on first view |
| 7 | How it works | `how` | Four numbered cards plus a faux review UI with a comment thread |
| 8 | What's included | `included` | Split heading plus six checked cards |
| 9 | Who it's for | — | Five audience cards |
| 10 | Selected work | `work` | Four project cards (Northgate featured), each poster → live iframe → quick-look |
| 11 | Quick-look popovers | `ql-*` | Four full-screen iframe modals with faux browser chrome |
| 12 | Pricing | `pricing` | Three tiers, Complete flagged "Most picked" |
| 13 | FAQ | `faq` | Six `<details>` |
| 14 | Enquiry | `start` | Email + package radio chips + optional textarea → FormSubmit |
| 15 | Footer | — | Logotype, four links, copyright |
| 16 | Sticky CTA bar | — | Slides up past `scrollY > 900` |

## 3. Feature and interaction inventory

**CSS-only, no JS:**

- Scroll-driven read-progress bar via `animation-timeline: scroll(root block)`.
- Scroll-driven reveals via `animation-timeline: view()`, with staggered
  `animation-range` on `[data-stagger] > *` children 1–3. These animate
  `translate` rather than `transform` specifically so the hover tilt still
  composes on top.
- Animated conic hairline on the featured work card, driven by a typed
  `@property --fl-sheen` angle.
- `@view-transition { navigation: auto }` for cross-document transitions.
- Marquee, nav underline wipe, tier and card hover lifts, focus rings.

**JS, all in `componentDidMount`:**

| Feature | Mechanism |
|---|---|
| Nav border darkens past 16px; sticky CTA appears past 900px | passive scroll listener |
| Reveal fallback | `IntersectionObserver`, used only when `CSS.supports('animation-timeline','view()')` is false |
| Pointer spotlight | 680px radial gradient tracking `--ptr-x` / `--ptr-y`, fine pointers only |
| Card tilt | pointermove → `--rx` / `--ry`, capped at 5° / 4° |
| Quick look | Popover API + `document.startViewTransition`, morphing the card poster into the modal through a shared `view-transition-name`; falls back to `window.open` |
| Mobile nav | Popover API sheet |
| Scroll-spy | `IntersectionObserver` with `-45% / -50%` root margin |
| On-demand live previews | Click sets `src` from `data-src`; badge goes `Load live preview` → `Loading…` → `Live` |
| Count-up | `IntersectionObserver` at 0.6 threshold, 1.1s cubic ease-out |
| Package chips | `[data-pick]` CTAs pre-select the matching radio before the anchor jump |
| Enquiry submit | `fetch` to FormSubmit AJAX with a honeypot field — and, importantly, it distrusts the 200 and reads `data.success`, because FormSubmit answers 200 on refusal |

## 4. Responsive, accessibility, performance

**Responsive** — the published page shipped with no breakpoints; they were added
afterwards as an override block using `!important`, at 1080 / 860 / 560. The
work grid collapses to one column at 1080. The nav swaps to the sheet at 860.
Chips grow to a 13px touch target at 560.

**Accessibility** — `:focus-visible` gold ring throughout; visually hidden but
still focusable radio inputs behind styled labels; `role="radiogroup"` with a
label; `aria-hidden` on the decorative ticker, spotlight and progress bar;
`aria-label` on the plates and the menu button; and a full
`prefers-reduced-motion` block that kills animation, the spotlight, the tilt and
the view transition.

**Performance** — the demos are 470KB–970KB self-contained bundles, so the work
cards keep their iframes unrequested until clicked. Posters are WebP at
1000×625 with explicit dimensions, `loading="lazy"` and `decoding="async"`; only
the hero centre plate is `fetchpriority="high"`. Fonts are self-hosted woff2,
subset, `font-display: swap`, with `preconnect` retained.

## 5. Known defects and gaps

These are real and verified. v2 should close them.

1. **The stat band lies.** It reads "2 — Live demos you can open" with
   `data-count="2"`. There are four. `src/foldline.template.html:518`
2. **Body type is Arial.** See §2.2.
3. **No social card.** Zero `og:*`, `twitter:*`, `rel=canonical`, `rel=icon` or
   JSON-LD in the head. Every share of this URL renders as a bare link.
4. **No `robots.txt`, `sitemap.xml` or `404.html`.**
5. **No social proof.** No testimonial, no client name, no result, no "who I
   have worked with". The FAQ concedes the demos are concept builds. A
   conversion page has nothing to convert with.
6. **Live-preview iframes can hang.** They carry `loading="lazy"`, so in a
   throttled or backgrounded tab the badge sits on "Loading…" indefinitely.
7. **`2/` filenames contain spaces**, so every link needs `%20`. `3/` and `4/`
   are already lowercase-hyphenated. The previous brief called this out and it
   was never fixed.
8. **The FAQ `+` never becomes `−`.** There is no `details[open]` styling.
9. **`#faq` and `#top` have ids but no nav link**, so scroll-spy has holes.
10. **The sticky CTA threshold is a magic `900`**, tied to no element.
11. **The studio inbox address is in the page source** as the FormSubmit
    endpoint — the source comment acknowledges it and points at the alias.
12. **Only one of four stats can count up** ("Hand-coded" is a word), so the
    band animates unevenly.
13. **The footer reads © 2026** with no auto-year.

---

# Part II — v2: the brief

## 6. What "10x" means here

Not "more animation." This page already carries more motion than most agency
sites. It is undersold in five specific ways, and v2 is judged on those five:

| Axis | Today | v2 target |
|---|---|---|
| **Craft signal** | Arial body, ad-hoc spacing, ~120 colour literals | A real type pairing and a real token system, legible in the first 400ms |
| **Dimension** | A flat document with hover tilt | A rendered scene the visitor can move through — real depth, real light, real material |
| **Proof** | Four concept demos, self-described as invented | Layered evidence: build receipts, measured budgets, named constraints met |
| **Depth** | Cards link out; nothing explains a decision | One flagship case study that shows the thinking, not only the screenshot |
| **Reach** | Unshareable, unindexed, dark-only | Social card, structured data, light mode |

If a change does not move one of those five, it is out of scope.

## 7. The rendering stack

### 7.1 The argument, and the copy change it forces

The FAQ currently reads: *"Neither. Pages are hand-written HTML and CSS, so
there is no plugin to renew, no builder licence, and nothing to slow the page
down."*

That claim is about **client deliverables** and it stays true. This site is a
different product: it is the showroom, and a showroom is allowed to demonstrate
a capability the standard package does not include. But leaving the copy as-is
while the hero runs a WebGL scene reads as a contradiction to anyone who looks.

**Add one clause to that FAQ answer**, near the end:

> *"This site runs a WebGL scene in its hero because showing you is better than
> telling you. Your page won't, unless you ask for it — and if you ask, that is
> what Studio is for."*

That converts the tension into a sales argument. It is the difference between
a portfolio that has effects and a portfolio that has a position.

### 7.2 The tools

| Tool | Version | Job | Budget (gz) |
|---|---|---|---|
| **three** | r170+ | `WebGLRenderer` for the atmospheric layer, `CSS3DRenderer` for the live demo plates | ≤ 60KB tree-shaken |
| **GSAP** + ScrollTrigger + SplitText | 3.13+ | Scroll choreography, pinning, scrub, per-character headline reveal | ≤ 20KB |
| **Lenis** | 1.x | Smooth-scroll normalisation, driving ScrollTrigger | ≤ 3KB |
| **postprocessing** (pmndrs) | latest | *Optional.* Selective bloom on the accent | ≤ 15KB |
| **esbuild** | latest | The vendoring step — dev dependency only | 0 shipped |
| **lil-gui**, **stats.js** | latest | Shader/uniform tuning during development | 0 shipped — must be stripped |
| **sharp** or Squoosh CLI | latest | Poster and OG-image pipeline | 0 shipped |

**On GSAP vs. the existing `motion` dependency:** `motion@13` is already in
`package.json` and vendored at `4/motion-mini.js`. Leave the Northgate demo on
it — that page is out of scope. For the landing page, use **GSAP**. ScrollTrigger's
pinning and scrub have no equivalent, SplitText is free as of 3.13, and the
scroll choreography in §13 depends on both. Do not run two animation libraries
on the same page; whatever is picked, everything on the landing page uses it.

**Do not use a CDN.** Vendor everything.

### 7.3 Vendoring

Add `tools/vendor.js`, an esbuild script that bundles, tree-shakes and minifies
each library into `assets/vendor/`, and **commit the output**. Rationale:
GitHub Pages has no build step, the repo must stay clone-and-open, and the
`4/motion-mini.js` precedent already works this way.

```
assets/vendor/three.min.js        # WebGLRenderer, CSS3DRenderer, and only what the scene imports
assets/vendor/gsap.min.js         # core + ScrollTrigger + SplitText
assets/vendor/lenis.min.js
```

Import them as ES modules from the template with an `importmap`, or as classic
scripts before the `text/x-dc` block — whichever the editor runtime tolerates.
**Test this early.** The DC runtime's script handling is the single biggest
unknown in this brief; if module scripts do not survive the bundler round-trip,
fall back to classic scripts that assign to `window`, and find out on day one
rather than day six.

### 7.4 The four rules that keep this from ruining the page

1. **WebGL is an enhancement layer, never the content layer.** Every word,
   link, price and form field lives in normal DOM. Kill the canvas and the page
   must still be complete, beautiful and fully usable. The existing CSS radial
   hero is the fallback and it stays in the stylesheet.
2. **One WebGL surface.** The hero. A second canvas elsewhere doubles the cost
   and halves the impact. Restraint is what reads as sophisticated; a site with
   shaders in five sections reads as a tech demo.
3. **Gated hard.** The scene initialises only when *all* of these hold:
   `matchMedia('(pointer: fine)')`, no `prefers-reduced-motion`, no
   `navigator.connection.saveData`, `navigator.hardwareConcurrency >= 4`,
   viewport ≥ 1080px, a WebGL2 context is obtainable, and the `load` event has
   fired — then inside a `requestIdleCallback`. It must never compete with LCP.
4. **It must clean up.** In `componentWillUnmount`: cancel the RAF, dispose every
   geometry, material and texture, `renderer.dispose()`, remove the canvas, and
   drop the resize and pointer listeners through the existing `this.cleanup`
   array. Also pause the RAF on `document.hidden` and when the hero leaves the
   viewport — an idle background scene burning GPU below the fold is the most
   common way sites like this tank a battery.

## 8. Workstream A — Foundations (do this first)

Everything else, the shader included, depends on it.

### A1. A real token layer

Promote every repeated literal to a custom property on `:root`. Minimum set:

```
--bg, --bg-raised, --bg-card, --bg-bar
--ink, --ink-muted, --ink-faint, --ink-ghost
--line, --line-strong, --accent, --accent-deep, --accent-wash
--space-1 … --space-12    (4 8 12 16 20 24 32 40 56 72 96 128)
--radius-sm / -md / -lg / -xl / -pill
--shadow-card, --shadow-lift, --shadow-modal
--ease (the existing --fl-ease), --dur-fast / -base / -slow
```

Sweep the inline styles onto them section by section, rebuilding and eyeballing
between each — a 1,200-line find-and-replace will silently change something.
Keep `--gold` and `--gold-deep` as aliases so the `accentColor` prop keeps
working.

**This is a hard prerequisite for §10.** The shader reads its palette from
`getComputedStyle(document.documentElement)` at init and on theme change. With
120 scattered literals there is nothing coherent for it to read.

**Acceptance:** changing `--ink` on `:root` restyles the whole page. Fewer than
20 raw `rgba(245,241,232` literals remain.

### A2. Light mode

Define the light palette by redefining tokens only, gated as:

```css
:root { /* dark values — the design's home */ }
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { /* … */ }
}
:root[data-theme="light"] { /* … */ }
```

Add a header toggle that writes `data-theme` to `<html>` and persists it to
`localStorage` inside `try/catch`. Ship an explicit "System" state.

The light palette is not an inversion. Ground `#FAF7F0`, ink `#14120E`, accent
darkened to roughly `#A8830F` so it clears 4.5:1 on the light ground.

**The WebGL scene must re-tint with it.** On theme change, re-read the tokens
and `gsap.to()` the shader's colour uniforms across `--dur-slow`. In light mode
drop `uIntensity` to roughly a third — a gold caustic field that looks
expensive on near-black looks like a coffee stain on cream.

**Acceptance:** both themes pass 4.5:1 for body text and 3:1 for large text and
UI borders. No colour is defined *only* inside a media block. Toggling the theme
with the scene running produces a smooth cross-fade, not a pop.

### A3. A fluid type scale

Replace the ad-hoc `clamp()` calls with a named ramp (`--step--1` … `--step-7`)
and use it everywhere, including the sections that hard-code `20px`, `16.5px`,
`14.5px`.

## 9. Workstream B — Typography

**Kill the Arial.** Instrument Serif stays as the display face; it is doing its
job. Pair it with one text face, self-hosted woff2 alongside the existing fonts,
subset to latin + latin-ext, two weights maximum.

Ranked options:

1. **A neutral grotesque with a high x-height** — Söhne, Inter Tight, General
   Sans. Safest; reads as "modern studio."
2. **A text serif — Newsreader or Source Serif 4.** Serif on serif. Riskier, far
   more distinctive, and the right call if v2 wants to read as *editorial*
   rather than *SaaS*. Requires tightening the display face's tracking so the
   two do not compete.
3. **A grotesque with a genuinely good italic** — the hero already leans on an
   italic accent word, and repeating that device in running text is cheap
   sophistication.

Whichever is chosen: one text family, two weights (400/600), `font-display: swap`,
and an explicit `size-adjust` on the fallback so the swap does not shift layout.
Font payload must not exceed **+80KB** over today.

Then set the details that separate a designed page from a styled one:
`font-variant-numeric: tabular-nums` on every price, stat and count-up (partly
present — make it universal); `text-wrap: balance` on every heading and `pretty`
on every paragraph (partly present — make it universal); optical adjustment of
the eyebrow tracking; running-text `max-width` in `ch` rather than `em`.

**Acceptance:** no `Helvetica` or `Arial` string remains in the template except
as the final fallback in a single stack.

## 10. Workstream C — The hero as a rendered scene

This is the centrepiece. Today's hero — "I design and build landing pages that
convert" over a static radial glow — is the same hero as every freelancer on the
internet, and the plate strip below it is the only part doing work.

Rebuild it as **three composited layers sharing one camera**.

### Layer 1 — the atmospheric field (`WebGLRenderer`)

A full-viewport plane running a fragment shader, `alpha: true`, sitting behind
all content at `z-index: 0`.

- **Signal:** three-octave FBM, domain-warped —
  `fbm(p + fbm(p + fbm(p)))` — producing a slow gold caustic that never
  repeats visibly. Masked by a radial falloff so it fades out before the
  viewport edges and never fights the header.
- **Uniforms:** `uTime`, `uPointer` (vec2, lerped toward the real pointer at
  ~0.06/frame so it trails rather than snaps), `uAccent`, `uInk`, `uIntensity`.
- **Colour:** read from the CSS tokens at init via `getComputedStyle`, so the
  scene re-tints for free when the theme changes *or* when the editor's
  `accentColor` prop changes. Never hard-code `#E8C547` in GLSL.
- **Pointer response:** a soft heat bloom around `uPointer`. This replaces the
  existing `.fl-spot` DOM spotlight — delete it when the scene is live, keep it
  as the no-WebGL fallback.
- **Resolution:** `devicePixelRatio` capped at 1.5. If the governor (below)
  trips, drop to 1.0, then to a half-resolution buffer upscaled bilinearly.

### Layer 2 — the demo plates (`CSS3DRenderer`)

This is the part that makes the scene an argument rather than a decoration.

`CSS3DRenderer` positions **real DOM elements** in 3D space. That means the
three demo plates can sit on a shallow arc — centre plate pushed ~120px toward
camera, flanks rotated ~18° inward — and *stay real*: real links, real
`<iframe>`s, real text, fully keyboard-navigable, fully accessible.

On desktop, the **centre plate holds a live iframe of `4/northgate.html`** at
0.45 scale, loaded eagerly. It is the smallest demo at 68KB. The first thing a
visitor sees is therefore a working page rendering in 3D space, which is
precisely what the site is selling.

> **Why `CSS3DRenderer` and not a WebGL texture:** rendering the demos to a
> texture would look marginally slicker and would destroy the entire point.
> The page's argument is "these are real, open them." Keep them real.

Pointer parallax rotates the whole group ±6° on a lerp. `ScrollTrigger` drives
the group's `z` and rotation as the hero scrolls away, so the plates recede
into the field rather than simply scrolling off.

### Layer 3 — the content (plain DOM)

Headline, subhead, CTAs, badge. Normal flow, above everything, unchanged in
structure. Add a GSAP `SplitText` per-character reveal on the headline —
staggered 12ms, `y: 18px`, `--dur-slow` — fired on `load`, not on scroll.

Move **one** number into the hero: not four stats, one, in the accent, in the
serif — the delivery time or the price floor. The reassurance line under the
CTAs should carry a signature mark or a face, not only text.

### The performance governor (write this, do not skip it)

Sample frame time over the first 120 frames after init. Median > 20ms → drop
DPR to 1. Still > 20ms over the next 120 → dispose the WebGL layer entirely and
restore the CSS radial. Log nothing to console in production. A scene that
degrades gracefully on a weak GPU is the difference between "sophisticated" and
"my laptop fan came on."

**Acceptance:** LCP element identified and still under 2.5s on a throttled 4G +
4× CPU profile. The scene never initialises before `load`. Killing WebGL in
devtools leaves a complete, attractive hero. The hero says something no
competitor's hero can say.

## 11. Workstream D — Work section, with real depth

Today: four cards, each a poster plus an iframe plus two buttons. Uniform.
Nothing tells a visitor *why* any decision was made, which is the only thing
separating a designer from a template.

### D1. Promote Northgate to a flagship case study

Northgate already leads the grid. Give it a **full-bleed band above the grid** —
its own section, not a card:

- The problem in one line, the constraint in one line, the decision in one line.
- Three annotated detail crops: the estimator, the cost table, the cut-away SVG.
  Callouts drawn in inline SVG, keyed to each crop, revealed on a ScrollTrigger
  scrub so the annotations draw themselves as the section is read.
- A "why this converts" strip: no nav, one offer, arithmetic before contact.
  Three items, not ten.
- The live page still one click away.

The other three stay in the grid, unchanged in structure.

### D2. Fix the preview mechanism

Drop `loading="lazy"` from `.fl-live` at the moment `src` is set (defect #6),
add a 12s timeout that falls the badge back to `Open live ↗`, and give the badge
an error state. Loading a real page inside a card is the most impressive thing
on this site; it must never look broken.

### D3. Optional stretch — the orbit

If §10 lands cleanly and there is appetite for more: a second `CSS3DRenderer`
arrangement in the work section placing all four demos on a draggable carousel
ring, snapping to the nearest face, each still a live interactive page. Same
renderer class, no second WebGL context.

**Gate this behind D1 shipping first.** A carousel over four cards without a
case study behind it is padding with better physics.

## 12. Workstream E — Proof (the highest-leverage item on this list)

The page asks for money with zero third-party evidence and an admission that the
portfolio is invented. Fix it with the honest version.

**E1. Receipts, not testimonials.** Until real client quotes exist, do not
manufacture them. Build a section that shows verifiable craft instead:

- Lighthouse scores for each demo, as real numbers, with the date they were run.
- Page weight per demo against a stated budget ("400KB budget, shipped 68KB").
- Dependency count in the delivered page, stated literally.
- The source-file handover shown as an actual file tree.

This is the one kind of proof a concept portfolio can legitimately offer, and it
is far more persuasive to a technical buyer than a stock five-star card. It also
sits well beside a WebGL hero: the hero proves range, the receipts prove
discipline, and a studio that shows both is a studio that gets hired.

**E2. Leave a slot for real quotes.** Build the component, populate it with a
single real quote when one exists, and hide the section behind an `<sc-if>` prop
until then. Do not ship placeholder praise.

**E3. Fix the stat band** (defect #1) and make all four stats countable —
replace "Hand-coded" with a number, or drop the count-up and let the band be
purely typographic.

## 13. Workstream F — Motion system

The motion today is good but uncoordinated: each effect picked its own duration
and easing. With GSAP arriving, unify it or it will get worse, not better.

- **Lenis drives everything.** Initialise it, feed its RAF into
  `ScrollTrigger.update()`, and set `ScrollTrigger.scrollerProxy` accordingly.
  Disable it entirely under `prefers-reduced-motion` — hijacked scroll is the
  fastest way to make a site feel worse for the people it hurts.
- **Three durations** (`--dur-fast: 180ms`, `--dur-base: 350ms`,
  `--dur-slow: 700ms`) and two eases — the existing `cubic-bezier(.2,.7,.2,1)`
  for entrances, a gentler curve for exits. GSAP tweens read the same values via
  `getComputedStyle` so CSS and JS motion cannot drift apart.
- **Migrate the existing reveals to ScrollTrigger** — `batch()` with a 60ms
  stagger — and delete the `animation-timeline` block *and* its
  `IntersectionObserver` fallback. Two reveal systems plus a third from GSAP is
  how a page starts stuttering. Keep the scroll-driven **progress bar** in pure
  CSS; it costs nothing and needs no JS.
- **One new signature moment, not five.** Candidate: the pricing tiers. The
  featured tier's border just sits there while the featured work card gets an
  animated conic sheen. Give the three tiers a coordinated reveal that reads as
  a single gesture rather than three independent lifts.
- Keep the reduced-motion block and extend it to every new tween, the Lenis
  instance, and the entire WebGL scene.

## 14. Workstream G — Conversion path

- **Two-step form.** Email first, everything else after the address is captured;
  the chips and textarea slide in on submit of step one. Halves perceived cost,
  and a bounce after step one still leaves you an address.
- **Inline validation on blur**, not on submit, with the error tied to the input
  via `aria-describedby`.
- **A calendar alternative.** Some buyers will never fill a form. One link.
- **Sticky CTA** should key off a ScrollTrigger on the hero rather than
  `scrollY > 900` (defect #10), and should hide itself once `#start` is in view.
- **The success state deserves the same care as the form.** Today it is a box.
  Give it the detail a buyer wants: what happens next, when, and what to send in
  the meantime.
- **Move the address out of the page source** — swap in FormSubmit's alias
  endpoint (defect #11).

## 15. Workstream H — Shareability and indexing

Closes defects #3, #4 and #13:

- `og:title`, `og:description`, `og:image` (1200×630, **rendered from the actual
  scene** — capture the canvas at a fixed seed with the plates composited, so
  the share card shows the real thing), `og:url`, `og:type`, and
  `twitter:card=summary_large_image`.
- `rel="canonical"` at the Pages URL.
- An SVG favicon of the diamond mark, plus an `apple-touch-icon`.
- JSON-LD: `ProfessionalService` with `name`, `url`, `description`, `priceRange`
  and `areaServed`, plus an `FAQPage` block generated from the six existing
  `<details>` — the copy is already written, it simply is not marked up.
- `robots.txt`, `sitemap.xml` listing the index and all five demo pages, and a
  `404.html` styled to match (GitHub Pages serves it automatically).
- Auto-year the footer.

## 16. Workstream I — Budgets, non-negotiable

The stack in §7.2 costs real bytes. These ceilings are what keep it honest.

| Metric | Ceiling |
|---|---|
| `index.html` bundle | 340KB (today 280KB) |
| `assets/vendor/` total, gzipped | **100KB** |
| Added font payload | +80KB |
| New raster assets | WebP, ≤ 60KB each |
| Third-party network requests at runtime | **0** — everything vendored |
| Hero scene init | after `load`, inside `requestIdleCallback` |
| Sustained GPU frame time, mid-range laptop | < 8ms |
| Lighthouse Performance (mobile, throttled) | ≥ 90 |
| Lighthouse Accessibility | 100 |
| CLS | < 0.02 |

Mobile is the reason Performance ≥ 90 is still achievable with Three.js on the
page: **the scene never loads there.** Below 1080px the vendor bundle is not
even requested. Load it with a dynamic `import()` inside the gate, not a static
`<script>` — a static tag downloads on every device including the ones that will
never render a frame.

## 17. Workstream J — Accessibility

Already good. Hold the line, and note that WebGL raises the stakes:

- The canvas gets `aria-hidden="true"` and is never focusable. It carries no
  information; if it ever does, that information belongs in DOM too.
- The `CSS3DRenderer` plates are real DOM and **must remain in tab order with
  working focus rings**. Verify this explicitly — 3D transforms are a common way
  to make focus outlines render off-screen or invisible.
- `prefers-reduced-motion` disables the scene, Lenis, and every tween — not just
  the tween durations.
- `details[open] summary` must flip `+` to `−` (defect #8).
- Add `#faq` and `#top` to the nav or to the spy list (defect #9).
- The theme toggle needs `aria-pressed`, or a `role="radiogroup"` of three.
- Confirm focus trapping on the quick-look modals — the Popover API gives most
  of it; verify Escape and focus return explicitly.
- Full keyboard pass at the end, with the scene running.

## 18. Sequencing

Do not attempt this in one pass. Rebuild after each step and confirm the page
still renders.

1. **§7.3 vendoring spike** — get one trivial GSAP tween running through the DC
   runtime and the `tools/build.js` round-trip. **Do this on day one.** If module
   scripts do not survive the bundler, every later estimate changes.
2. **A1 tokens** → rebuild, visual diff. Prerequisite for the shader palette.
3. **B typography** → rebuild. This alone is the largest perceived jump.
4. **H meta and SEO** → cheap, self-contained, no visual risk.
5. **E1 + E3 proof and stats** → the highest conversion leverage.
6. **F motion migration** → Lenis + ScrollTrigger, old reveal systems deleted.
7. **D1 + D2 case study and preview fix.**
8. **C the hero scene** — layer 1, then layer 2, then the governor. Ship the
   fallback path before the scene.
9. **A2 light mode** → last of the foundations, because it must now also cover
   the shader uniforms.
10. **G, J, D3** → polish, audit, optional stretch.

## 19. Out of scope

- Any change to the four demo pages under `1/`–`4/`, except the `2/` filename
  rename (defect #7), which is mechanical and belongs in its own commit.
- New demo projects.
- Any deploy-time build step. `tools/vendor.js` runs locally and its output is
  committed.
- React, Vue, or any framework. `@react-three/fiber` is the wrong tool here —
  there is no React in the delivered page and there will not be.
- A second WebGL context anywhere on the page.
- A CMS, a blog, or a second page.

## 20. Acceptance checklist

- [ ] `node tools/build.js` run; `index.html` regenerated, never hand-edited
- [ ] `assets/vendor/` committed; **zero** third-party requests at runtime
- [ ] Page renders correctly from `file://` and from the `/LandingPage/` subpath
- [ ] All paths relative — no leading `/` anywhere
- [ ] All four demos still open from the hero and from the work grid
- [ ] Disabling WebGL leaves a complete, attractive page
- [ ] Below 1080px the vendor bundle is never requested
- [ ] `componentWillUnmount` disposes renderer, geometries, materials, textures; RAF cancelled; no GPU context leak across re-renders
- [ ] RAF pauses on `document.hidden` and when the hero is out of view
- [ ] Both themes pass contrast; the scene re-tints smoothly; no colour defined only inside a media block
- [ ] `prefers-reduced-motion` kills the scene, Lenis, and every tween
- [ ] Keyboard-only pass with the scene running: header → hero plates → work → quick-look → Escape → pricing → form → submit
- [ ] Budgets in §16 met and measured, not assumed
- [ ] FAQ copy updated per §7.1
- [ ] Defects #1–#13 each closed, or explicitly deferred with a reason
