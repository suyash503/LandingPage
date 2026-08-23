# Brief — AI SaaS landing page (portfolio demo #3)

**How to use this:** open Claude Code in the repo root and paste this whole file
as the prompt. It is written to be executed, not interpreted. Everything below
is a requirement unless it says *optional*.

**Deliverable:** one file — `3/throughline.html` — plus a poster image at
`assets/work/throughline.webp`.

**Why this demo exists:** the portfolio has Closebook (B2B SaaS, muted/editorial)
and Cedar Basin (DTC, dark/luxe). Both prove taste. Neither proves *product
demo* work, and "AI SaaS landing page" is the highest-volume search term this
portfolio can realistically compete for. This piece exists to be the thing a
buyer screenshots.

---

## 1. Naming and file conventions

- Filename: `3/throughline.html` — **lowercase, no spaces.** `2/` has spaces in
  its filenames and every link to it needs `%20` encoding. Do not repeat that.
- Any assets go in `3/assets/` with lowercase, hyphenated names.
- The page must open correctly from `file://` **and** from a subpath like
  `https://user.github.io/LandingPage/3/throughline.html`. That means **relative
  paths only** — never a leading `/`.

## 2. The product being invented

**Throughline** — reads every customer conversation a company already has
(support tickets, sales call transcripts, reviews, churn surveys) and turns
them into a ranked list of what to build next.

- **Buyer:** Head of Product / PM at a 50–500 person B2B software company.
- **The pain:** they have thousands of customer messages and no way to know
  what actually matters. Today someone spends a week a quarter reading tickets
  and building a slide.
- **The promise:** every conversation, clustered into themes, ranked by revenue
  at risk — updated continuously instead of quarterly.
- **The objection to handle:** "we already have a feedback tool / a
  spreadsheet / we just ask sales."

This is an **invented company.** See §8 — that constraint is not negotiable.

## 3. Hard constraints

| Constraint | Value |
|---|---|
| Output | A single self-contained `.html` file |
| CSS | Inline `<style>` in the head. No Tailwind, no CSS framework |
| JS | Inline `<script>`, vanilla. **No React, no GSAP, no CDN libraries** |
| Fonts | Google Fonts only (`fonts.googleapis.com`), max 2 families |
| Images | Inline SVG preferred. Any raster must be WebP and under 80KB |
| Total page weight | **≤ 400KB** including fonts |
| Build step | None. Open the file, it works |

Rationale: the studio sells "hand-written HTML and CSS, no page builders, runs
anywhere." A demo built on a framework contradicts the pitch, and heavy demos
bloat the portfolio — the work cards load these on request for that reason.

## 4. The signature interaction (build this first)

**This is the whole reason the page exists. If time is short, cut a section
below rather than weakening this.**

An animated hero panel that shows raw feedback becoming ranked themes:

1. **Scatter.** ~40 small rounded chips, each a real-sounding customer quote
   fragment ("export keeps timing out", "can't invite my accountant",
   "pricing page confused me"), scattered in an irregular cloud. They drift
   very slightly so the panel is never static.
2. **Cluster.** Chips animate into 4 loose groups. Use `transform` on a
   staggered delay — do not animate `top`/`left`. Each group tints to its
   theme colour as it forms.
3. **Label.** A label types in over each cluster: *Exports & reliability*,
   *Team permissions*, *Pricing clarity*, *Mobile*.
4. **Rank.** A panel slides in on the right listing the four themes with a
   count and a revenue figure, sorted descending — e.g.
   `Exports & reliability · 312 mentions · $84k ARR at risk`.
5. **Loop.** Hold ~4s, fade out, restart. Must loop cleanly and forever.

Requirements:
- Runs on load, no scroll trigger, no user input.
- **`prefers-reduced-motion: reduce` → render the final clustered state
  immediately with no animation.** Not optional.
- Pure CSS animation where possible; JS only to orchestrate timing.
- Must not jank. Animate `transform` and `opacity` only.
- Must degrade to something that still looks composed if JS fails.

## 5. Page structure

Build in this order. Each section is a `<section>` with an `id`.

1. **Nav** — logo, 4 links, one primary CTA ("Start free"). Sticky, blurred
   backdrop, subtle border that strengthens on scroll.

