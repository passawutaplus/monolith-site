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

function addImageNote(form) {
  if (!form || form.querySelector("[data-image-note]")) return;
  const note = document.createElement("p");
  note.className = "sheet-hint";
  note.dataset.imageNote = "";
  note.innerHTML = `<span class="en-line">Have reference images? Send them on <a href="https://lin.ee/zi0qAQb" target="_blank" rel="noreferrer">LINE</a> or reply to the studio's email.</span><span class="th">มีรูปอ้างอิง ส่งทาง <a href="https://lin.ee/zi0qAQb" target="_blank" rel="noreferrer">LINE</a> หรือตอบกลับอีเมลของสตูดิโอได้เลย</span>`;
  const holder = form.querySelector("textarea")?.closest("label");
  if (holder) holder.after(note);
  else form.querySelector(".sheet-actions")?.before(note);
}

addImageNote(inquireForm);

function formStatus(form) {
  let status = form.querySelector("[data-send-status]");
  if (!status) {
    status = document.createElement("p");
    status.className = "sheet-status";
    status.dataset.sendStatus = "";
    status.setAttribute("role", "status");
    status.hidden = true;
    form.querySelector(".sheet-actions")?.before(status);
  }
  return status;
}

window.monolithFormStatus = formStatus;

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

window.monolithDone = () => showDone();

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
  const status = formStatus(form);
  const submit = form.querySelector('[type="submit"]');
  const data = new FormData(form);
  const title = document.querySelector("[data-inquire-title]")?.textContent?.trim();
  const subject = inquire?.dataset.subject || title || "Contact";
  const fields = {
    subject,
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    line: String(data.get("line") || "").trim(),
    note: String(data.get("note") || "").trim(),
    page: location.pathname + location.search,
  };
  const thai = document.documentElement.dataset.ui === "th";
  status.hidden = true;
  if (submit) { submit.disabled = true; submit.dataset.label ??= submit.textContent; submit.textContent = thai ? "กำลังส่ง…" : "Sending…"; }
  const ok = await window.monolith.send(subject, fields);
  if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label; }
  if (!ok) {
    const link = window.monolith.mailto(subject, fields);
    status.innerHTML = thai
      ? `ส่งไม่สำเร็จ <a href="${link}">ส่งข้อความนี้ทางอีเมลแทน</a> หรือทัก <a href="https://lin.ee/zi0qAQb" target="_blank" rel="noreferrer">LINE</a>`
      : `This didn't send. <a href="${link}">Send it by email instead</a>, or message on <a href="https://lin.ee/zi0qAQb" target="_blank" rel="noreferrer">LINE</a>.`;
    status.hidden = false;
    return;
  }
  form.reset();
  inquire?.close();
  showDone();
});
