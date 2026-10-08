# BUILD PLAN: erjatindesigns

Master creative brief and implementation instructions for Claude Code.
Status: **draft, awaiting approval. Nothing has been built yet.**

---

## 1. Website overview

| Item | Decision |
|---|---|
| Brand / handle | **erjatindesigns** (the "er" nods to engineer-turned-designer) |
| Person | Jatin Srivastava, Product Designer (ex-engineer) |
| Type | Personal portfolio: who I am, how I design, my work, interests, hobbies, future aspirations |
| Feeling | Cool, minimal, personal. Quiet confidence with a few moments of play. |
| Primary CTA | "Contact me" / "Resume" → channel picker (Email / LinkedIn / WhatsApp) |
| Videos | **None.** Image, type and motion only. Higgsfield / Seedance sections are dropped. |
| Reference | siddhantnagraj.com used for *design language only* (layout rhythm, type contrast, motifs). No copy, photos, project content or assets are reused. |

## 2. Core positioning

- **One-liner:** I make products that feel effortless to anyone using them.
- **Mission:** Get out in the world and make things better, and use this site to show how.
- **Differentiator:** An engineer's eye for how things get built, a designer's instinct for how they feel. "er" is the quiet proof.
- **Proof points:** LocEarn (shipped, field-tested), Kangaru (redesigned through a business pivot), Datum (a token-first design system built from scratch).

## 3. Brand personality

Calm, curious, precise, a little playful. Speaks plainly, never buzzword-y. Confident without shouting. Humor lives in small details (hover states, labels, a ticket-style contact card), not in the headlines.

## 4. Visual direction

**Cool minimal.** Lots of air, strong type contrast, restrained color, tactile details.

### Palette (my call, as you asked)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F2F4F1` cool bone | `#0D1210` | Page |
| `--surface` | `#FFFFFF` | `#151C19` | Cards |
| `--ink` | `#0E1512` | `#EEF2EF` | Headlines, body |
| `--muted` | `#5F6B65` | `#8E9A94` | Secondary text |
| `--accent` | `#0F7B6C` teal | `#3DD6A5` | Links, outline type, highlights |
| `--signal` | `#FF6B3D` orange | `#FF8A5E` | Single "pop" per section: dots, tags, hover bands |
| `--line` | `rgba(14,21,18,.12)` | `rgba(255,255,255,.10)` | Dividers |

Each project gets one band color on hover: LocEarn teal, Kangaru olive `#4C5B2A`, Datum slate `#2B3A42`.

## 5. Elements kept, adapted or dropped (from the reference)

| Reference element | Decision |
|---|---|
| Huge serif name, solid + outlined line | **Keep.** "JATIN" solid, "SRIVASTAVA" outlined. |
| Pill floating nav + logo bubble | **Keep.** Logo bubble reads `er.` |
| Dark marquee strip of skills | **Keep.** Skills from the site content. |
| Numbered "Things I've shipped" list with hover color band + floating preview | **Keep**, 3 rows. |
| Polaroid / sticker collage (about) | **Adapt.** Own photos and own stickers, built around interests and hobbies. |
| Sticky-note "habits" cards | **Keep**, 4 notes about how I work. |
| Testimonials | **Optional.** Include only if you have real quotes. Otherwise cut. |
| Ticket-style contact card | **Adapt.** Own ticket design; drives the contact picker. |
| Custom cursor | **Keep**, subtle (desktop only). |
| Dark-mode toggle | **Keep.** |
| "Retro" toggle | **Drop** unless you want it. |
| Photo avatar in hero | **Keep**, your own photo. |

## 6. Website structure (single page + 3 case-study pages)

1. Hero
2. Skills marquee
3. Selected work (3 projects)
4. About (story, interests, hobbies)
5. How I work (4 sticky notes)
6. Future / aspirations
7. Contact (picker) + footer
8. `work/locearn.html`, `work/kangaru.html`, `work/datum.html`

## 7. Section specs

### Hero
- Eyebrow row: `( GOOD <TIME OF DAY> )` (auto, local time) · `3+ YEARS · PRODUCT DESIGN` · `OPEN TO WORK / 2026`
- Name: **JATIN** (solid, heavy serif) / **SRIVASTAVA** (outlined, accent stroke). Fluid size, ~14vw max.
- Role: `PRODUCT DESIGNER`
- Line: *"Engineer by training, designer by choice. I make products feel effortless."* (draft, edit freely)
- `MY STACK` row: round tool chips (Figma, Framer, Notion, etc.)
- Round photo avatar with an orange status dot. Stickers orbit it on hover.
- Intro: short load sequence (name letters rise in, ~1.2s), skippable by click.

### Skills marquee
Dark band, uppercase grotesk, diamond separators alternating accent/signal, infinite loop, pauses on hover, edge-faded.

### Selected work
- Header: `02` · `SELECTED WORK` · **THINGS I'VE SHIPPED** · `03, PROJECTS`
- Rows: index, huge title, one-line subtitle, impact line, tag pill, year, `VIEW CASE →`.
- Hover: row floods with project color, text inverts, a floating preview card follows the cursor, cursor becomes a `VIEW CASE →` pill.
- Projects: **LocEarn** (B2B / field ops, shipped), **Kangaru** (B2C / mobility, in development), **Datum** (design system, coming soon, non-clickable until ready).

