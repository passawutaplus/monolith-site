const bar = document.querySelector(".bar");
const nav = document.querySelector(".bar-nav");

if (bar && nav && !bar.querySelector("[data-menu]")) {
  const menu = document.createElement("button");
  menu.type = "button";
  menu.className = "menu-btn";
  menu.dataset.menu = "";
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Menu");
  menu.textContent = "Menu";
  menu.addEventListener("click", () => {
    const open = bar.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.before(menu);
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      bar.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
    });
  });
}

const stored = localStorage.getItem("monolith-lang");
const ui = stored === "th" ? "th" : "en";
document.documentElement.dataset.ui = ui;
if (stored !== ui) localStorage.setItem("monolith-lang", ui);

if (!document.querySelector("[data-lang]")) {
  const lang = document.createElement("div");
  lang.className = "lang";
  lang.dataset.lang = "";
  lang.setAttribute("role", "group");
  lang.setAttribute("aria-label", "Language");
  ["en", "th"].forEach((code) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = code.toUpperCase();
    button.dataset.code = code;
    button.addEventListener("click", () => {
      document.documentElement.dataset.ui = code;
      localStorage.setItem("monolith-lang", code);
      markLang();
    });
    lang.append(button);
  });
  let foot = document.querySelector("footer");
  if (!foot) {
    foot = document.createElement("footer");
    foot.className = "foot foot-plain";
    document.body.append(foot);
  }
  const slot = foot.querySelector(".foot-contact") || foot.querySelector(".foot-grid > div") || foot.querySelector(".foot-meta");
  if (slot) slot.append(lang);
  else foot.append(lang);
  markLang();
}

function markLang() {
  const current = document.documentElement.dataset.ui;
  document.querySelectorAll("[data-code]").forEach((button) => {
    const on = current === button.dataset.code;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

document.querySelectorAll("[data-back]").forEach((link) => {
  link.innerHTML = `<svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true"><path d="M6 1 L1 6 L6 11 M1 6 H15" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
});

const logo = document.querySelector(".logo");
if (logo && !logo.querySelector(".logo-light")) {
  const light = document.createElement("img");
  light.className = "logo-light";
  light.src = "media/logo-light.png";
  light.alt = "MONOLITH";
  const dark = logo.querySelector(".logo-dark");
  if (dark) {
    dark.style.display = "";
    dark.alt = "";
    logo.prepend(light);
  }
}

function luminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function paintFromImage(img) {
  if (!img || !img.complete || !img.naturalWidth) {
    if (img) img.addEventListener("load", themeFromPoint, { once: true });
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rect = img.getBoundingClientRect();
  const x = Math.min(img.naturalWidth - 1, Math.max(0, ((window.innerWidth * 0.5 - rect.left) / rect.width) * img.naturalWidth));
  const y = Math.min(img.naturalHeight - 1, Math.max(0, ((36 - rect.top) / rect.height) * img.naturalHeight));
  context.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return luminance(pixel[0], pixel[1], pixel[2]);
}

function themeFromPoint() {
  if (!bar) return;
  const heroImg = document.querySelector(".hero-img, .svc-hero img");
  if (heroImg) {
    const rect = heroImg.getBoundingClientRect();
    if (rect.bottom > 48 && rect.top < 48) {
      const lum = paintFromImage(heroImg);
      if (lum !== null) bar.dataset.theme = lum > 0.62 ? "dark" : "light";
      return;
    }
  }
  bar.classList.add("is-sampling");
  const hit = document.elementFromPoint(Math.round(window.innerWidth * 0.5), 36);
  bar.classList.remove("is-sampling");
  if (!hit || hit === bar) return;
  if (hit.tagName === "IMG") {
    const lum = paintFromImage(hit);
    if (lum !== null) bar.dataset.theme = lum > 0.62 ? "dark" : "light";
    return;
  }
  let node = hit;
  let color = "";
  while (node && node !== document.documentElement) {
    const value = getComputedStyle(node).backgroundColor;
    const parts = value.match(/[\d.]+/g);
    if (parts && parts.length >= 3 && Number(parts[3] ?? 1) > 0.4) {
      color = value;
      break;
    }
    node = node.parentElement;
  }
  const parts = (color || "rgb(245,245,245)").match(/[\d.]+/g);
  if (!parts) return;
  bar.dataset.theme = luminance(Number(parts[0]), Number(parts[1]), Number(parts[2])) > 0.62 ? "dark" : "light";
}

themeFromPoint();
document.addEventListener("scroll", themeFromPoint, { passive: true });
window.addEventListener("resize", themeFromPoint);

async function saveLead(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("save failed");
  return response.json();
}

document.querySelectorAll("[data-follow], .foot-mail").forEach((form) => {
  const button = form.querySelector("button");
  if (button) button.type = "submit";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = new FormData(form).get("email");
    if (!email) return;
    try {
      await saveLead("/api/follow", { email });
      form.reset();
      const note = form.parentElement.querySelector("[data-follow-note]");
      if (note) note.hidden = false;
      else if (button) button.textContent = "Saved";
    } catch {
      if (button) button.textContent = "Try again";
    }
  });
});
