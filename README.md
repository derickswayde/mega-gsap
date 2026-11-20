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
- Companies (pass 3): each row of `.card_company_wrap` step-wipes in (three columns rising, right first: the M staircase), left card first, photo settles 1.08 → 1; rows wait until the page has been scrolled 12% of the viewport (`reveal.scrollIn`) and the hero has landed, so nothing plays before the first scroll. Sets `data-wipe` pending/done and fires `mega:wiped` for the logo reveals.
- Team (pass 4): each `.card_team_wrap` portrait step-wipes in (photo settles 1.08 → 1); the name lifts out of a mask, then role and biography paragraphs fade up.
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

## Hero cube (`cube/cube.js`)

- Desktop only (hover + fine pointer, WebGL2, no reduced motion): `mega-motion.js` lazy-loads `cube/cube(.min).js` from the same pinned commit once the hero art has landed. It imports Three.js 0.187.0 from jsDelivr (pinned) and renders the designer's GLTF (geometry embedded, 112 vertices) in a canvas laid exactly over `.hero_art_img`, then fades in over it and hides the still.
- Pose: orthographic camera fitted to the designer's render (yaw −27.25°, pitch −15.5°); framed where `mega-hero-3d.webp` has the shape. The same fade as the still is applied as a mask image.
- A soft white glow (the "puff", screen blend, 16% at its centre, fuller falloff, fades in the hero's last quarter, 30rem) follows the cursor over the cube while it is in the hero, with its own lag; fades in on the first movement, out when the cursor leaves the hero.
- Pointer anywhere in the window turns the cube (±8° / ±5°) with a soft lag, and the key light slides with it; a slow idle drift keeps it alive. Renders only while the hero is on screen.
- Tuning: `settings` at the top of `cube.js`, or live in the console via `window.megaCube.settings`.
- Touch: no cube; the still tilts back gently as the hero scrolls away (ScrollTrigger scrub in `mega-motion.js`).