2. **Hero** — eyebrow, H1, one-sentence subhead, two CTAs (primary "Start free"
   + ghost "See how it works"), reassurance line ("No card. Connects in 10
   minutes."), then the §4 demo panel. H1 should name the outcome, not the
   technology — *"Know what to build next, from the conversations you already
   have."* beats anything containing "AI-powered".

3. **Logo wall** — 6 invented customer logos as inline SVG wordmarks. Muted,
   low opacity. Caption: *"Concept piece — companies are invented."*

4. **The problem** — short essay block plus a stat table: hours spent reading
   feedback per quarter, % of tickets never read, time from complaint to
   roadmap. Label it *Illustrative figures*.

5. **How it works** — 3 numbered steps: Connect (Zendesk, Intercom, Gong,
   Slack) → Throughline clusters → You ship the right thing. Each with a small
   inline-SVG diagram, not a stock icon.

6. **Product surface** — the second-biggest visual. A faked app UI: sidebar,
   theme list, one theme expanded showing the verbatim quotes behind it, with
   a confidence score. Build it in HTML/CSS — do **not** use a screenshot
   placeholder box. A static box saying "1280×760" is what a template looks
   like; a real rendered UI is what proof looks like.

7. **Features** — 6 cards: multi-source ingest, theme clustering, revenue
   weighting, trend-over-time, Jira/Linear push, audit trail.

8. **Integrations** — a grid of invented + generic tool names.

9. **Pricing** — 3 tiers (Team / Growth / Enterprise). Middle one highlighted.
   Monthly/annual toggle that actually works.

10. **FAQ** — 6 `<details>`. Handle the real objections: how is this different
    from a feedback board, what about privacy/PII, how long to set up, what if
    our volume is low, do you train on our data, how do you calculate revenue
    at risk.

11. **Final CTA** — email capture. **Wire it to nothing.** Show an inline
    success state on submit. Add an HTML comment saying it is a demo form.

12. **Footer** — logo, link columns, "Concept build" note.

## 6. Visual system

Deliberately different from the other two demos and from the portfolio itself
(which is near-black + gold). Do not reuse that gold.

```
--bg        #08080B   near-black, very slightly blue
--surface   #101017
--line      rgba(255,255,255,.09)
--text      #F2F3F7
--muted     rgba(242,243,247,.60)
--accent    #7DF9C4   mint — primary CTA, active states
--accent-2  #8B7BFF   violet — used ONLY inside the demo panel
```

- **Type:** one geometric sans for everything (Inter, Geist, or Plus Jakarta
  Sans) + one mono (JetBrains Mono, IBM Plex Mono) for data, counts, labels and
  the chips. The mono is what makes it read as a developer product.
- **Scale:** H1 `clamp(44px, 6vw, 82px)`, tight tracking (`-0.03em`).
- **Radii:** 10–14px. Not pill-shaped, not sharp.
- **Depth:** thin borders and very large soft shadows. No heavy drop shadows.
- **Gradient:** at most two, both subtle, both in the demo area. A dark page
  covered in glowing gradients reads as a template.
- **Restraint:** one accent colour doing the work beats four.

## 7. Technical requirements

- **Responsive with real breakpoints** at ~1080px, ~860px, ~560px. Test at
  **390px** and confirm `document.documentElement.scrollWidth === innerWidth`
  — no horizontal overflow, ever.
- Nav collapses below 860px to a working menu (a `<dialog>` or the popover API
  is fine — both are well supported now).
- **Semantic HTML:** one `<h1>`, correct heading order, `<nav>`/`<main>`/
  `<footer>`, `alt` on every image, `aria-label` on icon-only controls.
- **Keyboard:** every interactive element reachable and visibly focused. A
  `:focus-visible` style is required.
- Tap targets ≥ 44px on touch viewports.
- No console errors or warnings.
- `<title>` and `<meta name="description">` — both projects in `2/` shipped
  without a title and it had to be patched later.

## 8. Honesty rules (non-negotiable)

The portfolio's credibility is the product. These are hard rules:

- **Invent every brand.** Do not put Salesforce, Notion, Stripe or any other
  real company's logo in the logo wall. Fabricated endorsements from real
  companies are a legal problem, not a design choice.
- Integration names may reference real tools **factually** ("connects to
  Zendesk") since that describes a capability rather than implying endorsement.
- **No invented testimonials attributed to named people with photos.** Either
  omit testimonials, or write them as clearly-labelled sample copy.
- Every metric gets an *Illustrative figures — concept piece* label. Closebook
  already does this; match it.
- The footer must say it is a concept build.

## 9. Definition of done

- [ ] Opens from `file://` with no errors
- [ ] Hero animation loops cleanly and respects `prefers-reduced-motion`
- [ ] No horizontal scroll at 390px, 768px, 1440px
- [ ] Keyboard-navigable end to end, visible focus rings
- [ ] Total weight ≤ 400KB
- [ ] No real company logos anywhere
- [ ] `<title>` and meta description present
- [ ] Zero console errors
- [ ] Product-surface section is real HTML, not a grey placeholder box

## 10. Wiring it into the portfolio (after the page is done)

1. Screenshot it at 1440×900 and produce the poster:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=9000 --window-size=1440,900 --screenshot=shot.png "http://localhost:4173/3/throughline.html"
```

Then crop to 4:3, resize to 1000px wide, save as WebP quality 82 at
`assets/work/throughline.webp` (target under 50KB — match the existing three).

2. Add a third `<article class="fl-card">` to the work section in
   `src/foldline.template.html`, copying the Closebook card. It needs:
   `.fl-shot` poster, `.fl-live` iframe with **`data-src`** (not `src` — the
   previews load on click), the `[data-loadlive]` badge button, tags, an
   "Open live" link and a `[data-quicklook]` button plus its `.fl-ql` popover.

3. The work grid is 2-up. With three cards, either let the third wrap or switch
   `.fl-work-grid` to a 3-up that collapses to 1 below 860px.

4. Rebuild and verify:

```bash
node tools/build.js
```

5. Update the pricing section — this page is a good **Complete ($260)**
   example, so reference it there the way Studio references Cedar Basin.

---

## Copy direction

Write like the Closebook page, not like a startup homepage.

- **Concrete over abstract.** "312 mentions across 4 sources" beats
  "powerful insights".
- **Never** say: leverage, seamless, revolutionary, game-changing, unlock,
  supercharge, "powered by AI", "harness the power of".
- Say what it does, in the buyer's words. A PM says "I don't know what to build
  next" — not "I lack data-driven prioritisation".
- Short sentences. Let the interface carry the explanation.
- The H1 should survive being read alone with no context.
