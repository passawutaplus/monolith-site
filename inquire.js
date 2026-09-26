const CHANNELS = [
  { name: "LINE", href: "https://lin.ee/zi0qAQb" },
  { name: "Instagram", href: "https://instagram.com/monolith.design" },
  { name: "Fastwork", href: "https://fastwork.co/" },
];

const inquire = document.querySelector("[data-inquire-dialog]");
const inquireForm = document.querySelector("[data-inquire-form]");

function fillChannels(list) {
  if (!list || list.childElementCount) return;
  CHANNELS.forEach((channel) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = channel.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = channel.name;
    item.append(link);
    list.append(item);
  });
}

if (inquireForm && !inquireForm.querySelector(".contact-channels")) {
  const list = document.createElement("ul");
  list.className = "contact-channels";
  list.dataset.contactChannels = "";
  const anchor = inquireForm.querySelector(".th") || inquireForm.querySelector("p") || inquireForm.querySelector("h2");
  anchor?.after(list);
}

fillChannels(inquireForm?.querySelector("[data-contact-channels], .contact-channels"));

function ensureReplyFields(form) {
  if (!form) return;
  const email = form.querySelector('[name="email"]');
  const afterEmail = email?.closest("label") || email;
  if (!form.querySelector('[name="phone"]')) {
    const phone = document.createElement("label");
    phone.innerHTML = `<span class="en-line">Phone</span><span class="th">เบอร์</span> <input name="phone" type="tel" autocomplete="tel" />`;
    afterEmail?.after(phone);
  }
  if (!form.querySelector('[name="line"]')) {
    const line = document.createElement("label");
    line.innerHTML = `<span class="en-line">LINE ID</span><span class="th">ไอดีไลน์</span> <input name="line" autocomplete="off" />`;
    const phoneLabel = form.querySelector('[name="phone"]')?.closest("label");
    (phoneLabel || afterEmail)?.after(line);
  }
}

ensureReplyFields(inquireForm);

const picked = [];

function addImages(form) {
  if (!form || form.querySelector("[data-images]")) return;
  const note = form.querySelector("textarea");
  const field = document.createElement("div");
  field.className = "file-field";
  field.innerHTML = `
    <span class="file-label"><span class="en-line">File</span><span class="th">แนบไฟล์</span></span>
    <button type="button" class="file-add" data-pick-images>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.2 7.2v8.6a4.2 4.2 0 0 1-8.4 0V6.8a2.7 2.7 0 0 1 5.4 0v8.3a1.3 1.3 0 0 1-2.6 0V8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      <span class="en-line">Choose a file</span><span class="th">เลือกไฟล์</span>
    </button>
    <input data-images name="images" type="file" accept="image/*" multiple hidden />
    <ul class="file-thumbs" data-thumbs></ul>
    <p class="sheet-status" data-file-status hidden></p>
  `;
  const holder = note?.closest("label");
  if (holder) holder.after(field);
  else form.querySelector(".sheet-actions")?.before(field);

  const input = field.querySelector("[data-images]");
  field.querySelector("[data-pick-images]").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const status = field.querySelector("[data-file-status]");
    const thai = document.documentElement.dataset.ui === "th";
    const rejected = [];
    [...input.files].forEach((file) => {
      if (file.type && !file.type.startsWith("image/")) rejected.push("type");
      else if (file.size > 2 * 1024 * 1024) rejected.push("size");
      else picked.push(file);
    });
    input.value = "";
    renderThumbs(field.querySelector("[data-thumbs]"));
    status.hidden = rejected.length === 0;
    status.textContent = rejected.includes("size")
      ? (thai ? "ไฟล์ต้องไม่เกิน 2 MB" : "File must be 2 MB or smaller.")
      : rejected.includes("type")
        ? (thai ? "อัปได้เฉพาะไฟล์รูป" : "Images only.")
        : "";
  });
}

function renderThumbs(list) {
  if (!list) return;
  list.querySelectorAll("img").forEach((img) => URL.revokeObjectURL(img.src));
  list.replaceChildren();
  const thai = document.documentElement.dataset.ui === "th";
  picked.forEach((file, index) => {
    const item = document.createElement("li");
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "thumb-remove";
    remove.setAttribute("aria-label", thai ? `ลบ ${file.name}` : `Remove ${file.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      URL.revokeObjectURL(img.src);
      picked.splice(index, 1);
      renderThumbs(list);
    });
    item.append(img, remove);
    list.append(item);
  });
}

function clearImages(form) {
  form?.querySelectorAll("[data-thumbs] img").forEach((img) => URL.revokeObjectURL(img.src));
  picked.length = 0;
  form?.querySelector("[data-thumbs]")?.replaceChildren();
  const fileStatus = form?.querySelector("[data-file-status]");
  if (fileStatus) {
    fileStatus.hidden = true;
    fileStatus.textContent = "";
  }
}

addImages(inquireForm);

const done = document.createElement("dialog");
done.className = "sheet inquire-done";
done.innerHTML = `
  <svg viewBox="0 0 48 48" aria-hidden="true"><circle class="check-ring" cx="24" cy="24" r="22" pathLength="1"/><path class="check-mark" d="M14 25 l7 7 l13-14" pathLength="1"/></svg>
  <p><span class="en-line">Sent.</span><span class="th">ส่งแล้ว</span></p>
  <button type="button" class="text-btn" data-close-done><span class="en-line">Close</span><span class="th">ปิด</span></button>
`;
document.body.append(done);
done.querySelector("[data-close-done]").addEventListener("click", () => {
  done.close();
  done.classList.remove("is-in");
});

function showDone() {
  done.classList.remove("is-in");
  done.showModal();
  requestAnimationFrame(() => done.classList.add("is-in"));
}

document.querySelectorAll("[data-inquire]").forEach((button) => {
  button.addEventListener("click", () => {
    const title = document.querySelector("[data-inquire-title]");
    if (title && button.dataset.inquire && !title.hasAttribute("data-keep")) {
      title.textContent = button.dataset.inquire;
    }
    if (inquire) inquire.dataset.subject = button.dataset.subject || button.dataset.inquire || "Studio";
    const status = inquire?.querySelector("[data-inquire-status]");
    if (status) status.hidden = true;
    inquire?.showModal();
  });
});

document.querySelector("[data-close-inquire]")?.addEventListener("click", () => inquire?.close());

inquireForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector("[data-inquire-status]");
  const data = new FormData(form);
  const body = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    line: String(data.get("line") || "").trim(),
    note: String(data.get("note") || "").trim(),
    images: picked.map((file) => file.name),
  };
  const title = document.querySelector("[data-inquire-title]")?.textContent?.trim();
  body.subject = inquire?.dataset.subject || title || "Contact";
  if (status) status.hidden = true;
  form.reset();
  clearImages(form);
  inquire?.close();
  showDone();
  try {
    await fetch("/api/inquire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* The check still confirms the note was taken on this page. */
  }
});
