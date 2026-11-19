/*!
 * Mega logo reveals: Manta
 * "Intro, then the resolve": the circle springs open, the manta rises into it through a porthole with one wing
 * beat, then dips, snaps up and lands. 2.52 s.
 * Ported from the Mega Studio's Logo Animator (approved Brand Hub motion), 19 November 2026.
 * Same numbers and the same maths as the Studio; GSAP drives the clock.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var uid = 0;

  // Studio defaults (Logo Animator → Manta → Reveal).
  var P = { strokes: 1, strokeDur: 0.42, depth: 0.5, enterDur: 1, enterAt: 0.12, antic: 0.26, tuck: 0.23, sink: 2.5, snapZeta: 0.38, snapOmega: 22, bump: 0.04 };
  var LAND_AT = P.enterAt + P.enterDur; // 1.12
  var LAND_DUR = 1.4;
  var END = LAND_AT + LAND_DUR;         // 2.52

  // Studio geometry (68 × 68 space, circle centred on 34.0176, 34).
  var CX = 34.0176, CY = 34, R = 34;
  var BODY = "M33.5503 12.1992C33.8375 11.9129 34.3052 11.9129 34.5924 12.1992L42.3033 19.8829H42.3069L34.806 55.5998C34.6403 56.3817 33.5209 56.3782 33.3626 55.5962L26.0422 19.685L33.5503 12.1992Z";
  var WING_L = "M23.0927 22.6291L28.5461 47.3654C22.0689 41.3117 12.8741 38.5472 9.53797 37.7028C8.98575 37.5632 8.79789 36.8769 9.20282 36.4731L23.0927 22.6255V22.6291Z";
  var WING_R = "M58.9435 36.4731C59.3485 36.8769 59.1608 37.5632 58.6087 37.7028C55.2725 38.5472 46.0777 41.3117 39.6006 47.3654L45.0539 22.6291V22.6255L58.9435 36.4731Z";
  var AXIS_L = [[23.0927, 22.6291], [28.5461, 47.3654]]; // each wing folds about its leading edge
  var AXIS_R = [[45.0539, 22.6291], [39.6006, 47.3654]];
  var BEATS = [1, 0.62, 0.4];

  // The Studio's maths, unchanged.
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function cubicOut(v) { return 1 - Math.pow(1 - clamp(v), 3); }
  function cosInOut(v) { return -(Math.cos(Math.PI * clamp(v)) - 1) / 2; }
  function spring(t, zeta, omega) {
    if (t <= 0) return 0;
    var wd = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  }
  function mul(a, b) {
    return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  }
  function move(x, y) { return [1, 0, 0, 1, x, y]; }
  function turn(a) { return [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]; }
  function size(x, y) { return [x, 0, 0, y === undefined ? x : y, 0, 0]; }
  function matrix(m) { return "matrix(" + m.map(function (v) { return +v.toFixed(4); }).join(" ") + ")"; }
  function wing(axis, fold, sweep) {
    var cx = (axis[0][0] + axis[1][0]) / 2, cy = (axis[0][1] + axis[1][1]) / 2;
    var a = Math.atan2(-(axis[1][0] - axis[0][0]), axis[1][1] - axis[0][1]);
    return [move(cx, cy), turn(a), [1, sweep, 0, 1, 0, 0], size(fold, 1), turn(-a), move(-cx, -cy)].reduce(mul);
  }
  function beat(v, amp) { return v < 0 || v >= 1 ? 0 : amp * Math.sin(2 * Math.PI * v); }
  function wings(b) { return { fold: 1 - P.depth * b * b, sweep: 0.22 * b }; }

  // Rise into the porthole with the wing beat.
  function enter(t) {
    var b = 0;
    for (var i = 0; i < P.strokes; i++) b += beat((t - i * P.strokeDur) / P.strokeDur, BEATS[i]);
    var k = t / P.enterDur, w = wings(b);
    return { y: 58 - 53 * cubicOut(k), fold: w.fold, sweep: w.sweep, scale: 0.86 + 0.14 * (1 - Math.pow(1 - clamp(k), 4)) };
  }
  // Dip, snap up and land.
  function land(t) {
    var a = P.antic;
    if (t < a) {
      var k = cosInOut(t / a);
      return { y: 5 + P.sink * k, fold: 1 - P.tuck * k, sweep: -0.1 * k, scale: 1 - 0.03 * k, circle: 1 - 0.025 * k };
    }
    var r = t - a, s = spring(r, P.snapZeta, P.snapOmega), s2 = spring(r, Math.min(0.9, P.snapZeta + 0.12), 0.85 * P.snapOmega);
    return {
      y: (5 + P.sink) * (1 - s2),
      fold: 1 - P.tuck + P.tuck * s,
      sweep: -0.1 * (1 - s),
      scale: 0.97 + 0.03 * s2,
      circle: 0.975 + 0.025 * spring(r, 0.6, 22) + P.bump * (r < 0 ? 0 : Math.sin(2 * Math.PI * 2.6 * r) * Math.exp(-6 * r)),
    };
  }

  // Pure frame maths at time t. Exported for the parity test.
  function frame(t) {
    var pose = null;
    if (t >= P.enterAt && t < LAND_AT) pose = enter(t - P.enterAt);
    else if (t >= LAND_AT && t < END) pose = land(t - LAND_AT);
    else if (t >= END) pose = land(LAND_DUR);
    var radius = R * Math.max(0, spring(t, 0.55, 11)) * (pose && pose.circle !== undefined ? pose.circle : 1);
    return {
      done: t >= END,
      radius: radius,
      manta: pose && radius > 0.01 ? {
        body: matrix([move(CX, CY + pose.y), size(pose.scale), move(-CX, -CY)].reduce(mul)),
        left: matrix(wing(AXIS_L, pose.fold, pose.sweep)),
        right: matrix(wing(AXIS_R, pose.fold, -pose.sweep)),
      } : null,
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

    var id = "manta-porthole-" + ++uid;
    var porthole = el("circle", { cx: CX, cy: CY }, el("clipPath", { id: id }, el("defs", {}, group)));
    var space = el("g", {}, group);
    var circle = el("circle", { cx: CX, cy: CY }, space);
    // The manta is black on the white circle, like the static logo's artwork.
    var manta = el("g", { fill: "black" }, el("g", { "clip-path": "url(#" + id + ")" }, space));
    el("path", { d: BODY }, manta);
    var left = el("path", { d: WING_L }, manta);
    var right = el("path", { d: WING_R }, manta);

    function playing(on) {
      mark.style.visibility = on ? "hidden" : "";
      group.style.visibility = on ? "" : "hidden";
    }
    playing(false);

    function render(t) {
      var f = frame(t);
      if (f.done) return playing(false);
      playing(true);
      var r = f.radius.toFixed(4);
      circle.setAttribute("r", r);
      porthole.setAttribute("r", r);
      manta.style.display = f.manta ? "" : "none";
      if (!f.manta) return;
      manta.setAttribute("transform", f.manta.body);
      left.setAttribute("transform", f.manta.left);
      right.setAttribute("transform", f.manta.right);
    }

    // Fit like the Studio: the landed circle lands exactly on the static mark's circle.
    var fitted = false;
    function prepare() {
      if (fitted) return;
      render(END - 1e-6);
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
  registry.brands.manta = { build: build, frame: frame, duration: END };
})();
