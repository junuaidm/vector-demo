/* ============================================================
   main.js
   Navigation scroll-spy, smooth scroll, and initialisation.
   ============================================================ */

(() => {
  "use strict";

  /* ---- Scroll-spy ---- */
  const NAV_LINKS = document.querySelectorAll(".nav-link[href^='#']");
  const SECTIONS = [];

  NAV_LINKS.forEach(link => {
    const id = link.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) SECTIONS.push({ el: sec, link });
  });

  function updateSpy() {
    const scrollY = window.scrollY + 100;
    let active = null;
    SECTIONS.forEach(s => {
      if (s.el.offsetTop <= scrollY) active = s;
    });
    NAV_LINKS.forEach(l => l.classList.remove("active"));
    if (active) active.link.classList.add("active");
  }

  window.addEventListener("scroll", updateSpy, { passive: true });
  updateSpy();

  /* ---- Init interactive components ---- */
  document.addEventListener("DOMContentLoaded", () => {
    // Vector scatter
    if (typeof VectorViz !== "undefined") VectorViz.init("vector-canvas");

    // Cosine arrows
    if (typeof CosineViz !== "undefined") CosineViz.init("cosine-canvas");

    // Hello-world walkthrough
    if (typeof CosineWalkthrough !== "undefined") {
      CosineWalkthrough.init("walkthrough-container");

      document.querySelectorAll("#walkthrough-container [data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          if (action === "next") CosineWalkthrough.nextStep();
          else if (action === "prev") CosineWalkthrough.prevStep();
          else if (action === "reset") CosineWalkthrough.reset();
          else if (action === "auto") CosineWalkthrough.autoPlay();
        });
      });
    }

    // Playground tabs
    if (typeof CosinePlayground !== "undefined") CosinePlayground.init();

    // Prism re-highlight (in case dynamic content is loaded)
    if (typeof Prism !== "undefined") Prism.highlightAll();
  });
})();
