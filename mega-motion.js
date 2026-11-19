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
    sections: "auto",                     // "auto" = every main > section after the hero; or a list like ["#about", "#team"]
    cards: ".card_primary_wrap",          // card roots that get the card wipe (add project cards, e.g. ".card_icon_wrap")
    cardImage: ".card_primary_image",     // photo inside a card that settles during the wipe (optional)
    skip: ".carousel_wrap, footer",       // anything inside these keeps its own animation (or none)
    small: 767,                           // calmer motion at or below this width
  };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  // Hero (on load): the first section on the page.
  // Nav slides in; heading lines rise; paragraph fades up; then the photo wipes in below.
  // ─────────────────────────────────────────────
  function hero(nav) {
    var section = document.querySelector("main > section:first-child");
    var tl = gsap.timeline();
    if (nav) tl.add(nav.play(), 0);
    if (!on(section)) return;

    var heading = section.querySelector(".u-heading");
    var paras = Array.prototype.filter.call(section.querySelectorAll(".u-text"), on);
    var media = section.querySelector(".u-image-wrapper");
    if (!on(heading)) heading = null;
    if (!on(media)) media = null;
    var img = media && media.querySelector("img, video");
    var round = media ? roundOf(media) : "";

    // Starting states, set before the reveal guard lifts.
    if (heading) gsap.set(heading, { autoAlpha: 0 });
    paras.forEach(function (p) { gsap.set(p, { autoAlpha: 0, y: small ? 20 : 50 }); });
    if (media) gsap.set(media, { clipPath: "inset(0 100% 0 0" + round + ")" });
    if (img) gsap.set(img, { scale: 1.1 });

    // Never schedule into the past if a wait ran long.
    var at = function (t) { return Math.max(t, tl.time()); };

    // Text is split into lines, so it waits for the web fonts (at most 1.2s);
    // the photo follows the text and also waits until it can paint (at most 0.8s).
    var fontsOrTimeout = Promise.race([fontsReady(), new Promise(function (r) { setTimeout(r, 1200); })]);
    fontsOrTimeout.then(function () {
      var t = at(0.15);
      if (heading) {
        gsap.set(heading, { autoAlpha: 1 });
        tl.add(lineReveal(heading.firstElementChild || heading, { duration: small ? 0.55 : 0.8 }), t);
        tl.set(heading, { clearProps: "opacity,visibility" }, t + 0.01);
      }
      paras.forEach(function (p, i) {
        tl.to(p, { autoAlpha: 1, y: 0, duration: small ? 0.5 : 1, ease: "circ.out", clearProps: "transform,opacity,visibility" }, t + 0.3 + i * 0.1);
      });
      if (!media) return;
      var wipe = small ? 0.8 : 1.2;
      imageReady(img, 800).then(function () {
        var w = at(t + 0.45);
        tl.to(media, { clipPath: "inset(0 0% 0 0" + round + ")", duration: wipe, ease: "power2.inOut", clearProps: "clipPath" }, w);
        if (img) tl.to(img, { scale: 1, duration: wipe + 0.4, ease: "power2.out", clearProps: "transform" }, w);
      });
    });
  }

  // ─────────────────────────────────────────────
  // Section reveals (on scroll), shared by every section.
  // Picked up from the Lumos classes already on the page; data-motion="off" opts out.
  // ─────────────────────────────────────────────
  var reveal = {
    start: small ? "top 95%" : "top 90%",      // headings, text and images
    cardStart: small ? "top 90%" : "top 85%",  // card groups
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
    if (imgs.length) gsap.set(imgs, { scale: 1.15 });
    var tl = gsap.timeline({ paused: true });
    tl.to(cards, {
      clipPath: "inset(0% -1em -1em -1em)",
      y: 0,
      scale: 1,
      duration: dur,
      ease: "power3.out",
      stagger: stagger,
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
      try { hero(navIn()); } catch (e) {
        // Never leave the nav or hero hidden if something goes wrong.
        gsap.set(".nav_component, main > section:first-child, main > section:first-child *", { clearProps: "all" });
        console.error("[" + CONFIG.name + "-motion] hero", e);
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
