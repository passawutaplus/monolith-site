const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const selector = [
    ".object",
    ".shops",
    ".strata",
    ".design-sum-row > a",
    ".art-stage-board",
    ".technic-list li",
    ".journal",
    ".catalogue-hero",
    ".catalogue-note",
    ".gallery > a",
    ".art-work",
    ".art-film",
    ".art-studies",
    ".design-title",
    ".prints-note",
    ".design-acc article",
    ".folio-case",
    ".svc-hero",
    ".svc-detail",
    ".svc-list > li",
    ".svc-index > a",
    ".work-head",
    ".work-grid img",
    ".sheet-grid",
    ".studio-card",
    ".track > *",
  ].join(",");

  const seen = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      seen.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  function inView(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.88 && rect.bottom > 32;
  }

  function arm(el) {
    if (!(el instanceof Element) || el.classList.contains("reveal")) return;
    if (el.closest(".hero, .objects-pin, .drawer, dialog, .bar, .foot")) return;
    if (el.closest(".reveal")) return;
    el.classList.add("reveal");
    if (!inView(el)) {
      seen.observe(el);
      return;
    }
    let count = 0;
    let prev = el.previousElementSibling;
    while (prev && count < 5) {
      if (prev.classList.contains("reveal")) count += 1;
      prev = prev.previousElementSibling;
    }
    if (count) el.style.animationDelay = `${count * 60}ms`;
    el.classList.add("is-in");
  }

  function scan(root) {
    const base = root instanceof Element ? root : document;
    if (root instanceof Element && root.matches(selector)) arm(root);
    base.querySelectorAll(selector).forEach(arm);
  }

  scan(document);
  new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
}
