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
