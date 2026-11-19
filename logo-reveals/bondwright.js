/*!
 * Mega logo reveals: Bondwright
 * "The ring opens, the bar drops, the B draws, then the bar swings level." 1.38 s.
 * Ported from the Mega Studio's Logo Animator (approved Brand Hub motion), 19 November 2026.
 * Same numbers and the same maths as the Studio; GSAP drives the clock.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  // Studio defaults (Logo Animator → Bondwright → Reveal). Zoom 1 = no close-up, but the pan still runs.
  var P = {
    ringAt: 0.25, ringZeta: 0.55, ringOmega: 16,
    barAt: 0.41, barDur: 0.45,
    drawAt: 0.4, drawDur: 0.45,
    zoom: 1, zoomAt: 0.45, zoomDur: 0.6,
    hold: -0.08, turnDur: 0.6, turnEase: 1.8, overshoot: 2.5,
  };

  // Timeline: the bar starts its swing when the drop and the draw are done (plus hold).
  var TURN_AT = Math.max(P.barAt, Math.max(P.barAt + P.barDur, P.drawAt + P.drawDur) + P.hold); // 0.78
  var END = TURN_AT + P.turnDur;                                                               // 1.38

  // Studio geometry, in the Studio's mark space.
  var FRAME_CENTRE = [25.29, 20.37];
  var RING = { cx: 18.06, cy: 20.97, r: 15.13, width: 5.87 };
  var BAR = { cx: 18.06, cy: 20.67, length: 30.26, width: 5.72 };
  var BOWLS = [
    { d: "M34.5 20.67H38.99A8.73 8.73 0 0 0 38.99 3.21H0.75", length: 4.49 + 8.73 * Math.PI + 38.24 },
    { d: "M34.5 20.67H39.29A8.43 8.43 0 0 1 39.29 37.53H0.75", length: 4.79 + 8.43 * Math.PI + 38.54 },
  ];
  // Studio mark space → the Figma lockup's mark (bounding boxes matched: x 0.7528–50.5757 → 0.7626–51.236).
  var TO_LOGO = "matrix(1.013055 0 0 1.013055 0 -0.354556)";

  // The Studio's easing maths, unchanged.
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function cosInOut(v) { return -(Math.cos(Math.PI * clamp(v)) - 1) / 2; }
  function cubicInOut(v) { var x = clamp(v); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function spring(t, zeta, omega) {
    if (t <= 0) return 0;
    var wd = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  }
  function backOut(v, s) { var x = clamp(v) - 1; return 1 + (s + 1) * x * x * x + s * x * x; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function r4(v) { return +v.toFixed(4); }

  // Pure frame maths: the state of every piece at time t (seconds). Exported for the parity test.
  function frame(t) {
    var ring = spring(t - P.ringAt, P.ringZeta, P.ringOmega);
    if (t >= END) return { done: true };
    if (ring <= 0) return { empty: true };

    var z = cubicInOut((t - P.zoomAt) / P.zoomDur);
    var scale = lerp(P.zoom, 1, z);
    var hx = lerp(RING.cx, FRAME_CENTRE[0], z);
    var hy = lerp(RING.cy, FRAME_CENTRE[1], z);

    var angle = Math.PI / 2;
    if (t >= TURN_AT) angle = (Math.PI / 2) * (1 - backOut(Math.pow((t - TURN_AT) / P.turnDur, P.turnEase), P.overshoot));

    var drop = cosInOut((t - P.barAt) / P.barDur);
    var bar = null;
    if (drop > 0) {
      var len = BAR.length * Math.min(1, ring), a = -len / 2, b = a + len * drop;
      var c = Math.cos(angle), s = Math.sin(angle);
      bar = [BAR.cx + c * a, BAR.cy + s * a, BAR.cx + c * b, BAR.cy + s * b];
    }

    return {
      camera: "translate(" + FRAME_CENTRE[0] + " " + FRAME_CENTRE[1] + ") scale(" + r4(scale) + ") translate(" + r4(-hx) + " " + r4(-hy) + ")",
      ringR: Math.max(0, RING.r * ring),
      ringW: Math.max(0, RING.width * Math.min(1, ring)),
      bar: bar,
      draw: cosInOut((t - P.drawAt) / P.drawDur),
    };
  }

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Builds the construction pieces inside the logo's data-logo-build group and returns a paused timeline.
  function build(svg) {
    var mark = svg.querySelector("[data-logo-mark]");
    if (!mark) return null;
    var group = svg.querySelector("[data-logo-build]") || el("g", { "data-logo-build": "" }, svg);
    group.textContent = "";
    group.setAttribute("aria-hidden", "true");

    var space = el("g", { transform: TO_LOGO }, group);
    var camera = el("g", {}, space);
    var stroke = { fill: "none", stroke: "currentColor" };
    var bowls = BOWLS.map(function (b) {
      return el("path", Object.assign({ d: b.d, "stroke-width": BAR.width, "stroke-linejoin": "miter" }, stroke), camera);
    });
    var bar = el("line", Object.assign({ "stroke-width": BAR.width }, stroke), camera);
    var ring = el("circle", Object.assign({ cx: RING.cx, cy: RING.cy }, stroke), camera);

    // The ring overshoots its final size, so let it draw past the viewBox while it plays.
    function playing(on) {
      mark.style.visibility = on ? "hidden" : "";
      group.style.display = on ? "" : "none";
      svg.style.overflow = on ? "visible" : "";
    }
    playing(false);

    function render(t) {
      var f = frame(t);
      if (f.done) return playing(false);
      playing(true);
      if (f.empty) { camera.style.display = "none"; return; }
      camera.style.display = "";
      camera.setAttribute("transform", f.camera);
      ring.setAttribute("r", r4(f.ringR));
      ring.setAttribute("stroke-width", r4(f.ringW));
      if (f.bar) {
        bar.style.display = "";
        bar.setAttribute("x1", r4(f.bar[0])); bar.setAttribute("y1", r4(f.bar[1]));
        bar.setAttribute("x2", r4(f.bar[2])); bar.setAttribute("y2", r4(f.bar[3]));
      } else bar.style.display = "none";
      bowls.forEach(function (p, i) {
        var len = BOWLS[i].length;
        p.style.display = f.draw > 0 ? "" : "none";
        p.setAttribute("stroke-dasharray", r4(len * f.draw) + " " + r4(2 * len));
      });
    }

    var clock = { t: 0 };
    var tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: END, duration: END, ease: "none", onUpdate: function () { render(clock.t); } });

    return {
      timeline: tl,
      reset: function () { tl.pause(0); playing(false); },
      destroy: function () { tl.kill(); group.textContent = ""; playing(false); },
    };
  }

  var registry = (window.megaLogoReveals = window.megaLogoReveals || { brands: {} });
  registry.brands.bondwright = { build: build, frame: frame, duration: END };
})();