### About
- Header: `03` · `ABOUT` · big headline (draft: **FROM CODE TO CRAFT**)
- Left: bold statement + serif paragraph + a "north star" line. **Story text is TBD; you said you'll share it later.**
- Right: tilted polaroid collage (own photos: you, hobbies, places) with handwritten captions.
- Stats rows: placeholders marked `[TBD]` until you supply real numbers.
- `/ CURRENTLY` line (what you're reading, watching, learning).

### Interests and hobbies
Sticker-style chips or a small taped board. **Content TBD.**

### How I work
Four sticky notes, slight rotation, tape strips, hover lifts and straightens. Draft titles: *Systems over screens*, *Research earns the pixels*, *Prototype to decide*, *Ship, then measure*. Each links to the matching project.

### Future / aspirations
Short section, "Where I'm headed". Draft structure: three lines (the work I want to do, the teams I want to join, what I'm learning next). **Content TBD.**

### Final CTA + contact picker
- Header: `04 · CONTACT` · **LET'S TALK.** · *"...and build something people like."*
- Round icon buttons: Contact, Resume, LinkedIn, Email.
- **Contact me / Resume opens a modal:** "How would you like to reach me?" with three choices:
  - **Email** → `mailto:` (address TBD)
  - **LinkedIn** → profile URL (TBD)
  - **WhatsApp** → `https://wa.me/<number>` (number TBD)
  - For **Resume**, the modal also offers "Download PDF" (file TBD).
- Ticket card on the right ("Admit one: Portfolio") that opens the same modal when clicked.

### Footer
`ERJATINDESIGNS®` · Product designer · © 2026 · "Designed and built by hand." Back-to-top link.

## 8. Typography

- **Display serif (name, outline):** `Playfair Display` 900 or `DM Serif Display` (Google Fonts).
- **Headline grotesk:** `Archivo` 800/900 or `Inter Tight` 800, uppercase, tight tracking (-0.03em).
- **Body serif:** `Source Serif 4` 400.
- **Labels:** `Inter` 500, uppercase, 0.14em tracking, 11-12px.
- Fluid sizes with `clamp()`. Self-host fonts in `/assets/fonts` for performance.

## 9. Animation direction

- Easing: `cubic-bezier(.22,1,.36,1)` for entrances; 600-900ms.
- Hero: letters rise with stagger; outline line draws in.
- Section headings: line-by-line mask reveal on scroll.
- Marquee: constant linear, speed up slightly with scroll velocity.
- Work rows: color-flood wipe from the left on hover.
- Sticky notes and polaroids: settle into rotation on enter.
- Subtle film grain overlay (static SVG noise, 4% opacity).
- Respect `prefers-reduced-motion`: disable parallax, marquee and reveals.

## 10. Interaction design

- Custom cursor: small dot that grows over links and becomes a labeled pill on project rows.
- Magnetic buttons (small pull toward cursor).
- Contact picker modal: focus-trapped, Esc to close, keyboard accessible.
- Dark mode toggle, remembers choice (`localStorage`, wrapped in try/catch), defaults to system.
- Active nav state follows scroll position.

## 11. Scroll behavior

- Lenis smooth scroll (desktop and touch, light inertia).
- GSAP ScrollTrigger for reveals, pinned work-list preview and gentle parallax on the collage.
- Anchor links scroll with offset for the floating nav.

## 12. Mobile behavior

- Single column. Name scales fluidly; outline line stays one line (shrinks, no wrap).
- Nav collapses to logo bubble + menu pill; full-screen menu.
- Work rows: always show the color band as a card, tap to open; no hover preview.
- Sticky notes become a horizontal scroll-snap row.
- Custom cursor disabled. Touch targets ≥ 44px.

## 13. Technical implementation

**Static site, per your tech requirements:**

```
site/
  index.html
  style.css
  script.js
  work/locearn.html
  work/kangaru.html
  work/datum.html
  assets/
    fonts/  img/  icons/  resume/
```

- Only HTML, CSS, vanilla JS. No React, Next.js or frameworks.
- CDN: GSAP, ScrollTrigger, Lenis.
- No video, so no scrubbing needed. Images: WebP/AVIF, lazy-loaded, explicit dimensions.
- Performance targets: LCP < 2s, CLS ≈ 0, total JS < 150KB excluding CDN libs.
- Accessibility: semantic landmarks, visible focus, 4.5:1 contrast, alt text, reduced-motion support.
- SEO: title `Jatin Srivastava | erjatindesigns`, meta description, Open Graph image.

**Open decision:** this repo is currently a Next.js app (`src/`). The static site would live in `site/` so the Next app stays untouched, and can be deployed separately. Alternative: rebuild inside the Next.js app instead.

## 14. Inputs still needed from you

| Item | Status |
|---|---|
| Your story (engineer → designer) | You'll share later |
| Photos: portrait avatar, collage photos | Needed |
| Interests, hobbies, aspirations | Needed |
| Stats | Skipped; placeholders will be marked `[TBD]` |
| Email, LinkedIn URL, WhatsApp number | Needed |
| Resume PDF | Needed |
| Real testimonials (optional) | Optional |
| Case-study content for LocEarn, Kangaru, Datum | Reuse current site copy unless you update it |
