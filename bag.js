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
  const body = Object.fromEntries(new FormData(form));
  body.items = bag.map((item) => ({ id: item.id, name: item.name, qty: item.qty }));
  let response;
  try {
    response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    response = null;
  }
  if (!response || !response.ok) {
    form.querySelectorAll("[data-order-error]").forEach((node) => { node.hidden = false; });
    return;
  }
  const order = await response.json();
  bag.length = 0;
  renderBag();
  orderDialog.close();
  location.href = `track.html?token=${order.token}`;
});
renderBag();
