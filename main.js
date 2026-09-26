(function () {
  const photos = {
    card: "media/card-holder.jpg",
    cup: "media/pen-cup.jpg",
    phone: "media/phone-stand.jpg",
    caddy: "media/pen-caddy.jpg",
    valet: "media/valet.jpg",
    notes: "media/notes.jpg",
  };

  const photo = document.querySelector("[data-object-photo]");
  const objects = [...document.querySelectorAll("[data-object]")];
  if (!photo || !objects.length) return;

  let swap = 0;

  function onScroll() {
    const mark = window.innerHeight * 0.45;
    let current = objects[0];
    objects.forEach((article) => {
      const top = article.getBoundingClientRect().top;
      article.classList.toggle("is-quiet", top > mark + 80);
      if (top < mark) current = article;
    });
    const id = current.querySelector("[data-id]").dataset.id;
    if (photo.dataset.current === id) return;
    photo.dataset.current = id;
    const token = ++swap;
    photo.style.opacity = "0";
    setTimeout(() => {
      if (token !== swap) return;
      photo.src = photos[id];
      photo.style.opacity = "1";
    }, 180);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

(function () {
  const stage = document.querySelector("[data-art-stage]");
  if (!stage) return;
  const heroLink = stage.querySelector(".art-stage-hero");
  const reel = stage.querySelector("[data-art-reel]");
  const strip = stage.querySelector("[data-art-strip]");
  const title = stage.querySelector("[data-art-title]");
  const buttons = [...strip.querySelectorAll("[data-src]")];
  if (!reel || !strip || !buttons.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let busy = false;

  function paint(next) {
    const mid = Math.floor(buttons.length / 2);
    const count = buttons.length;
    for (let slot = 0; slot < count; slot += 1) {
      const button = buttons[(next - mid + slot + count) % count];
      strip.append(button);
      const distance = Math.abs(slot - mid);
      const current = slot === mid;
      button.classList.toggle("is-on", current);
      button.style.opacity = current ? "0" : String(Math.max(0.22, 0.9 - distance * 0.14));
      button.setAttribute("aria-pressed", current ? "true" : "false");
    }
    const selected = buttons[next];
    const img = reel.querySelector("img");
    if (img) {
      img.src = selected.dataset.src;
      img.alt = selected.dataset.alt;
    }
    if (heroLink) heroLink.href = selected.dataset.href || "art.html";
    if (title) title.textContent = selected.dataset.alt;
    index = next;
  }

  function go(next, delta) {
    if (next === index) return;
    const selected = buttons[next];
    if (!selected) return;
    if (reduce || !delta || busy) {
      if (!busy) paint(next);
      return;
    }
    busy = true;
    const gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 8;
    const step = buttons[0].getBoundingClientRect().width + gap;
    const heroRect = heroLink.getBoundingClientRect();
    const fromRect = selected.getBoundingClientRect();
    const outRect = buttons[index].getBoundingClientRect();
    const toSmall = {
      left: outRect.left - delta * step,
      top: outRect.top,
      width: outRect.width,
      height: outRect.height,
    };
    selected.style.opacity = "0";
    heroLink.style.visibility = "hidden";
    if (title) title.textContent = selected.dataset.alt;
    heroLink.href = selected.dataset.href || "art.html";

    const shrink = spawn(reel.querySelector("img").src, heroRect);
    const grow = spawn(selected.dataset.src, fromRect);
    requestAnimationFrame(() => {
      shrink.classList.add("is-run");
      grow.classList.add("is-run");
      requestAnimationFrame(() => {
        place(shrink, toSmall);
        place(grow, heroRect);
        strip.style.transform = `translateX(${-delta * step}px)`;
      });
    });

    let done = false;
    const finish = (event) => {
      if (event && event.propertyName && event.propertyName !== "width") return;
      if (done) return;
      done = true;
      grow.removeEventListener("transitionend", finish);
      shrink.remove();
      grow.remove();
      heroLink.style.visibility = "";
      strip.classList.add("is-set");
      strip.style.transform = "none";
      paint(next);
      strip.getBoundingClientRect();
      strip.classList.remove("is-set");
      busy = false;
    };
    grow.addEventListener("transitionend", finish);
    setTimeout(finish, 800);
  }

  function place(node, rect) {
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
  }

  function spawn(src, rect) {
    const node = document.createElement("img");
    node.className = "art-fly";
    node.alt = "";
    node.src = src;
    place(node, rect);
    document.body.append(node);
    return node;
  }

  strip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-src]");
    if (!button || button.classList.contains("is-on")) return;
    const visual = [...strip.children];
    const mid = Math.floor(visual.length / 2);
    go(buttons.indexOf(button), visual.indexOf(button) - mid);
  });

  paint(0);
})();
