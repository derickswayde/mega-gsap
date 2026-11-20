/*!
 * Mega motion
 * Smooth scroll (Lenis) and scroll reveals (GSAP) for a Lumos Webflow site.
 * Starter from the lumos-developer skill (assets/motion-starter), based on Manta's manta-motion.js (October 2026).
 *
 * Loads after Webflow's built-in GSAP (Site settings: ScrollTrigger + SplitText ticked) and Lenis (pinned, jsDelivr).
 * Opt out on any element with data-motion="off". Override an image wipe with data-motion="wipe-left" / "wipe-right".
 */
(function () {
  "use strict";

  // ─────────────────────────────────────────────
  // Project settings: the only block most projects need to touch.
  // ─────────────────────────────────────────────
  var CONFIG = {
    name: "mega",                  // class prefix: html.mega-motion / -ready (must match the head code)
    // Pass by pass (docs/2026-11-20-motion-plan.md): sections are switched on as each pass is approved.
    sections: [],                         // "auto" = every main > section after the hero; or a list like ["#about", "#team"]
    cards: ".card_primary_wrap",          // card roots that get the card wipe (add project cards, e.g. ".card_icon_wrap")
    cardImage: ".card_primary_image",     // photo inside a card that settles during the wipe (optional)
    skip: ".carousel_wrap, footer",       // anything inside these keeps its own animation (or none)
    small: 767,                           // calmer motion at or below this width
  };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Where this script was loaded from (the same pinned commit), for its lazy-loaded parts (cube/).
  var SCRIPT = (document.currentScript && document.currentScript.src) || "";
  var BASE = SCRIPT.replace(/[^/]*$/, "");
  var MIN = /\.min\.js(\?|$)/.test(SCRIPT) ? ".min" : "";

  // Shown once the script has run, so the head code's fallback timer isn't needed.
  function markReady() {
    root.classList.add(CONFIG.name + "-motion-ready");
  }

  // ─────────────────────────────────────────────
  // Lenis smooth scroll
  // ─────────────────────────────────────────────
  var lenis = null;

  function navOffset() {
    // The Lumos nav is fixed; measure it live so the banner (if shown) counts too.
    var nav = document.querySelector(".nav_component");
    return nav ? nav.getBoundingClientRect().height : 0;
  }

  function startLenis() {
    if (reduceMotion || typeof window.Lenis === "undefined") return;

    lenis = new window.Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false,
    });

    // GSAP's ticker drives Lenis so ScrollTrigger and Lenis share one frame.
    if (window.gsap) {
      if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  // ─────────────────────────────────────────────
  // Anchor links (#about, #team, skip link…)
  // Scroll below the fixed nav, then move focus to the target for keyboard users.
  // ─────────────────────────────────────────────
  function focusTarget(target) {
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  function scrollToTarget(target, immediate) {
    var offset = -navOffset();
    if (lenis) {
      lenis.scrollTo(target, {
        offset: offset,
        immediate: !!immediate,
        force: true,
        onComplete: function () {
          focusTarget(target);
        },
      });
    } else {
      var top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: top, behavior: "auto" });
      focusTarget(target);
    }
  }

  function findTarget(hash) {
    if (!hash || hash === "#") return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
      return null;
    }
  }

  function bindAnchors() {
    // Webflow's own anchor scroll ignores the fixed nav and would run after ours.
    // Switch off just that handler once Webflow is ready (the navbar's close-on-tap stays).
    window.Webflow = window.Webflow || [];
    window.Webflow.push(function () {
      if (window.jQuery) window.jQuery(document).off("click.wf-scroll");
    });

    document.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest && event.target.closest("a[href*='#']");
      if (!link) return;
      var url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || url.origin !== window.location.origin) return;
      var target = findTarget(url.hash);
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== url.hash) history.pushState(null, "", url.hash);

      // A tap inside the open mobile menu: let Webflow close it first, then scroll.
      var menuOpen = document.querySelector(".nav_component .w-nav-button.w--open");
      if (menuOpen) {
        setTimeout(function () {
          scrollToTarget(target);
        }, 50);
      } else {
        scrollToTarget(target);
      }
    });

    // A page opened with a hash (/#team) lands below the nav once layout settles.
    var initial = findTarget(window.location.hash);
    if (initial) {
      // Safari jumps to the hash itself after load, so correct on the next frames too.
      // Native scroll here (not Lenis), because Lenis's stored position is stale until it sees Safari's jump.
      var land = function () {
        var top = initial.getBoundingClientRect().top + window.scrollY - navOffset();
        window.scrollTo(0, Math.max(0, Math.round(top)));
      };
      window.addEventListener("load", function () {
        land();
        requestAnimationFrame(function () {
          setTimeout(land, 120);
        });
      });
    }
  }

  // ─────────────────────────────────────────────
  // Mobile menu: pause Lenis while it's open.
  // Lumos already sets overflow: hidden on the body.
  // ─────────────────────────────────────────────
  function bindMenu() {
    if (!lenis) return;
    var button = document.querySelector(".nav_component .w-nav-button");
    if (!button) return;
    var sync = function () {
      if (button.classList.contains("w--open")) lenis.stop();
      else lenis.start();
    };
    new MutationObserver(sync).observe(button, { attributes: true, attributeFilter: ["class"] });
  }

  // ─────────────────────────────────────────────
  // Shared helpers
  // ─────────────────────────────────────────────
  var small = window.matchMedia("(max-width: " + CONFIG.small + "px)").matches;

  function on(el) {
    return el && el.getAttribute("data-motion") !== "off";
  }

  // Mega's ease: slow to leave, very soft to land (Manta used power2.inOut).
  // Needs CustomEase (Site settings → GSAP); falls back to a close stock ease without it.
  var EASE = "power3.inOut";
  function registerEase() {
    if (window.CustomEase) {
      gsap.registerPlugin(CustomEase);
      CustomEase.create("mega", "0.65, 0, 0.15, 1");
      EASE = "mega";
    }
  }

  // Keep the element's own corner radius while it's clipped.
  function roundOf(el) {
    var r = getComputedStyle(el).borderTopLeftRadius;
    return r && r !== "0px" ? " round " + r : "";
  }

  function fontsReady() {
    return document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  }

  // Wait for an image to be ready to paint, but never longer than `max` ms.
  function imageReady(img, max) {
    if (!img) return Promise.resolve();
    var ready = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    return Promise.race([ready, new Promise(function (r) { setTimeout(r, max); })]);
  }

  // Lines rise from behind a mask. The split is undone afterwards so text reflows on resize.
  function lineReveal(el, opts) {
    var split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: CONFIG.name + "-line" });
    // Each mask is one line tall, so with a tight line-height it would clip ascenders and descenders
    // until the split is undone. Clip with clip-path instead of overflow, pushed out past the line box,
    // so the letters stay whole and the layout doesn't move.
    if (split.masks && split.masks.length) {
      gsap.set(split.masks, { overflow: "visible", clipPath: "inset(-0.3em -0.2em -0.3em -0.2em)" });
    }
    gsap.set(el, { autoAlpha: 1 });
    return gsap.from(split.lines, {
      // Start fully below the mask, clear of its extra 0.3em: the line's own height plus 0.8em.
      // (A percentage isn't enough for trimmed text, where the line box is shorter than the letters.)
      y: function (i, line) {
        var h = line.parentElement ? line.parentElement.offsetHeight : line.offsetHeight;
        return h + parseFloat(getComputedStyle(line).fontSize) * 0.8;
      },
      duration: opts.duration,
      ease: "power3.out",
      stagger: 0.12,
      delay: opts.delay || 0,
      onComplete: function () {
        split.revert();
        gsap.set(el, { clearProps: "opacity,visibility" });
      },
    });
  }

  // ─────────────────────────────────────────────
  // Nav (on load): slides down from above and fades in, with the hero wipe.
  // ─────────────────────────────────────────────
  function navIn() {
    var nav = document.querySelector(".nav_component");
    if (!on(nav)) return null;
    gsap.set(nav, { yPercent: -100, autoAlpha: 0 });
    return gsap.to(nav, {
      yPercent: 0,
      autoAlpha: 1,
      duration: small ? 0.8 : 1,
      ease: "power4.out",
      paused: true,
      clearProps: "transform,opacity,visibility",
    });
  }

  // ─────────────────────────────────────────────
  // Hero (on load): the first section on the page. The cube is the moment; the rest stays quiet.
  // Nav slides in; the cube rises and fades in slowly; the logo lifts out of a mask;
  // the intro lines rise; the button fades up.
  // ─────────────────────────────────────────────
  var heroArtLanded;
  var heroArt = new Promise(function (resolve) { heroArtLanded = resolve; });

  function hero(nav) {
    var section = document.querySelector("main > section:first-child");
    var tl = gsap.timeline();
    if (nav) tl.add(nav.play(), 0);
    if (!on(section)) return;

    var content = section.querySelector(".u-container") || section;
    var pick = function (sel) { var el = content.querySelector(sel); return on(el) ? el : null; };
    var art = section.querySelector(".hero_art_img");
    if (!on(art)) art = null;
    var icon = pick(".u-icon");
    var logo = icon ? icon.parentElement : null;  // the Logo component's wrapper
    var text = pick(".u-text");
    var button = pick(".u-button-wrapper");

    // Starting states, set before the reveal guard lifts.
    if (art) gsap.set(art, { autoAlpha: 0, y: small ? 24 : 48 });
    if (logo) gsap.set(logo, { clipPath: "inset(-10% -5% 100% -5%)", y: small ? 12 : 24 });
    // The intro rises as one block from a mask: a line split would break the balanced wrap
    // (u-text-wrap-balance) and the lines would jump when the split is undone.
    if (text) gsap.set(text, { clipPath: "inset(-10% -5% 100% -5%)", y: small ? 12 : 20 });
    if (button) gsap.set(button, { autoAlpha: 0, y: small ? 10 : 16 });

    // Never schedule into the past if a wait ran long.
    var at = function (t) { return Math.max(t, tl.time()); };

    // The cube waits until it can paint (at most 0.8s). heroArt resolves when it has landed,
    // so the live cube and the phone scroll tilt start from its resting place.
    if (art) imageReady(art, 800).then(function () {
      tl.to(art, { autoAlpha: 1, y: 0, duration: small ? 1.4 : 2, ease: EASE, clearProps: "opacity,visibility,transform", onComplete: heroArtLanded }, at(0.1));
    });
    else heroArtLanded();

    if (logo) tl.to(logo, { clipPath: "inset(-10% -5% -10% -5%)", y: 0, duration: small ? 0.8 : 1.1, ease: "power3.out", clearProps: "clipPath,transform" }, 0.35);

    if (text) tl.to(text, { clipPath: "inset(-10% -5% -10% -5%)", y: 0, duration: small ? 0.8 : 1.1, ease: "power3.out", clearProps: "clipPath,transform" }, 0.55);
    if (button) tl.to(button, { autoAlpha: 1, y: 0, duration: small ? 0.5 : 0.8, ease: "power3.out", clearProps: "transform,opacity,visibility" }, 0.9);
  }

  // ─────────────────────────────────────────────
  // Hero cube.
  // Desktop (fine pointer, WebGL): the designer's 3D M is rendered live (cube/cube.js, Three.js, loaded only here)
  // and turns with the pointer; it takes over from the still image once the hero has landed.
  // Touch: no hover, so the still image tilts back gently as the hero scrolls away.
  // ─────────────────────────────────────────────
  function webgl() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
    } catch (e) { return false; }
  }

  function heroCube() {
    var section = document.querySelector("main > section:first-child");
    var img = section && section.querySelector(".hero_art_img");
    if (!on(img) || !BASE) return;
    var desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (desktop && webgl()) {
      heroArt.then(function () {
        return import(BASE + "cube/cube" + MIN + ".js");
      }).then(function (cube) {
        return cube.start({ image: img });
      }).catch(function (e) {
        // The still image stays; nothing else depends on the cube.
        console.warn("[" + CONFIG.name + "-motion] cube", e);
      });
      return;
    }

    if (desktop || !window.ScrollTrigger) return;
    heroArt.then(function () {
      // GSAP folds the class's translate(-50%) into its transform; keep it a percentage so it stays centred on rotate.
      gsap.set(img, { x: 0, xPercent: -50, transformPerspective: 900, transformOrigin: "50% 30%" });
      gsap.to(img, {
        rotateX: 10, rotateY: -4, y: -30, ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
      });
    });
  }

  // ─────────────────────────────────────────────
  // Step wipe (Mega's signature): the element is uncovered by three columns rising from the bottom,
  // the right column leading, so the moving edge is the M's own staircase (low left, high right).
  // Returns a paused tween. Rounded corners come from the element's children, so the polygon is safe.
  // ─────────────────────────────────────────────
  // Resolves the first time the page has been scrolled past `reveal.scrollIn` of the viewport height.
  function scrolledPast(fraction) {
    return new Promise(function (resolve) {
      function check() {
        if (window.scrollY > window.innerHeight * fraction) {
          window.removeEventListener("scroll", check);
          resolve();
        }
      }
      window.addEventListener("scroll", check, { passive: true });
      check();
    });
  }

  function stepClip(t) {
    // t runs 0 → 1 + 2/3. Column i (0 = left) has risen t − (2 − i)/3 of the height.
    var h = [0, 1, 2].map(function (i) { return Math.max(0, Math.min(1, t - (2 - i) / 3)); });
    var top = function (k) { return (100 - h[k] * 100).toFixed(2) + "%"; };
    return "polygon(0% 100%, 0% " + top(0) + ", 33.34% " + top(0) + ", 33.34% " + top(1) + ", 66.67% " + top(1) +
      ", 66.67% " + top(2) + ", 100% " + top(2) + ", 100% 100%)";
  }

  function stepWipe(el, opts) {
    var p = { t: 0 };
    gsap.set(el, { clipPath: stepClip(0) });
    return gsap.to(p, {
      t: 1 + 2 / 3,
      duration: opts.duration,
      ease: EASE,
      paused: true,
      onUpdate: function () { el.style.clipPath = stepClip(p.t); },
      onComplete: function () { gsap.set(el, { clearProps: "clipPath" }); if (opts.done) opts.done(); },
    });
  }

  // ─────────────────────────────────────────────
  // Companies: each row of company cards step-wipes in as it arrives, left card first.
  // The photo settles inside the wipe; then the card's logo reveal is allowed (logo-reveals/init.js waits for data-wipe).
  // ─────────────────────────────────────────────
  function companies() {
    var cards = Array.prototype.filter.call(document.querySelectorAll(".card_company_wrap"), on);
    if (!cards.length || !window.ScrollTrigger) return;

    // Rows by their top edge (a 2 × 2 grid on desktop, one per row on phones).
    var rows = [];
    cards.forEach(function (c) {
      var top = Math.round(c.getBoundingClientRect().top + window.scrollY);
      var row = rows.find(function (r) { return Math.abs(r.top - top) < 8; });
      if (row) row.cards.push(c); else rows.push({ top: top, cards: [c] });
    });

    var dur = small ? 0.9 : 1.3, rise = small ? 20 : 40;
    var scrolledIn = scrolledPast(reveal.scrollIn);
    rows.forEach(function (row) {
      row.cards.sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
      var tl = gsap.timeline({ paused: true });
      row.cards.forEach(function (card, i) {
        var media = card.querySelector(".u-image-wrapper");
        card.setAttribute("data-wipe", "pending");
        gsap.set(card, { y: rise });
        if (media) gsap.set(media, { scale: 1.08 });
        var at = i * (small ? 0.1 : 0.16);
        var wipe = stepWipe(card, {
          duration: dur,
          done: function () {
            card.setAttribute("data-wipe", "done");
            card.dispatchEvent(new CustomEvent("mega:wiped", { bubbles: true }));
          },
        });
        tl.add(function () { wipe.play(); }, at);
        tl.to(card, { y: 0, duration: dur, ease: EASE, clearProps: "transform" }, at);
        if (media) tl.to(media, { scale: 1, duration: dur + 0.4, ease: "power2.out", clearProps: "transform" }, at);
      });
      // A row only plays once the visitor has scrolled a little (and the hero has landed),
      // so cards already in view on load wait for the first scroll instead of playing on their own.
      onScroll(row.cards[0], { play: function () { Promise.all([heroArt, scrolledIn]).then(function () { tl.play(); }); } }, reveal.cardStart);
    });
  }

  // ─────────────────────────────────────────────
  // Team (static Card Team panels; the CMS slider comes later): the portrait step-wipes in with the photo
  // settling inside it; the name lifts out of a mask; role and biography paragraphs fade up after it.
  // ─────────────────────────────────────────────
  function maskIn(el) {
    gsap.set(el, { clipPath: "inset(-10% -5% 100% -5%)", y: small ? 12 : 18 });
    return { clipPath: "inset(-10% -5% -10% -5%)", y: 0, duration: small ? 0.7 : 0.9, ease: "power3.out", clearProps: "clipPath,transform" };
  }

  function fadeUp(el) {
    gsap.set(el, { autoAlpha: 0, y: small ? 16 : 30 });
    return { autoAlpha: 1, y: 0, duration: small ? 0.6 : 1, ease: "circ.out", clearProps: "opacity,visibility,transform" };
  }

  function team() {
    var cards = Array.prototype.filter.call(document.querySelectorAll(".card_team_wrap"), on);
    if (!cards.length || !window.ScrollTrigger) return;
    var dur = small ? 0.9 : 1.3;
    cards.forEach(function (card) {
      var tl = gsap.timeline({ paused: true });
      var visual = card.querySelector(".card_team_visual");
      if (on(visual)) {
        var media = visual.querySelector(".u-image-wrapper");
        var wipe = stepWipe(visual, { duration: dur });
        if (media) gsap.set(media, { scale: 1.08 });
        tl.add(function () { wipe.play(); }, 0);
        if (media) tl.to(media, { scale: 1, duration: dur + 0.4, ease: "power2.out", clearProps: "transform" }, 0);
      }
      var name = card.querySelector(".card_team_name");
      if (on(name)) tl.to(name, maskIn(name), 0.15);
      var role = card.querySelector(".card_team_role");
      if (on(role)) tl.to(role, fadeUp(role), 0.3);
      card.querySelectorAll(".card_team_bio > *").forEach(function (p, i) {
        if (on(p)) tl.to(p, fadeUp(p), 0.42 + i * 0.12);
      });
      onScroll(card, tl, reveal.cardStart);
    });
  }

  // ─────────────────────────────────────────────
  // Backed By strip: its top and bottom rules draw outwards from the centre, then the line of text fades up
  // and the linked name rises a beat later. A border can't be drawn, so stand-in lines cover it while it plays
  // and the real borders come back unchanged at the end.
  // ─────────────────────────────────────────────
  function standInRule(wrap, side) {
    var cs = getComputedStyle(wrap);
    var width = parseFloat(cs["border" + side + "Width"]) || 0;
    if (!width || cs["border" + side + "Style"] === "none") return null;
    var line = document.createElement("div");
    line.setAttribute("aria-hidden", "true");
    var css = { position: "absolute", left: "0", right: "0", height: width + "px", background: cs["border" + side + "Color"], transformOrigin: "50% 50%", pointerEvents: "none" };
    css[side.toLowerCase()] = -width + "px";
    Object.assign(line.style, css);
    wrap.appendChild(line);
    wrap.style["border" + side + "Color"] = "transparent";
    return line;
  }

  function backedBy() {
    var wraps = Array.prototype.filter.call(document.querySelectorAll(".backed_wrap"), on);
    if (!wraps.length || !window.ScrollTrigger) return;
    wraps.forEach(function (wrap) {
      var lines = [standInRule(wrap, "Top"), standInRule(wrap, "Bottom")].filter(Boolean);
      var text = wrap.querySelector(".backed_text");
      var link = text && text.querySelector(".backed_link");
      var tl = gsap.timeline({ paused: true, onComplete: function () {
        lines.forEach(function (l) { l.remove(); });
        wrap.style.borderTopColor = wrap.style.borderBottomColor = "";
      } });
      if (lines.length) {
        gsap.set(lines, { scaleX: 0 });
        tl.to(lines, { scaleX: 1, duration: small ? 0.8 : 1.1, ease: EASE }, 0);
      }
      if (on(text)) tl.to(text, fadeUp(text), small ? 0.3 : 0.45);
      if (on(link)) tl.to(link, maskIn(link), small ? 0.45 : 0.65);
      onScroll(wrap, tl, reveal.cardStart);
    });
  }

  // ─────────────────────────────────────────────
  // Contact form: the heading lifts out of a mask; each field steps in after the one above it (label fades up,
  // then a stand-in outline draws round the field clockwise from the top-left corner and the placeholder fades
  // in); the button comes last. The real border is hidden while the stand-in draws and restored at the end.
  // Clicking into a field mid-animation jumps to the end, so focus states are never covered.
  // ─────────────────────────────────────────────
  var SVGNS = "http://www.w3.org/2000/svg";

  function standInOutline(field) {
    var cs = getComputedStyle(field);
    var bw = parseFloat(cs.borderTopWidth) || 0;
    if (!bw || cs.borderTopStyle === "none") return null;
    var holder = field.parentElement;
    if (getComputedStyle(holder).position === "static") holder.style.position = "relative";
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, { position: "absolute", overflow: "visible", pointerEvents: "none" });
    var rect = document.createElementNS(SVGNS, "rect");
    rect.setAttribute("fill", "none");
    rect.style.stroke = cs.borderTopColor;
    rect.style.strokeWidth = bw + "px";
    svg.appendChild(rect);
    holder.appendChild(svg);
    field.style.borderColor = "transparent";
    // Measured when it starts drawing, after fonts have settled the layout.
    function fit() {
      var w = field.offsetWidth, h = field.offsetHeight, half = bw / 2;
      var r = Math.min(parseFloat(getComputedStyle(field).borderTopLeftRadius) || 0, w / 2, h / 2);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.style.left = field.offsetLeft + "px";
      svg.style.top = field.offsetTop + "px";
      rect.setAttribute("x", half);
      rect.setAttribute("y", half);
      rect.setAttribute("width", Math.max(0, w - bw));
      rect.setAttribute("height", Math.max(0, h - bw));
      rect.setAttribute("rx", Math.max(0, r - half));
      var len = rect.getTotalLength ? rect.getTotalLength() : 2 * (w + h);
      rect.style.strokeDasharray = len + " " + len;
      rect.style.strokeDashoffset = len;
    }
    fit();
    return { svg: svg, rect: rect, holder: holder, field: field, fit: fit };
  }

  function contact() {
    var forms = Array.prototype.filter.call(document.querySelectorAll(".form_element.is-contact"), on);
    if (!forms.length || !window.ScrollTrigger) return;
    var step = small ? 0.1 : 0.14;
    var draw = small ? 0.7 : 1.0;
    forms.forEach(function (form) {
      var outlines = [];
      var tl = gsap.timeline({ paused: true,
        onStart: function () { outlines.forEach(function (o) { o.fit(); }); },
        onComplete: function () {
          outlines.forEach(function (o) { o.svg.remove(); o.field.style.borderColor = ""; o.holder.style.position = ""; });
        } });
      var heading = form.querySelector(".u-heading");
      if (on(heading)) tl.to(heading, maskIn(heading), 0);
      var at = 0.2;
      form.querySelectorAll(".form_label_wrap").forEach(function (row) {
        if (!on(row)) return;
        var label = row.querySelector(".form_label_text");
        var field = row.querySelector(".form_field");
        if (label) tl.to(label, fadeUp(label), at);
        if (field) {
          var o = standInOutline(field);
          if (o) {
            outlines.push(o);
            tl.to(o.rect, { strokeDashoffset: 0, duration: draw, ease: EASE }, at + 0.1);
          }
          gsap.set(field, { autoAlpha: 0 });
          tl.to(field, { autoAlpha: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity,visibility" }, at + 0.1 + draw * 0.35);
        }
        at += step;
      });
      var button = form.querySelector(".u-button-wrapper");
      if (on(button)) tl.to(button, fadeUp(button), Math.max(at + draw * 0.5, 0.6));
      form.addEventListener("focusin", function () { if (tl.progress() < 1) tl.progress(1); });
      onScroll(form, tl, reveal.cardStart);
    });
  }

  // ─────────────────────────────────────────────
  // Footer (on scroll): the two column rules draw in from the left; the headline rises line by line; the
  // button and the links step in after it. The wordmark has its own trigger: its four letters rise out of the
  // logo's own bounds (the SVG clips them), M first, A last, then the copyright line fades up.
  // ─────────────────────────────────────────────
  function drawRule(wrap) {
    var cs = getComputedStyle(wrap);
    var width = parseFloat(cs.borderTopWidth) || 0;
    if (!width || cs.borderTopStyle === "none") return null;
    var setPos = cs.position === "static";
    if (setPos) wrap.style.position = "relative";
    var line = document.createElement("div");
    line.setAttribute("aria-hidden", "true");
    Object.assign(line.style, { position: "absolute", left: "0", right: "0", top: -width + "px", height: width + "px", background: cs.borderTopColor, transformOrigin: "0 50%", pointerEvents: "none" });
    wrap.appendChild(line);
    wrap.style.borderTopColor = "transparent";
    gsap.set(line, { scaleX: 0 });
    return {
      line: line,
      restore: function () { line.remove(); wrap.style.borderTopColor = ""; if (setPos) wrap.style.position = ""; },
    };
  }

  function footer() {
    var wrap = document.querySelector(".footer_wrap");
    if (!on(wrap) || !window.ScrollTrigger) return;
    var draw = small ? 0.7 : 1.0;

    // CTA and links
    var layout = wrap.querySelector(".footer_layout");
    if (on(layout)) {
      var rules = [];
      var tl = gsap.timeline({ paused: true, onComplete: function () { rules.forEach(function (r) { r.restore(); }); } });
      [".footer_content", ".footer_links"].forEach(function (sel, i) {
        var col = layout.querySelector(sel);
        var r = col && on(col) ? drawRule(col) : null;
        if (r) { rules.push(r); tl.to(r.line, { scaleX: 1, duration: draw, ease: EASE }, i * 0.12); }
      });
      var heads = Array.prototype.filter.call(layout.querySelectorAll(".footer_content_top .u-heading"), on);
      heads.forEach(function (h, i) {
        var el = h.firstElementChild || h;
        gsap.set(el, { autoAlpha: 0 });
        tl.add(function () { fontsReady().then(function () { lineReveal(el, { duration: small ? 0.55 : 0.8 }); }); }, 0.15 + i * 0.15);
      });
      var button = layout.querySelector(".footer_content > .button_main_wrap");
      if (on(button)) tl.to(button, fadeUp(button), 0.5);
      Array.prototype.filter.call(layout.querySelectorAll(".footer_group_item"), on).forEach(function (item, i) {
        tl.to(item, fadeUp(item), 0.3 + i * (small ? 0.06 : 0.08));
      });
      onScroll(layout, tl, reveal.cardStart);
    }

    // Wordmark builds, then the copyright line
    var logo = wrap.querySelector(".footer_logo_wrap");
    var letters = on(logo) ? Array.prototype.slice.call(logo.querySelectorAll("svg path")) : [];
    var bottom = wrap.querySelector(".footer_bottom_text");
    if (letters.length || on(bottom)) {
      var tl2 = gsap.timeline({ paused: true });
      if (letters.length) {
        var svg = letters[0].ownerSVGElement;
        var vb = svg.viewBox && svg.viewBox.baseVal;
        var travel = vb && vb.height ? vb.height * 1.05 : 24;
        // The letters sit in SVG units: move each a full logo height below the viewBox, which the SVG clips.
        gsap.set(svg, { overflow: "hidden" });
        gsap.set(letters, { y: travel });
        tl2.to(letters, { y: 0, duration: small ? 0.9 : 1.2, ease: EASE, stagger: small ? 0.08 : 0.11, clearProps: "transform" }, 0);
      }
      if (on(bottom)) tl2.to(bottom, fadeUp(bottom), letters.length ? 0.6 : 0);
      if (letters.length) tl2.add(function () { knockout(logo); });
      onScroll(logo || bottom, tl2, reveal.cardStart);
    } else if (on(logo)) {
      knockout(logo);
    }
  }

  // ─────────────────────────────────────────────
  // Footer wordmark pixel knockout, the quiet version (Derick, 20 November 2026: the first cut felt "gamey").
  // The wordmark dissolves on its own block grid around the pointer (a cell is half an M step: 2.381 of the
  // logo's 92 × 20 units, about 35px at 1440). A soft brush: the cell under the pointer clears, its neighbours
  // only partly, falling off with distance. Cells fade out quickly and settle back slowly on a soft ease, and the
  // brush trails the pointer with a little lag (like the hero puff), so the trail flows rather than twitches.
  // Done inside the SVG with a <mask> (white = letters shown, darker grey cells = more cleared). Fine pointers only;
  // touch devices get one soft diagonal pass, lower left to upper right (the staircase direction), after the
  // wordmark has built. Reduced motion: nothing (whole script is off).
  // ─────────────────────────────────────────────
  var knock = {
    cell: 4.76217 / 2,  // logo units: half an M step
    radius: 1.6,        // brush reach in cells; strength falls off with distance
    peak: 1,            // strength at the brush centre (1 = fully cleared)
    floor: 0.08,        // cells fainter than this aren't touched
    follow: 0.16,       // how quickly the brush catches the pointer each frame (lower = smoother, more lag)
    fadeIn: 0.2,        // seconds for a cell to clear
    hold: 0.25,         // seconds it stays cleared after the brush moves on
    jitter: 0.12,       // extra random hold, so cells settle back one by one, gently
    heal: 1.2,          // seconds for a cell to settle back
    sweep: 0.5,         // touch: strength of the diagonal pass
    sweepStep: 0.05,    // touch: seconds between columns (about 2s across the wordmark)
    sweepHeal: 0.4,     // touch: seconds for each cell to settle back (short, so the pass travels as a narrow band)
  };
  var knockId = 0;

  function knockout(logo) {
    var svg = logo && logo.querySelector("svg");
    if (!svg || svg.getAttribute("data-knockout")) return;
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width) return;
    svg.setAttribute("data-knockout", "on");

    // <mask>: a white sheet, with dark cells added over it. The letters move into a group that uses it.
    var id = CONFIG.name + "-knockout-" + ++knockId;
    var defs = document.createElementNS(SVGNS, "defs");
    var mask = document.createElementNS(SVGNS, "mask");
    mask.setAttribute("id", id);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    ["x", "y", "width", "height"].forEach(function (k, i) { mask.setAttribute(k, [vb.x - 1, vb.y - 1, vb.width + 2, vb.height + 2][i]); });
    var sheet = document.createElementNS(SVGNS, "rect");
    ["x", "y", "width", "height"].forEach(function (k, i) { sheet.setAttribute(k, [vb.x - 1, vb.y - 1, vb.width + 2, vb.height + 2][i]); });
    // Lumos styles every shape inside .u-icon with fill: currentColor, which would turn the mask white; force the mask fills.
    sheet.style.setProperty("fill", "#fff", "important");
    mask.appendChild(sheet);
    defs.appendChild(mask);
    var group = document.createElementNS(SVGNS, "g");
    group.setAttribute("mask", "url(#" + id + ")");
    Array.prototype.slice.call(svg.children).forEach(function (child) { if (child.tagName.toLowerCase() !== "defs") group.appendChild(child); });
    svg.appendChild(defs);
    svg.appendChild(group);

    var size = knock.cell;
    var cols = Math.ceil(vb.width / size), rows = Math.ceil(vb.height / size);
    var cells = new Map();

    // Clear a cell to at least `strength` (0–1), hold, then let it settle back (over `heal` seconds, default knock.heal).
    function touch(c, r, strength, hold, heal) {
      if (c < 0 || r < 0 || c >= cols || r >= rows || strength < knock.floor) return;
      var key = c + ":" + r;
      var cell = cells.get(key);
      if (!cell) {
        var rect = document.createElementNS(SVGNS, "rect");
        // Each cell is an opaque grey (white = letter shown, black = cleared), never a translucent black: overlapping
        // translucent cells darken where they meet and show a grid. Opaque cells can overlap a hair (bleed, about
        // 0.7px at 1440) to close anti-aliased seams, because the later one simply paints over the earlier one.
        var bleed = 0.05;
        rect.setAttribute("x", vb.x + c * size - bleed);
        rect.setAttribute("y", vb.y + r * size - bleed);
        rect.setAttribute("width", size + bleed * 2);
        rect.setAttribute("height", size + bleed * 2);
        mask.appendChild(rect);
        cell = { rect: rect, v: 0, tl: null };
        cell.paint = function () {
          var g = Math.round(255 * (1 - cell.v));
          cell.rect.style.setProperty("fill", "rgb(" + g + "," + g + "," + g + ")", "important");
        };
        cell.paint();
        cells.set(key, cell);
      }
      var now = cell.v;
      var target = Math.max(now, strength);
      if (cell.tl) cell.tl.kill();
      cell.tl = gsap.timeline({ onUpdate: cell.paint, onComplete: function () { cell.rect.remove(); cells.delete(key); } })
        .to(cell, { v: target, duration: target > now ? knock.fadeIn : 0.001, ease: "power2.out" })
        .to(cell, { v: 0, duration: heal || knock.heal, ease: "power2.inOut" }, "+=" + (hold + Math.random() * knock.jitter));
    }

    // Soft brush around a point (in logo units): full at the centre, falling off with distance.
    function brush(x, y) {
      var cx = x / size, cy = y / size, reach = knock.radius + 0.5;
      for (var c = Math.floor(cx - reach); c <= Math.floor(cx + reach); c++) {
        for (var r = Math.floor(cy - reach); r <= Math.floor(cy + reach); r++) {
          var d = Math.hypot(c + 0.5 - cx, r + 0.5 - cy) / reach;
          if (d < 1) touch(c, r, knock.peak * Math.pow(1 - d, 1.5), knock.hold);
        }
      }
    }

    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) {
      // One soft diagonal pass, lower left first, in the staircase direction.
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          gsap.delayedCall((c + (rows - 1 - r) * 0.8) * knock.sweepStep, touch, [c, r, knock.sweep, 0, knock.sweepHeal]);
        }
      }
      return;
    }

    var target = null, brushAt = null, running = false;
    function toLogo(e) {
      var ctm = svg.getScreenCTM();
      if (!ctm) return null;
      var pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      return { x: pt.x - vb.x, y: pt.y - vb.y };
    }
    function tick() {
      if (!target || !brushAt) return stop();
      var next = { x: brushAt.x + (target.x - brushAt.x) * knock.follow, y: brushAt.y + (target.y - brushAt.y) * knock.follow };
      // Fill the gap since the last frame, so the trail stays unbroken.
      var steps = Math.max(1, Math.ceil(Math.hypot(next.x - brushAt.x, next.y - brushAt.y) / (size * 0.5)));
      for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        brush(brushAt.x + (next.x - brushAt.x) * t, brushAt.y + (next.y - brushAt.y) * t);
      }
      brushAt = next;
      // Once the brush has caught up (pointer resting, or gone), it stops and the wordmark settles back.
      if (Math.hypot(target.x - brushAt.x, target.y - brushAt.y) < size * 0.1) stop();
    }
    function start() { if (!running) { running = true; gsap.ticker.add(tick); } }
    function stop() { if (running) { running = false; gsap.ticker.remove(tick); } }
    logo.addEventListener("pointerenter", function (e) {
      target = toLogo(e);
      if (!running) brushAt = target;
      start();
    });
    logo.addEventListener("pointermove", function (e) { target = toLogo(e); if (!brushAt) brushAt = target; start(); });
  }

  // ─────────────────────────────────────────────
  // Section reveals (on scroll), shared by every section.
  // Picked up from the Lumos classes already on the page; data-motion="off" opts out.
  // ─────────────────────────────────────────────
  var reveal = {
    start: small ? "top 95%" : "top 90%",      // headings, text and images
    cardStart: small ? "top 90%" : "top 85%",  // card groups
    scrollIn: 0.12,                            // company cards wait until the page has been scrolled this much (× viewport height)
  };

  // Plays a timeline once when `trigger` reaches the start line.
  function onScroll(trigger, tl, start) {
    ScrollTrigger.create({
      trigger: trigger,
      start: start || reveal.start,
      once: true,
      onEnter: function () { tl.play(); },
    });
  }

  // Heading lines rise, then the paragraph(s) that follow it fade up.
  function textBlock(heading, paragraphs) {
    // Typography Heading wraps its h-tag in a rich text block; Typography Plain is the h-tag itself.
    var target = /^H[1-6]$/.test(heading.tagName) ? heading : heading.firstElementChild || heading;
    var big = parseFloat(getComputedStyle(target).fontSize) >= 60;
    gsap.set(heading, { autoAlpha: 0 });
    paragraphs.forEach(function (p) { gsap.set(p, { autoAlpha: 0, y: small ? 20 : 50 }); });
    fontsReady().then(function () {
      var tl = gsap.timeline({ paused: true });
      gsap.set(heading, { autoAlpha: 1 });
      tl.add(lineReveal(target, { duration: small ? 0.55 : big ? 1 : 0.8 }), 0);
      tl.set(heading, { clearProps: "opacity,visibility" }, 0.01);
      paragraphs.forEach(function (p, i) {
        tl.to(p, { autoAlpha: 1, y: 0, duration: small ? 0.5 : 1, ease: "circ.out", clearProps: "transform,opacity,visibility" }, 0.15 + i * 0.1);
      });
      onScroll(heading, tl);
    });
  }

  // Image wipe: uncovers left to right (or right to left), the photo settling from 1.1 to 1.
  function imageWipe(wrap, fromRight) {
    var img = wrap.querySelector("img, video");
    var round = roundOf(wrap);
    var hidden = fromRight ? "inset(0 0 0 100%" + round + ")" : "inset(0 100% 0 0" + round + ")";
    var dur = small ? 0.8 : 1.2;
    gsap.set(wrap, { clipPath: hidden });
    if (img) gsap.set(img, { scale: 1.1 });
    var tl = gsap.timeline({ paused: true });
    tl.to(wrap, { clipPath: "inset(0 0% 0 0%" + round + ")", duration: dur, ease: "power2.inOut", clearProps: "clipPath" }, 0);
    if (img) tl.to(img, { scale: 1, duration: dur + 0.4, ease: "power2.out", clearProps: "transform" }, 0);
    onScroll(wrap, tl);
  }

  // Card wipe (Moco's stagger cards): a curtain lifts from below as the cards rise, one after another.
  // A photo inside the card (CONFIG.cardImage) settles from 1.15 to 1 during the curtain, which gives the wipe depth.
  function cardWipe(cards) {
    var dur = small ? 0.7 : 1.2;
    var stagger = small ? 0.08 : 0.12;
    var imgs = CONFIG.cardImage ? cards.map(function (c) { return c.querySelector(CONFIG.cardImage); }).filter(Boolean) : [];
    // The clip reaches 1em past the sides and bottom: trimmed text (Lumos text-box trim) hangs its
    // descenders just outside the card, and a flush clip would cut them until the wipe ends.
    gsap.set(cards, { clipPath: "inset(30% -1em -1em -1em)", y: small ? 25 : 60, scale: small ? 1 : 0.96 });
    // Hand-off: anything that waits for a card (e.g. the company logo reveals) checks data-wipe and
    // can listen for "mega:wiped" on the card. "done" is set per card as its own wipe ends.
    cards.forEach(function (c) { c.setAttribute("data-wipe", "pending"); });
    if (imgs.length) gsap.set(imgs, { scale: 1.15 });
    var tl = gsap.timeline({ paused: true });
    tl.to(cards, {
      clipPath: "inset(0% -1em -1em -1em)",
      y: 0,
      scale: 1,
      duration: dur,
      ease: "power3.out",
      stagger: {
        each: stagger,
        onComplete: function () {
          var card = this.targets()[0];
          card.setAttribute("data-wipe", "done");
          card.dispatchEvent(new CustomEvent("mega:wiped", { bubbles: true }));
        },
      },
      clearProps: "clipPath,transform",
    }, 0);
    if (imgs.length) tl.to(imgs, { scale: 1, duration: dur + 0.3, ease: "power3.out", stagger: stagger, clearProps: "transform" }, 0);
    onScroll(cards[0], tl, reveal.cardStart);
  }

  // Row wipe: list rows uncover left to right, staggered.
  function rowWipe(rows) {
    gsap.set(rows, { clipPath: "inset(0 100% 0 0)" });
    var tl = gsap.timeline({ paused: true });
    tl.to(rows, { clipPath: "inset(0 0% 0 0)", duration: small ? 0.7 : 0.9, ease: "power2.inOut", stagger: 0.1, clearProps: "clipPath" });
    onScroll(rows[0], tl);
  }

  // Background panel: uncovers top to bottom as the section arrives.
  function panelWipe(panel, section) {
    gsap.set(panel, { clipPath: "inset(0% 0% 100% 0%)" });
    var tl = gsap.timeline({ paused: true });
    tl.to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: small ? 1 : 1.4, ease: "power2.inOut", clearProps: "clipPath" });
    onScroll(section, tl, "top 100%");
  }

  // Headings: Typography Heading, and Typography Plain set to a heading tag.
  var HEADINGS = ".u-heading, h1.u-text, h2.u-text, h3.u-text, h4.u-text";

  // Elements inside these are left to their own animation.
  var SKIP = [CONFIG.cards, ".accordion_wrap", CONFIG.skip].filter(Boolean).join(", ");

  function free(el) {
    return on(el) && !el.closest(SKIP) && !el.closest("[data-motion='off']");
  }

  function sectionReveal(section) {
    // Headings and the paragraphs in the same content wrapper.
    // A heading claims the paragraphs in its grid (or its own wrapper), so side-by-side layouts pair up.
    var claimed = new Set();
    var headings = Array.prototype.filter.call(section.querySelectorAll(HEADINGS), free);
    headings.forEach(function (h) { claimed.add(h); });
    headings.forEach(function (h) {
      var group = h.closest(".u-grid") || h.parentElement;
      var paras = Array.prototype.filter.call(group.querySelectorAll(".u-text"), function (p) {
        return free(p) && !claimed.has(p);
      });
      paras.forEach(function (p) { claimed.add(p); });
      textBlock(h, paras);
    });

    // A plain background panel (Lumos background slot, not an image) uncovers from the top.
    var panel = section.querySelector(":scope > .u-background-slot > :not(.u-image-wrapper):not(.u-overlay)");
    if (on(panel)) panelWipe(panel, section);

    // Images (not background images or images inside cards).
    // A photo wipes away from the text beside it: one on the left of the page uncovers right to left.
    // data-motion="wipe-left" / "wipe-right" overrides.
    section.querySelectorAll(".u-image-wrapper").forEach(function (wrap) {
      if (!free(wrap) || wrap.closest(".u-background-slot")) return;
      var r = wrap.getBoundingClientRect();
      var onLeft = r.left + r.width / 2 < window.innerWidth * 0.4;
      var mode = wrap.getAttribute("data-motion");
      imageWipe(wrap, mode === "wipe-left" || (mode !== "wipe-right" && onLeft));
    });

    // Accordion rows uncover left to right, one after another (opening and closing stay with Lumos).
    section.querySelectorAll(".accordion_list").forEach(function (list) {
      var rows = Array.prototype.filter.call(list.querySelectorAll(":scope > .accordion_item"), on);
      if (rows.length) rowWipe(rows);
    });

    // Cards (CONFIG.cards), grouped by their list.
    var groups = new Map();
    if (CONFIG.cards) section.querySelectorAll(CONFIG.cards).forEach(function (card) {
      if (!on(card)) return;
      var key = card.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(card);
    });
    groups.forEach(function (cards) { cardWipe(cards); });
  }

  function sectionList() {
    if (CONFIG.sections !== "auto") {
      return CONFIG.sections.map(function (sel) { return document.querySelector(sel); }).filter(Boolean);
    }
    return Array.prototype.slice.call(document.querySelectorAll("main > section")).slice(1); // the first is the hero
  }

  function sections() {
    if (!window.ScrollTrigger) return;
    sectionList().forEach(function (section) {
      if (!on(section) || section.closest(CONFIG.skip)) return;
      try { sectionReveal(section); } catch (e) {
        gsap.set(section.querySelectorAll("*"), { clearProps: "all" });
        console.error("[" + CONFIG.name + "-motion] section", section.id || section.className, e);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Project effects go here (signature moment, footer, carousel…).
  // Manta's eyebrow wake line, carousel reveal and footer are good models: see manta-motion.js in derickswayde/manta-gsap.
  // Wrap each in try/catch in init() and clear its props on failure, so nothing is ever left hidden.
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────
  function init() {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    startLenis();
    bindAnchors();
    bindMenu();
    var canAnimate = !reduceMotion && window.gsap && window.SplitText;
    if (canAnimate) {
      gsap.registerPlugin(SplitText);
      registerEase();
      try { hero(navIn()); } catch (e) {
        // Never leave the nav or hero hidden if something goes wrong.
        gsap.set(".nav_component, main > section:first-child, main > section:first-child *", { clearProps: "all" });
        console.error("[" + CONFIG.name + "-motion] hero", e);
      }
      try { heroCube(); } catch (e) {
        console.error("[" + CONFIG.name + "-motion] cube", e);
      }
      try { companies(); } catch (e) {
        gsap.set(".card_company_wrap, .card_company_wrap *", { clearProps: "all" });
        document.querySelectorAll(".card_company_wrap").forEach(function (c) { c.setAttribute("data-wipe", "done"); });
        console.error("[" + CONFIG.name + "-motion] companies", e);
      }
      try { team(); } catch (e) {
        gsap.set(".card_team_wrap, .card_team_wrap *", { clearProps: "all" });
        console.error("[" + CONFIG.name + "-motion] team", e);
      }
      try { backedBy(); } catch (e) {
        gsap.set(".backed_wrap, .backed_wrap *", { clearProps: "all" });
        document.querySelectorAll(".backed_wrap").forEach(function (w) { w.style.borderTopColor = w.style.borderBottomColor = ""; });
        console.error("[" + CONFIG.name + "-motion] backed by", e);
      }
      try { contact(); } catch (e) {
        gsap.set(".form_element.is-contact, .form_element.is-contact *", { clearProps: "all" });
        document.querySelectorAll(".form_element.is-contact .form_field").forEach(function (f) { f.style.borderColor = ""; });
        document.querySelectorAll(".form_element.is-contact svg[aria-hidden]").forEach(function (s) { s.remove(); });
        console.error("[" + CONFIG.name + "-motion] contact", e);
      }
      try { footer(); } catch (e) {
        gsap.set(".footer_wrap, .footer_wrap *", { clearProps: "all" });
        document.querySelectorAll(".footer_content, .footer_links").forEach(function (c) { c.style.borderTopColor = ""; c.style.position = ""; });
        console.error("[" + CONFIG.name + "-motion] footer", e);
      }
      sections();
    }
    markReady();

    // Recalculate trigger positions once fonts and images have settled.
    window.addEventListener("load", function () {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    window[CONFIG.name + "Motion"] = { lenis: lenis, reduceMotion: reduceMotion };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
