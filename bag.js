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
    label.textContent = `${item.name} × ${item.qty}`;
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
renderBag();
