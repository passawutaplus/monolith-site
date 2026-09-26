const groups = {
  branding: {
    title: "Branding",
    lead: "A name, a palette, and the rules a brand uses.",
    th: "ชื่อ โทน และกติกาการใช้แบรนด์",
    works: [
      ["wpall", "WP ALL", ["board.png", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "14.jpg", "15.jpg", "17.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "12.jpg", "13.jpg", "18.jpg", "6.jpg", "7.jpg", "16.jpg"]],
      ["print", "Print", ["29.jpg", "30.jpg", "31.jpg", "32.jpg", "23.jpg", "19.jpg", "20.jpg", "21.jpg", "22.jpg", "24.jpg", "25.jpg", "33.jpg", "34.jpg", "38.jpg", "39.jpg", "40.jpg", "41.jpg", "42.jpg", "43.jpg"]],
      ["merch", "Merchandise", ["35.jpg", "36.jpg", "37.jpg", "44.jpg", "45.jpg", "46.jpg", "49.jpg"]],
      ["app", "Application", ["47.jpg", "48.jpg", "55.jpg", "56.jpg", "57.jpg", "58.jpg", "70.jpg", "50.jpg", "51.jpg", "52.jpg", "53.jpg", "54.jpg", "59.jpg", "60.jpg", "61.jpg", "62.jpg", "63.jpg", "64.jpg", "65.jpg", "66.jpg", "67.jpg", "68.jpg", "69.jpg", "76.jpg", "77.jpg"]],
      ["rider", "Curtain Rider", ["71.jpg", "72.jpg", "73.jpg", "74.jpg", "75.jpg"]],
      ["line", "Product line", ["82.jpg", "80.jpg", "81.jpg", "83.jpg", "84.jpg", "78.jpg", "79.jpg"]]
    ]
  },
  logo: {
    title: "Logo",
    lead: "A mark that holds on a drawing and on a door.",
    th: "เครื่องหมายที่อ่านได้ทั้งบนแบบและที่หน้างาน",
    works: [
      ["mark-door", "Door", ["cover.jpg"]],
      ["mark-paper", "Paper", ["cover.jpg"]],
      ["mark-sign", "Plaque", ["cover.jpg"]]
    ]
  },
  packaging: {
    title: "Packaging",
    lead: "The box a client opens.",
    th: "บรรจุภัณฑ์และกล่องตัวอย่าง",
    works: [
      ["pack-box", "Clay box", ["cover.jpg"]],
      ["pack-sleeve", "Sleeve", ["cover.jpg"]],
      ["pack-kit", "Sample kit", ["cover.jpg"]]
    ]
  },
  banner: {
    title: "Banner",
    lead: "A still for the wall, the shop, and the site.",
    th: "ภาพประกาศสำหรับหน้าร้านและหน้าเว็บ",
    works: [
      ["banner-window", "Window", ["cover.jpg"]],
      ["banner-wall", "Wall", ["cover.jpg"]],
      ["banner-screen", "Screen", ["cover.jpg"]]
    ]
  },
  card: {
    title: "Business Card",
    lead: "A card that carries the name.",
    th: "นามบัตร",
    works: [
      ["card-linen", "Linen", ["cover.jpg"]],
      ["card-stack", "Stack", ["cover.jpg"]],
      ["card-press", "Deboss", ["cover.jpg"]]
    ]
  },
  presentation: {
    title: "Presentation",
    lead: "One board: the work, the materials, and a short line.",
    th: "บอร์ดนำเสนอ",
    works: [
      ["board-materials", "Materials", ["cover.jpg"]],
      ["board-room", "Room", ["cover.jpg"]],
      ["board-pin", "Pinned", ["cover.jpg"]]
    ]
  },
  interface: {
    title: "UX UI",
    lead: "A site or an app a client can read.",
    th: "หน้าเว็บและแอป",
    works: [
      ["ui-phone", "Phone", ["cover.jpg"]],
      ["ui-desk", "Desk", ["cover.jpg"]],
      ["ui-flow", "Flow", ["cover.jpg"]]
    ]
  }
};

const params = new URLSearchParams(location.search);
const id = params.get("id");
const group = groups[id];
const root = document.querySelector("#category");

if (!group) {
  root.innerHTML = `<p class="code"><a class="crumb-back" href="design.html" data-back aria-label="Back">←</a> <a href="design.html">Design</a></p><h1 class="design-title">Design</h1>`;
} else {
  document.title = `${group.title} — MONOLITH`;
  const items = group.works.map(([workId, title], index) => `
    <button type="button" class="side-item${index === 0 ? " is-active" : ""}" data-work="${workId}">${title}</button>
  `).join("");
  root.innerHTML = `
    <p class="code"><a class="crumb-back" href="design.html" data-back aria-label="Back">←</a> <a href="design.html">Design</a> · ${group.title}</p>
    <h1 class="design-title">${group.title}</h1>
    <p class="en-line prints-note">${group.lead}</p>
    <p class="th prints-note">${group.th}</p>
    ${group.works.length ? `
      <div class="services-layout">
        <nav class="side" aria-label="${group.title}">${items}</nav>
        <div class="project-stack" data-stack></div>
      </div>
    ` : `<p class="en-line">Nothing in this group yet.</p><p class="th">ยังไม่มีชิ้นงานในหมวดนี้</p><button type="button" class="text-btn" data-inquire="${group.title}">Inquire</button>`}
  `;
  const stack = root.querySelector("[data-stack]");
  const show = (workId) => {
    root.querySelectorAll("[data-work]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.work === workId);
    });
    const files = group.works.find(([id]) => id === workId)[2];
    stack.innerHTML = files.map((file) => `<img src="media/brand/${workId}/${file}" alt="">`).join("");
  };
  if (stack) {
    const requested = params.get("work");
    const initial = group.works.some(([workId]) => workId === requested) ? requested : group.works[0][0];
    show(initial);
    root.querySelectorAll("[data-work]").forEach((button) => {
      button.addEventListener("click", () => show(button.dataset.work));
    });
  }
}
