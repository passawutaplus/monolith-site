const objects = {
  card: {
    code: "001",
    name: "Card Holder",
    th: "A standing tray for a thin stack of cards.",
    image: "media/card-holder.jpg",
    rows: [
      ["Material", "Clay"],
      ["Dimensions", "98 × 33 × 22 mm"],
      ["Interior", "Grey"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [
      { name: "Marble Brick", hex: "#c4624a", image: "media/card-holder.jpg" },
      { name: "Marble Slate Grey", hex: "#8d9298", image: "media/card-holder-slate.jpg" },
      { name: "Marble White CA04005", hex: "#f3f0ea", image: "media/card-holder-white.jpg" },
      { name: "Marble Sandstone", hex: "#c4a882", image: "media/card-holder-sandstone.jpg" },
      { name: "Marble Limestone", hex: "#e4d5b7", image: "media/card-holder-limestone.jpg" },
    ],
    images: ["media/card-holder.jpg", "media/card-2.jpg", "media/detail.jpg"],
  },
  cup: {
    code: "002",
    name: "Pen Cup",
    th: "Four bays, a solid base, courses running the full height.",
    image: "media/pen-cup.jpg",
    rows: [
      ["Material", "Clay"],
      ["Dimensions", "60 × 60 × 100 mm"],
      ["Interior", "Grey, four bays"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [
      { name: "Marble Brick", hex: "#c4624a" },
      { name: "Marble Slate Grey", hex: "#8d9298" },
      { name: "Marble White CA04005", hex: "#f3f0ea" },
      { name: "Marble Sandstone", hex: "#c4a882" },
      { name: "Marble Limestone", hex: "#e4d5b7" },
    ],
    images: ["media/pen-cup.jpg", "media/cup-2.jpg", "media/macro.jpg"],
  },
  phone: {
    code: "003",
    name: "Phone Stand",
    th: "A phone stand with a charcoal shell and a core of layered material.",
    image: "media/phone-stand.jpg",
    rows: [
      ["Material", "Oxide"],
      ["Shell", "Charcoal"],
      ["Core", "Layered chevron"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [
      { name: "Oxide", hex: "#ff5a1f" },
      { name: "Charcoal", hex: "#3a3a3a" },
    ],
    images: ["media/phone-stand.jpg", "media/phone-2.jpg", "media/phone-3.jpg"],
  },
  caddy: {
    code: "004",
    name: "Pen Caddy",
    th: "A pen holder with a chevron opening cut through to the core.",
    image: "media/pen-caddy.jpg",
    rows: [
      ["Material", "Oxide"],
      ["Shell", "Charcoal"],
      ["Opening", "Chevron cut-through"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [
      { name: "Oxide", hex: "#ff5a1f" },
      { name: "Charcoal", hex: "#3a3a3a" },
    ],
    images: ["media/pen-caddy.jpg", "media/caddy-2.jpg", "media/caddy-3.jpg"],
  },
  valet: {
    code: "005",
    name: "Valet Tray",
    th: "A tray for a watch and a pen, with a herringbone interior.",
    image: "media/valet.jpg",
    rows: [
      ["Material", "Oxide"],
      ["Interior", "Herringbone"],
      ["Use", "Watch and pen"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [
      { name: "Oxide", hex: "#ff5a1f" },
      { name: "Charcoal", hex: "#3a3a3a" },
    ],
    images: ["media/valet.jpg", "media/valet-2.jpg", "media/detail.jpg"],
  },
  notes: {
    code: "006",
    name: "Note Tray",
    th: "A single mass for note paper, in charcoal.",
    image: "media/notes.jpg",
    rows: [
      ["Material", "Ash"],
      ["Form", "Single mass"],
      ["Use", "Note paper"],
      ["Process", "Layered by 3D print"],
    ],
    colors: [{ name: "Ash", hex: "#6b6762" }],
    images: ["media/notes.jpg", "media/notes-2.jpg", "media/tray.jpg"],
  },
  missed: {
    kind: "print",
    code: "01",
    name: "Missed +Opportunity",
    th: "Chrome forms, split across a quiet field. Printed in layers of color.",
    back: "art.html#missed",
    backLabel: "Art",
    rows: [
      ["Process", "Digital print"],
      ["Artist", "AUN+aun"],
    ],
    sizes: [
      { name: "Postcard", note: "10 × 15 cm" },
      { name: "A6", note: "105 × 148 mm" },
      { name: "A3", note: "297 × 420 mm" },
    ],
    images: ["media/art/hold-blue.jpg", "media/art/print-blue.jpg", "media/art/detail-blue.jpg"],
  },
  journey: {
    kind: "print",
    code: "02",
    name: "Journey U+known",
    th: "A chrome loop on a red ground, printed in risograph.",
    back: "art.html#journey",
    backLabel: "Art",
    rows: [
      ["Process", "Digital print"],
      ["Artist", "AUN+aun"],
    ],
    sizes: [
      { name: "Postcard", note: "10 × 15 cm" },
      { name: "A6", note: "105 × 148 mm" },
      { name: "A3", note: "297 × 420 mm" },
    ],
    images: ["media/art/hold-red.jpg", "media/art/loop.jpg", "media/art/detail-red.jpg"],
  },
};

const id = new URLSearchParams(location.search).get("id");
const object = objects[id];
const root = document.querySelector("#sheet");

if (!object) {
  root.innerHTML = "<h1>Object</h1><p>This object was not found.</p>";
} else {
  document.title = `${object.name} — MONOLITH`;
  const rows = object.rows.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("");
  const thumbs = object.images.map((src, index) => `<button type="button" class="thumb ${index === 0 ? "is-on" : ""}" data-src="${src}"><img src="${src}" alt="" /></button>`).join("");
  const isPrint = object.kind === "print";
  const backHref = object.back || "objects.html";
  const backLabel = object.backLabel || "Objects";
  const pick = isPrint
    ? object.sizes.map((size, index) => `<button type="button" class="swatch-btn ${index === 0 ? "is-on" : ""}" data-size="${size.name}">${size.name}<span class="size-note">${size.note}</span></button>`).join("")
    : object.colors.map((color, index) => `<button type="button" class="swatch-btn ${index === 0 ? "is-on" : ""}" data-color="${color.name}"${color.image ? ` data-image="${color.image}"` : ""}><i style="background:${color.hex}"></i>${color.name}</button>`).join("");
  root.innerHTML = `
    <div class="sheet-grid">
      <div class="sheet-photo">
        <img id="hero-photo" src="${object.images[0]}" alt="${object.name}" />
        <div class="thumbs">${thumbs}</div>
      </div>
      <div>
        <p class="eyebrow">${isPrint ? "Digital print" : `Object ${object.code}`}</p>
        <p class="code"><a class="crumb-back" href="${backHref}" data-back aria-label="Back">←</a> <a href="${backHref}">${backLabel}</a> · ${object.code}</p>
        <h1>${object.name}</h1>
        <p>${object.th}</p>
        <table class="specs">${rows}</table>
        <div class="pick">
          <p class="eyebrow">${isPrint ? "Size" : "Color"}</p>
          <div class="swatches">${pick}</div>
          <p class="eyebrow">Quantity</p>
          <div class="qty">
            <button type="button" id="qty-minus" aria-label="Decrease">−</button>
            <span id="qty">1</span>
            <button type="button" id="qty-plus" aria-label="Increase">+</button>
          </div>
        </div>
        <p class="spec">Prices are quoted per order. Add pieces to a request and the studio replies with price and timing.</p>
        <button type="button" class="text-btn buy" id="buy">Add to request</button>
      </div>
    </div>`;
}

const bag = JSON.parse(localStorage.getItem("monolith-bag") || "[]");
const drawer = document.querySelector("[data-bag]");
const scrim = document.querySelector("[data-scrim]");
const list = document.querySelector("[data-bag-list]");
const empty = document.querySelector("[data-bag-empty]");
const count = document.querySelector("[data-bag-count]");
const orderDialog = document.querySelector("[data-order-dialog]");

function renderBag() {
  list.innerHTML = "";
  bag.forEach((item, index) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    const extra = [item.size, item.color].filter(Boolean).join(" · ");
    label.textContent = `${item.name}${extra ? " · " + extra : ""} × ${item.qty}`;
    const remove = document.createElement("button");
    remove.className = "text-btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      bag.splice(index, 1);
      renderBag();
    });
    li.append(label, remove);
    list.append(li);
  });
  count.textContent = String(bag.reduce((sum, item) => sum + item.qty, 0));
  empty.hidden = bag.length > 0;
  localStorage.setItem("monolith-bag", JSON.stringify(bag));
}
function openBag() {
  drawer.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => drawer.classList.add("is-open"));
}
function closeBag() {
  drawer.classList.remove("is-open");
  scrim.hidden = true;
  setTimeout(() => { drawer.hidden = true; }, 400);
}
document.querySelector("[data-open-bag]").addEventListener("click", openBag);
document.querySelector("[data-close-bag]").addEventListener("click", closeBag);
scrim.addEventListener("click", closeBag);
document.querySelector("[data-checkout]").addEventListener("click", () => {
  if (!bag.length) return;
  closeBag();
  orderDialog.showModal();
});
document.querySelector("[data-close-order]").addEventListener("click", () => orderDialog.close());
document.querySelector("[data-order-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const items = bag.map((item) => [item.name, item.color, item.size].filter(Boolean).join(" · ") + ` × ${item.qty}`).join("\n");
  const thai = document.documentElement.dataset.ui === "th";
  const status = form.querySelector("[data-order-error]");
  const submit = form.querySelector('[type="submit"]');
  form.querySelectorAll("[data-order-error]").forEach((node) => { node.hidden = true; });
  if (submit) { submit.disabled = true; submit.dataset.label ??= submit.textContent; submit.textContent = thai ? "กำลังส่ง…" : "Sending…"; }
  const fields = { ...data, items };
  const ok = await window.monolith.send("Quote request", fields);
  if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label; }
  if (!ok) {
    const link = window.monolith.mailto("Quote request", fields);
    if (status) {
      status.innerHTML = thai
        ? `ส่งไม่สำเร็จ <a href="${link}">ส่งรายการนี้ทางอีเมลแทน</a>`
        : `This didn't send. <a href="${link}">Send the list by email instead</a>.`;
      status.hidden = false;
    }
    return;
  }
  bag.length = 0;
  renderBag();
  form.reset();
  orderDialog.close();
  if (window.monolithDone) window.monolithDone();
  else alert(thai ? "ส่งแล้ว สตูดิโอจะตอบกลับทางอีเมล" : "Sent. The studio replies by email.");
});
const buy = document.querySelector("#buy");
if (buy && object) {
  let qty = 1;
  let color = object.colors ? object.colors[0].name : "";
  let size = object.sizes ? object.sizes[0].name : "";
  const qtyNode = document.querySelector("#qty");
  document.querySelector("#qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyNode.textContent = String(qty);
  });
  document.querySelector("#qty-plus").addEventListener("click", () => {
    qty += 1;
    qtyNode.textContent = String(qty);
  });
  document.querySelectorAll(".swatch-btn[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      size = button.dataset.size;
      document.querySelectorAll(".swatch-btn[data-size]").forEach((item) => item.classList.remove("is-on"));
      button.classList.add("is-on");
    });
  });
  document.querySelectorAll(".swatch-btn[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      color = button.dataset.color;
      document.querySelectorAll(".swatch-btn").forEach((item) => item.classList.remove("is-on"));
      button.classList.add("is-on");
      if (!button.dataset.image) return;
      const hero = document.querySelector("#hero-photo");
      hero.src = button.dataset.image;
      const first = document.querySelector(".thumb");
      if (!first) return;
      first.dataset.src = button.dataset.image;
      first.querySelector("img").src = button.dataset.image;
      document.querySelectorAll(".thumb").forEach((item) => item.classList.remove("is-on"));
      first.classList.add("is-on");
    });
  });
  document.querySelectorAll(".thumb").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#hero-photo").src = button.dataset.src;
      document.querySelectorAll(".thumb").forEach((item) => item.classList.remove("is-on"));
      button.classList.add("is-on");
    });
  });
  buy.addEventListener("click", () => {
    const found = bag.find((item) => item.id === id && (item.color || "") === color && (item.size || "") === size);
    if (found) found.qty += qty;
    else bag.push({ id, name: object.name, color, size, qty });
    renderBag();
    openBag();
  });
}
renderBag();
