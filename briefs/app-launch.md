# Brief — mobile app launch page (portfolio demo #5)

**How to use this:** open Claude Code in the repo root and paste this whole file
as the prompt. It is written to be executed, not interpreted. Everything below
is a requirement unless it says *optional*.

**Deliverable:** one file — `5/tallwood.html` — plus a poster image at
`assets/work/tallwood.webp`.

**Why this demo exists:** the portfolio has a B2B SaaS page (Closebook), a DTC
storefront (Cedar Basin), an AI SaaS product page (Throughline) and a local
service lead-gen page (Northgate). None of them is a consumer app page, and
"app landing page" is a high-volume brief this portfolio currently cannot
answer. It also adds a motion category the other four lack: the two animated
pieces are autoplay loops, and Northgate's motion is a form reacting to input.
Nothing here is *scroll-scrubbed*, and nothing is *operable*.

---

## 1. The one rule that makes this page different

**Not one raster screenshot of the app appears anywhere on the page.** Every
pixel of app interface is live DOM — real HTML, real CSS, real state.

Every competing app landing page is a photograph of an app: a tilted phone
holding a PNG. The device is furniture. This page refuses that. The phone is
drawn in CSS, the screen inside it is a working miniature of the product, and
the visitor can touch it.

Throughline already proved this studio renders app UI in HTML instead of
dropping in a screenshot. This pushes that from *static mock* to *operable*.
If any part of the brief has to be cut, this rule is not the part.

## 2. Naming and file conventions

- Filename: `5/tallwood.html` — lowercase, no spaces. `2/` has spaces in its
  filenames and every link to it needs `%20` encoding. Do not repeat that.
- Any assets go in `5/assets/` with lowercase, hyphenated names.
- The page must open correctly from `file://` **and** from a subpath like
  `https://user.github.io/LandingPage/5/tallwood.html`. That means **relative
  paths only** — never a leading `/`.

## 3. The product being invented

**Tallwood** — shared household money. Four housemates, one kitchen table's
worth of receipts. Scan a receipt, split it however it actually got split, and
everyone settles up once a month instead of arguing in a group chat.

- **Buyer:** 22–35, shares a flat or a house, currently running the household
  on a group chat and one person's spreadsheet.
- **The pain:** somebody always fronts the money, nobody remembers who owes
  what, and asking for $12 feels worse than eating the $12.
- **The promise:** the arithmetic happens by itself, so the conversation never
  has to.
- **The objection to handle:** "we already have a group chat / a spreadsheet /
  we just remember."

Why this product and not another: its interface is rows, numbers, avatars and
sheets — which renders convincingly in pure HTML with no images and no weight.
Its value is genuinely two-sided, so the second device in §4.3 is justified
rather than decorative. And "$47.20, settled" is legible instantly in a way an
abstraction is not.

This is an **invented company.** See §9 — that constraint is not negotiable.

## 4. The three signature moves (build these first, in this order)

**These are the reason the page exists. If time is short, cut a section from §6
rather than weakening any of these.**

### 4.1 The hero device is playable

A CSS-drawn phone containing a working miniature of Tallwood. Not an image,
not a video, not a canned animation — real state.

- Three screens reachable by a working tab bar: **Home** (the balance and the
  recent split list), **Add** (a receipt being split four ways), **People**
  (who owes whom).
- Keep the interactive surface small and fixed: three tab buttons, four avatar
  toggles, one settle control. Nine targets, no more, plus a reset control
  *outside* the device so a visitor can replay it.
- Tapping a housemate's avatar on the Add screen toggles them in or out of the
  split, and **every share recalculates live, to the cent** — three ways of
  $63.80 is 21.27 / 21.27 / 21.26, not three roundings that lose a penny.
  Deselecting everyone must disable the button rather than divide by zero.
  Tapping "Settle up" runs the payoff animation.
- It must survive being poked in any order. No sequence assumptions, no
  "the demo breaks if you tap that twice."
