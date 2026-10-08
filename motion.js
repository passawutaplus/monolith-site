/*
  MONOLITH motion
  ---------------
  The idea is "layers": like the studio's printed objects, things on the page
  build up from the bottom.

  · Headlines rise word by word out of a mask.
  · Images uncover from the bottom edge while settling from a slight zoom.
  · Blocks of text and cards lift in, staggered with their neighbours.
  · Large images drift a little slower than the page (parallax).
  · A hairline at the top tracks how far down the page you are.
  · The hero copy lifts away as you scroll past it.

  Everything is off when the visitor asks for reduced motion.
*/
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add(reduce ? "motion-off" : "motion-on");
  if (reduce) return;

  /* Blocks that fade and lift as a unit. */
  const BLOCKS = [
    ".object",
    ".shops > p",
    ".shop-list",
    ".technic-list li",
    ".technic-list > .interest",
    ".talk-side",
    ".talk-lead",
    ".talk-cta",
    ".art-stage-foot > p",
    ".art-stage-foot > .interest",
    ".catalogue-note",
    ".prints-note",
    ".design-acc article",
    ".folio-case",
    ".svc-detail",
    ".svc-list > li",
    ".svc-index > a",
    ".svc-sheet",
    ".work-head",
    ".sheet-grid > div:last-child",
    ".studio-card",
    ".track > *",
    ".art-work",
    ".art-process",
    ".art-studies > .eyebrow",
    ".side",
    ".privacy main > *",
    "main .eyebrow",
  ];

  /* Frames whose picture uncovers from below. */
  const FRAMES = [
    ".design-sum-card",
    ".strata",
    ".technic-list a img",
    ".tile-photos",
    ".art-strip figure",
    ".art-study-grid figure",
    ".art-work figure",
    ".acc-thumbs a",
    ".project-stack img",
    ".sheet-photo",
    ".svc-detail img",
    ".gallery > a",
  ];

  /* Headlines that rise word by word. */
  const HEADS = [
    "main h1:not(.hero-copy h1)",
    "main .section-title",
    ".strata h2",
    ".shops h2 .en-line",
    ".shops h2 .th",
    ".svc-sheet h2",
    ".art-studies h2",
    ".catalogue h2",
  ];

  /* Images that drift slower than the page. */
  const DRIFT = [".hero-img", ".strata img", ".svc-detail img"];

  const SKIP = ".bar, .drawer, dialog, .scroll-blur";

  /* ---------- reveal on enter ---------- */

  /* Elements waiting to reveal. Checked by geometry on each frame, so
     clip-path (which hides elements from IntersectionObserver) and fast
     jumps past a section both still reveal correctly. */
  const pending = new Set();
  const watch = {
    observe(el) { pending.add(el); tick(); },
  };

  function reveal(vh) {
    const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
    pending.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      if (rect.top < vh * 0.9 || rect.bottom <= vh + 2 || rect.bottom < 0 || (atEnd && rect.top < vh)) {
        el.classList.add("is-in");
        pending.delete(el);
      }
    });
  }

  function stagger(el, cls) {
    let n = 0;
    let prev = el.previousElementSibling;
    while (prev && n < 6) {
      if (prev.classList.contains(cls)) n += 1;
      prev = prev.previousElementSibling;
    }
    if (n) el.style.setProperty("--stagger", `${n * 80}ms`);
  }

  function armBlock(el) {
    if (el.classList.contains("m-block") || el.closest(SKIP)) return;
    if (el.parentElement?.closest(".m-block")) return;
    el.classList.add("m-block");
    stagger(el, "m-block");
    watch.observe(el);
  }

  function armFrame(el) {
    if (el.classList.contains("m-frame") || el.closest(SKIP)) return;
    el.classList.add("m-frame");
    stagger(el, "m-frame");
    watch.observe(el);
  }

  function splitWords(el) {
    if (el.classList.contains("m-split") || el.closest(SKIP)) return;
    el.classList.add("m-split");
    let index = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(document.createTextNode(part));
          return;
        }
        const outer = document.createElement("span");
        outer.className = "m-word";
        const inner = document.createElement("span");
        inner.className = "m-word-in";
        inner.style.setProperty("--i", String(index));
        inner.textContent = part;
        index += 1;
        outer.append(inner);
        frag.append(outer);
      });
      node.replaceWith(frag);
    });
    if (!el.hasAttribute("aria-label") && !el.closest("a, button")) {
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
      el.querySelectorAll(".m-word").forEach((w) => w.setAttribute("aria-hidden", "true"));
    }
    watch.observe(el);
  }

  /* ---------- scroll-linked: drift, progress, hero ---------- */

  const drifting = new Set();
  const nearby = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) drifting.add(entry.target);
      else drifting.delete(entry.target);
    });
    tick();
  }, { rootMargin: "20% 0px" });

  function armDrift(el) {
    if (el.classList.contains("m-drift")) return;
    el.classList.add("m-drift");
    nearby.observe(el);
  }

  const progress = document.createElement("div");
  progress.className = "m-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  const hero = document.querySelector(".hero, .svc-hero");
  const heroCopy = hero?.querySelector(".hero-copy, .svc-hero-bar");

  let queued = false;
  function tick() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const vh = window.innerHeight;
      reveal(vh);
      const max = document.documentElement.scrollHeight - vh;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;

      drifting.forEach((el) => {
        const box = (el.closest(".m-frame, .hero-frame, .strata, .svc-hero") || el).getBoundingClientRect();
        const centre = box.top + box.height / 2;
        const t = Math.max(-1, Math.min(1, (centre - vh / 2) / (vh / 2 + box.height / 2)));
        el.style.setProperty("--drift", `${(t * 7).toFixed(2)}%`);
      });

      if (hero && heroCopy) {
        const rect = hero.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height * 0.7)));
        heroCopy.style.setProperty("--leave", p.toFixed(3));
      }
    });
  }

  /* ---------- wire up ---------- */

  function scan(scope) {
    const base = scope instanceof Element ? scope : document;
    const pick = (list) => {
      const sel = list.join(",");
      const found = [...base.querySelectorAll(sel)];
      if (scope instanceof Element && scope.matches(sel)) found.unshift(scope);
      return found;
    };
    pick(HEADS).forEach(splitWords);
    pick(FRAMES).forEach(armFrame);
    pick(BLOCKS).forEach(armBlock);
    pick(DRIFT).forEach(armDrift);
  }

  function start() {
    scan(document);
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => root.classList.add("is-loaded"), 60)));
    tick();
    new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element && !node.matches(".m-word, .m-word-in")) scan(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  document.addEventListener("click", () => setTimeout(tick, 0));

  /* Footer wordmark rises once the footer comes into view. */
  const foot = document.querySelector(".foot-word");
  if (foot) {
    foot.classList.add("m-foot");
    watch.observe(foot);
  }
})();
