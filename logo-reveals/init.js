/*!
 * Mega logo reveals: loader
 * Finds every [data-logo-reveal] card (set by Card Company's "Logo Animation" prop), builds that brand's
 * timeline once, and plays it on hover and keyboard focus. Nothing plays under prefers-reduced-motion.
 * Waits for the card wipe: while a card is data-wipe="pending" (set by mega-motion.js), hover does nothing.
 * Brand files (bondwright.js, …) register themselves on window.megaLogoReveals.brands; load them before or
 * after this file, as long as all are in the footer. Unknown or empty values are skipped quietly.
 */
(function () {
  "use strict";

  var registry = (window.megaLogoReveals = window.megaLogoReveals || { brands: {} });

  // Fit a brand's drawing onto the static mark the way the Studio fits its overlay: the drawing's box (as rendered
  // now, normally the settled pose) is scaled to the mark's height and placed on its top-left corner.
  // Returns false if the card isn't rendered yet (zero-size box), so the brand can try again next time.
  registry.fit = function (space, mark) {
    space.removeAttribute("transform");
    var b = space.getBBox(), m = mark.getBBox();
    if (!b.height || !m.height) return false;
    var s = m.height / b.height;
    space.setAttribute("transform", "matrix(" + [s, 0, 0, s, m.x - b.x * s, m.y - b.y * s].map(function (v) { return +v.toFixed(4); }).join(" ") + ")");
    return true;
  };

  function start() {
    var registry = window.megaLogoReveals;
    if (!window.gsap || !registry) return;

    registry.reveals = [];
    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var built = [];

      document.querySelectorAll("[data-logo-reveal]").forEach(function (card) {
        var name = (card.getAttribute("data-logo-reveal") || "").trim().toLowerCase();
        var brand = name && registry.brands[name];
        var mark = card.querySelector("svg [data-logo-mark]");
        if (!brand || !mark) return;

        var reveal = brand.build(mark.ownerSVGElement);
        if (!reveal) return;
        // Reveals draw outside the logo's viewBox (Copson's Cs start spread out; the Studio draws into an overlay
        // 4x the logo's height), so the SVG must not clip. The static logo sits inside its viewBox, so this is safe.
        mark.ownerSVGElement.style.overflow = "visible";

        reveal.card = card;
        reveal.brand = name;
        registry.reveals.push(reveal); // window.megaLogoReveals.reveals, for debugging

        // prepare(): optional per-brand setup that needs the card on screen (e.g. measuring with getBBox).
        // Cards that wipe in (mega-motion.js) are data-wipe="pending" until their wipe ends; no reveal before then.
        var play = function () {
          if (card.getAttribute("data-wipe") === "pending") return;
          if (reveal.prepare) reveal.prepare();
          reveal.timeline.restart();
        };
        card.addEventListener("pointerenter", play);
        card.addEventListener("focusin", play);
        built.push(function () {
          card.removeEventListener("pointerenter", play);
          card.removeEventListener("focusin", play);
          reveal.destroy();
        });
      });

      // Reduced motion switched on mid-visit: everything goes back to the static logos.
      return function () { built.forEach(function (undo) { undo(); }); registry.reveals = []; };
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