- State lives in one small vanilla state machine. No framework.
- It starts in a composed, readable state — someone who never touches it still
  sees a real product.

### 4.2 The body is one continuous session, scrubbed by scroll

One phone, `position: sticky`, held in place while a tall track scrolls past
it. The screen advances through a **single real user story with causality**,
not a set of disconnected feature beats:

1. Receipt lands — a shop receipt is captured, lines resolving.
2. Tallwood reads it — line items appear, categorised.
3. Split — four avatars, the shares dividing.
4. The nudge — one housemate hasn't paid; a reminder goes out.
5. Settled — the balance falls to zero and the payoff lands.

Requirements:

- **Position-linked, not triggered.** Scroll up and it rewinds. This is the
  whole difference between this and every scroll-triggered app page.
- Copy beats sit beside the device and are timed to what the screen is doing.
- Only `transform` and `opacity` animate. Every screen state is pre-rendered
  into the DOM and stacked — never construct a screen mid-scroll.
- There is no screenshot carousel anywhere on the page, because there is
  nothing left for one to show.

### 4.3 The second phone

At the point where the product's value is coordination, a second device — the
housemate's — slides in beside the first and **reacts to what the first one
just did, roughly 400ms later**, with a notification sliding down.

That latency is the design. Instant sync reads as fake; a beat of delay reads
as real. Nobody in this category builds the multiplayer view.

## 5. The anti-brief — banned outright

These bans do more for differentiation than any addition. Do not ship the page
with any of them:

- A tilted floating phone with a drop shadow
- A gradient blob / aurora / mesh background
- A horizontal screenshot carousel or screenshot rail
- The black App Store + Google Play badge lockup as the primary hero CTA
- A "Loved by 40,000 users ★★★★★" row
- A grid of pastel feature icons
- Poppins, or any other default startup-template typeface
- Stock-photo avatars — housemate avatars are CSS initials
- A grey `1280×760` placeholder box standing in for a screenshot

## 6. Page structure

Build in this order. Each section is a `<section>` with an `id`.

1. **Nav** — wordmark, three links, one primary CTA ("Get the app"). Sticky,
   light backdrop blur, a border that strengthens on scroll.

