/*!
 * Mega logo reveals: loader
 * Finds every [data-logo-reveal] card (set by Card Company's "Logo Animation" prop), builds that brand's
 * timeline once, and plays it on hover and keyboard focus. Nothing plays under prefers-reduced-motion.
 * Brand files (bondwright.js, …) register themselves on window.megaLogoReveals.brands; load them before or
 * after this file, as long as all are in the footer. Unknown or empty values are skipped quietly.
 */
(function () {
  "use strict";

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

        reveal.card = card;
        reveal.brand = name;
        registry.reveals.push(reveal); // window.megaLogoReveals.reveals, for debugging

        var play = function () { reveal.timeline.restart(); };
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
