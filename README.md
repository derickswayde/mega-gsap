# Mega motion

Smooth scroll (Lenis) and scroll reveals (GSAP) for the Mega Lumos Webflow site. Made from the lumos-developer skill's motion starter (Manta's architecture, October 2026). Rules and gotchas: `references/motion.md` in the skill.

## Loading

| What | From |
|---|---|
| GSAP, ScrollTrigger, SplitText | Webflow's built-in GSAP (Site settings). Never from a CDN. |
| Lenis | jsDelivr, pinned version |
| `mega-motion.js` | jsDelivr from this repo, **pinned to a commit hash**, never `@main` |

- `webflow-head.html` → Site settings head code (motion class, Lenis CSS, reveal guard with a 3s fallback).
- `webflow-body.html` → Site settings footer code.
- jsDelivr minifies `mega-motion.js` into `.min.js`; no build step.

## Releasing a change

1. Edit `mega-motion.js`, commit, push.
2. Put the new commit hash in `webflow-body.html`, commit, and set it in the footer code (Site settings or the connector's `set_site_freeform_code`).
3. Publish to staging, test with Playwright (desktop, iPhone WebKit, reduced motion), then production with Derick's OK.

## Behaviour

- Lenis smooths the scroll, driven by GSAP's ticker; off under `prefers-reduced-motion`; paused while the mobile menu is open.
- Anchor links land below the fixed nav and move focus to the target; a page opened with a hash lands correctly (Safari too).
- On load: nav slides in, hero heading lines rise, paragraph fades up, hero image wipes in.
- On scroll, per section (picked up from Lumos classes): heading lines + paragraph fade, image wipes (away from their text), card wipes (`CONFIG.cards`), accordion row wipes, background panel wipe.
- `data-motion="off"` opts any element out; `data-motion="wipe-left"` / `"wipe-right"` overrides an image wipe.
- `window.megaMotion.lenis` for debugging.

## Company card logo reveals (`logo-reveals/`)

Ported from the Mega Studio's Logo Animator (the approved Brand Hub motion), same numbers and maths; GSAP runs the clock.

- `init.js` finds every `[data-logo-reveal]` (Card Company's **Logo Animation** prop), builds that brand's timeline once, and plays it on `pointerenter` and `focusin`. Nothing under `prefers-reduced-motion`. Unknown or empty values are skipped.
- One file per brand registers on `window.megaLogoReveals.brands`: `bondwright.js` (1.38 s), `copson.js` (2.1 s, the Studio's settle point of its 4.5 s loop), `glyph.js` (1.84 s), `manta.js` (2.52 s).
- `init.js` lets every logo SVG draw past its viewBox (`overflow: visible`) and offers `megaLogoReveals.fit(space, mark)`, the Studio's overlay fit (settled drawing scaled to the mark's height, on its top-left).
- A brand may return `prepare()`, run on each play before the timeline starts (Copson uses it once to fit its drawing onto the static mark with `getBBox()`, the way the Studio fits its overlay).
- **Waits for the card wipe:** while a card has `data-wipe="pending"`, hover and focus do nothing. `mega-motion.js`'s card wipe sets `pending` on set-up and `done` per card as its own staggered tween ends, and fires `mega:wiped` on the card. Without the motion script there is no attribute, so the logos work straight away.
- Each brand draws its construction pieces into the logo SVG's empty `<g data-logo-build>`, hides `<g data-logo-mark>` while it plays and shows it again at the end. The letters never move. The SVG in Webflow doesn't change.
- Loaded in one request with jsDelivr's `combine` (see `webflow-body.html`), pinned by commit.
- `window.megaLogoReveals.reveals` for debugging (`reveals[0].timeline.pause(0.6, false)` shows a pose).
- Adding a company = one new brand file plus its name in the combine URL.