2. **Hero** — the device leads. An `<h1>` sits beside it, not above it, and the
   device is the largest thing on the screen. Eyebrow, H1, one-sentence subhead,
   primary CTA + a ghost "See how it works", reassurance line ("Free for
   households. No ads, ever."). Then §4.1. The H1 names the outcome, not the
   mechanism — *"The arithmetic happens by itself."* beats anything containing
   "powered by AI".

3. **The problem** — the group chat, rendered. A short fake message thread
   where four people fail to work out who owes what, built in HTML. Then one
   line of copy that lands the contrast. Keep it brief and dry rather than long
   and sad.

4. **The session** — §4.2. This is the spine of the page and should occupy the
   most vertical space of any section.

5. **Both sides** — §4.3, with copy about the half of the product that is
   social rather than mathematical.

6. **What it does** — four capabilities, each a short block with a small
   inline-SVG diagram, not a stock icon: receipt scanning, uneven splits,
   recurring bills, one-tap settle.

7. **What it doesn't do** — the section the category never writes. No ads. No
   selling your transaction history. No streaks nagging you at 9pm. No credit
   score, no upsell to a card. Honesty as a conversion mechanic; match the
   register already running through Closebook.

8. **Pricing** — free for households, one paid tier for shared houses over six
   people. Two cards, not three. Resist inventing an enterprise tier for a
   flatshare app.

9. **FAQ** — six `<details>`. Handle the real objections: does everyone need
   the app, what if someone won't pay, do you touch my bank account, what
   happens to my data if I leave the house, does it work across currencies,
   how is this different from a group chat and a spreadsheet.

10. **Get it** — the handoff section. An app page has one CTA the web cannot
    complete: the app has to reach a phone. Build a **real, scannable QR code
    as inline SVG**, plus a "text me the link" field with an inline success
    state. **Wire the field to nothing** and leave an HTML comment saying it is
    a demo form. Store badges may appear here, drawn as restrained inline SVG
    and **non-linking** — see §9.

11. **Footer** — wordmark, link columns, "Concept build" note.

## 7. Visual system

Deliberately distinct from all four existing demos and from the portfolio
itself (near-black + gold). Do not reuse that gold, Throughline's mint, or
Northgate's orange.

```
--bg        #EDEDF0   cool light paper, not white
--surface   #FFFFFF
--line      rgba(16,16,20,.10)
--ink       #101014
--muted     rgba(16,16,20,.58)
--accent    #4B3BFF   electric indigo — CTAs, active states, brand
--settled   #12C08A   green — used ONLY for paid/settled states
```

- **Figure and ground:** the page is cool and light; the device bezel is
  near-black; the app screen inside is a half-step whiter and warmer than the
  page. That is how a real phone looks lying on a table, and it makes the
  device read as an object rather than a panel. Do not put a dark app UI on a
  light page — Throughline already owns dark app chrome.
- **Type:** `Manrope` for display, `Inter` for everything else including all
  app UI. Two families, no more. Inter is what real apps use, and that is what
  makes the mock read true.
- **Money:** `font-variant-numeric: tabular-nums` everywhere a figure can
  change, so digits do not jitter when they animate.
- **Scale:** H1 `clamp(40px, 5.4vw, 76px)`, tracking `-0.03em`.
- **Radii:** 14–18px on page furniture; the device screen uses the real
  corner curve, not a uniform radius.
- **Depth:** thin borders and one very soft, very large shadow under the
  device only. Nothing else on the page casts a shadow.
- **Restraint:** indigo does the work. Green appears at exactly one moment.

## 8. Technical requirements

| Constraint | Value |
|---|---|
| Output | A single self-contained `.html` file |
| CSS | Inline `<style>` in the head. No Tailwind, no CSS framework |
| JS | Inline `<script>`, vanilla. No React, no CDN libraries |
| Fonts | Google Fonts only, max 2 families |
| Images | Inline SVG only. No raster images on the page at all |
| Total page weight | **≤ 400KB** including fonts |
| Build step | None. Open the file, it works |

- **Draw the phone, do not import it.** Rounded rect, hairline bezel, dynamic
  island, a status bar with time and battery in HTML. Author the screen once at
  a fixed **390×844** logical viewport and scale the whole frame with
  `transform: scale()` so the app UI never reflows at any breakpoint.

- **Scrub with native CSS scroll-driven animation, not JS.**
  `animation-timeline: view()` / `scroll()` with `animation-range`, on a
  `position: sticky` stage. It runs off the main thread, it is reversible for
  free, it needs zero JavaScript, and it matches the studio's "hand-written
  HTML and CSS, no page builders" pitch better than any library would.
  **Note:** `4/motion-mini.js` exports only `animate` and `animateSequence` —
  it has no `scroll()` or `inView()` helper. Do not reach for it here.

- **One fallback covers three failure modes.** A
  `@supports not (animation-timeline: view())` block renders every beat as a
  static, already-composed state. That same stylesheet is what
  `prefers-reduced-motion: reduce` gets, and what a JS-disabled visitor gets.
  Write it once; it handles all three. **This is not optional.**

- **Interface feel is where the remaining effort goes.** This is what separates
  a web page pretending to be an app from an app running in a web page, and it
  costs less than any of the structural work:
  - Spring easing on state changes, never linear
  - Press states that scale to `0.97`
  - Sheets that rubber-band at the top of their travel
  - Numbers that tick up rather than snapping
  - Tap targets ≥ 44px inside the device as well as outside it

- **Responsive with real breakpoints** at ~1080px, ~860px, ~560px. Test at
  **390px** and confirm `document.documentElement.scrollWidth === innerWidth`
  — no horizontal overflow, ever. Below 860px the two-device section stacks and
  the sticky session gets a shorter track.

- **Semantic HTML:** one `<h1>`, correct heading order, `<nav>`/`<main>`/
  `<footer>`, `aria-label` on icon-only controls. The device is decorative
  chrome around a real interactive region — the tab bar is real `<button>`s.

- **Keyboard:** every interactive element reachable and visibly focused,
  including the in-device controls. A `:focus-visible` style is required.

- No console errors or warnings.

- `<title>` and `<meta name="description">` — both projects in `2/` shipped
  without a title and it had to be patched later.

## 9. Honesty rules (non-negotiable)

The portfolio's credibility is the product. These are hard rules:

- **Invent the brand.** Tallwood is not a real company.
- **The store badges must not link anywhere real,** and must not reproduce
  Apple's or Google's actual badge artwork. Draw a restrained generic
  equivalent, mark it `aria-disabled`, and let the concept note explain it.
  A fake download link that goes to a real store listing is a lie about a
  product that does not exist.
- **No invented testimonials attributed to named people with photos.** The
  group-chat section in §6.3 is clearly a scripted illustration, not a
  testimonial — keep it that way and label it.
- Every metric gets an *Illustrative figures — concept piece* label. Closebook
  and Northgate already do this; match it.
- The footer must say it is a concept build.
- The demo form is wired to nothing and says so in a comment.

## 10. Definition of done

- [ ] Opens from `file://` with no errors
- [ ] Zero raster images of app UI anywhere in the file
- [ ] Hero device is genuinely interactive and survives out-of-order tapping
- [ ] Scrubbed session rewinds correctly on scroll-up
- [ ] `prefers-reduced-motion` and no-`animation-timeline` both render composed
      static states
- [ ] No horizontal scroll at 390px, 768px, 1440px
- [ ] Keyboard-navigable end to end, visible focus rings, in-device controls
      included
- [ ] Total weight ≤ 400KB
- [ ] QR code actually scans
- [ ] Store badges do not link out and are not Apple/Google artwork
- [ ] `<title>` and meta description present
- [ ] Zero console errors
- [ ] Nothing from the §5 ban list is present

## 11. Wiring it into the portfolio (after the page is done)

1. Screenshot it at 1440×900 and produce the poster:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=9000 --window-size=1440,900 --screenshot=shot.png "http://localhost:4173/5/tallwood.html"
```

Then crop to 4:3, resize to 1000px wide, save as WebP quality 82 at
`assets/work/tallwood.webp` (target under 50KB — match the existing four).

2. Add a fifth `<article class="fl-card">` to the work section in
   `src/foldline.template.html`, copying the Northgate card. It needs:
   `.fl-shot` poster, `.fl-live` iframe with **`data-src`** (not `src` — the
   previews load on click), the `[data-loadlive]` badge button, tags, an
   "Open live" link and a `[data-quicklook]` button plus its `.fl-ql` popover.

3. The work grid is 2-up. With five cards the last one wraps alone — either
   accept that or give the fifth card `data-featured` and let it span.

4. Update the work-section footer copy: it currently says "All four are concept
   builds." That becomes five.

5. Rebuild and verify:

```bash
node tools/build.js
```

---

## Copy direction

Write like the Closebook and Northgate pages, not like a startup homepage.

- **Concrete over abstract.** "$47.20, split four ways, settled Tuesday" beats
  "effortless group finance".
- **Never** say: leverage, seamless, revolutionary, game-changing, unlock,
  supercharge, "powered by AI", "harness the power of", "financial wellness".
- Say what it does in the buyer's words. A housemate says "I hate asking Dan
  for twelve dollars" — not "I lack visibility into shared liabilities".
- The register is domestic and dry. Slightly funny in the problem section,
  completely straight everywhere else. Money makes people tense; the page
  should feel like relief, not like a pitch.
- Short sentences. Let the device carry the explanation.
- The H1 should survive being read alone with no context.
