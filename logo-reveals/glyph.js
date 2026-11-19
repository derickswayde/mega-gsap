/*!
 * Mega logo reveals: Glyph
 * "The tile springs up, the brackets open out from the middle, and the cursor blinks twice and stays." 1.84 s.
 * Ported from the Mega Studio's Logo Animator (approved Brand Hub motion), 19 November 2026.
 * Same numbers and the same maths as the Studio; GSAP drives the clock.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  // Studio defaults (Logo Animator → Glyph → Reveal).
  var P = { tileAt: 0.15, tileZeta: 0.6, tileOmega: 15, bracketAt: 0.4, bracketZeta: 0.55, bracketOmega: 14, travel: 22, cursorAt: 0.8, blink: 0.26, blinks: 2 };
  var BLINK_AT = P.cursorAt;                                   // 0.8
  var ON = BLINK_AT + 2 * P.blinks * P.blink;                  // 1.84: cursor stays
  var END = Math.max(ON, P.bracketAt + 0.9, P.tileAt + 0.8);   // 1.84

  // Studio geometry (160 × 160 space): the tile, and the cut-outs the mask punches into it.
  var TILE = "M99.5996 10C117.241 10 126.063 10.0003 132.801 13.4336C138.728 16.4536 143.546 21.2723 146.566 27.1992C150 33.9374 150 42.7587 150 60.4004V99.5996C150 117.241 150 126.063 146.566 132.801C143.546 138.728 138.728 143.546 132.801 146.566C126.063 150 117.241 150 99.5996 150H60.4004C42.7587 150 33.9374 150 27.1992 146.566C21.2723 143.546 16.4536 138.728 13.4336 132.801C10.0003 126.063 10 117.241 10 99.5996V60.4004C10 42.7587 10.0003 33.9374 13.4336 27.1992C16.4536 21.2723 21.2723 16.4536 27.1992 13.4336C33.9374 10.0003 42.7587 10 60.4004 10H99.5996Z";
  var LEFT = "M64.6494 37.2637L31 70.9121V89.0879L64.6494 122.737H71.2295V106.812L44.418 80L71.2295 53.1885V37.2637Z";
  var RIGHT = "M88.7646 37.2637V53.1885L115.576 80L88.7646 106.812V122.737H95.3506L129 89.0879V70.9121L95.3506 37.2637Z";
  var CURSOR = { x: 71.2295, y: 70.0322, width: 17.5351, height: 19.9356 };

  function spring(t, zeta, omega) {
    if (t <= 0) return 0;
    var wd = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  }
  function r4(v) { return +v.toFixed(4); }

  // Pure frame maths at time t. Exported for the parity test.
  function frame(t) {
    if (t >= END) return { done: true };
    var tile = spring(t - P.tileAt, P.tileZeta, P.tileOmega);
    if (tile <= 0) return { empty: true };
    return {
      scale: Math.max(0, tile),
      brackets: t >= P.bracketAt,
      offset: P.travel * (1 - spring(t - P.bracketAt, P.bracketZeta, P.bracketOmega)),
      cursor: t >= BLINK_AT && (t >= ON || Math.floor((t - BLINK_AT) / P.blink) % 2 === 0),
    };
  }

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function build(svg) {
    var mark = svg.querySelector("[data-logo-mark]");
    if (!mark) return null;
    var group = svg.querySelector("[data-logo-build]") || el("g", { "data-logo-build": "" }, svg);
    group.textContent = "";
    group.setAttribute("aria-hidden", "true");

    var id = "glyph-cut-" + ++uid;
    var mask = el("mask", { id: id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 160, height: 160 }, el("defs", {}, group));
    el("rect", { width: 160, height: 160, fill: "#fff" }, mask);
    var cuts = el("g", { fill: "#000" }, mask);
    var left = el("path", { d: LEFT }, cuts);
    var right = el("path", { d: RIGHT }, cuts);
    var cursor = el("rect", CURSOR, cuts);
    var space = el("g", {}, group);
    var scaler = el("g", {}, space);
    var tile = el("path", { d: TILE, mask: "url(#" + id + ")" }, scaler);

    function playing(on) {
      mark.style.visibility = on ? "hidden" : "";
      group.style.visibility = on ? "" : "hidden";
    }
    playing(false);

    function render(t) {
      var f = frame(t);
      if (f.done) return playing(false);
      playing(true);
      tile.style.display = f.empty ? "none" : "";
      if (f.empty) return;
      scaler.setAttribute("transform", "translate(80 80) scale(" + r4(f.scale) + ") translate(-80 -80)");
      left.style.display = right.style.display = f.brackets ? "" : "none";
      left.setAttribute("transform", "translate(" + r4(f.offset) + " 0)");
      right.setAttribute("transform", "translate(" + r4(-f.offset) + " 0)");
      cursor.style.display = f.cursor ? "" : "none";
    }

    // Fit like the Studio: the settled tile lands exactly on the static mark.
    var fitted = false;
    function prepare() {
      if (fitted) return;
      scaler.removeAttribute("transform");
      tile.style.display = "";
      fitted = window.megaLogoReveals.fit(space, mark);
      playing(false);
    }

    var clock = { t: 0 };
    var tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: END, duration: END, ease: "none", onUpdate: function () { render(clock.t); } });

    return {
      timeline: tl,
      prepare: prepare,
      destroy: function () { tl.kill(); group.textContent = ""; playing(false); },
    };
  }

  var registry = (window.megaLogoReveals = window.megaLogoReveals || { brands: {} });
  registry.brands.glyph = { build: build, frame: frame, duration: END };
})();
