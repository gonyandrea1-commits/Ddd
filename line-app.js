const EXCEL_FILE = "line-brands.xlsx?v=20260422-1";

const fallbackBrands = [
  { id: 1, brand: "Frontier", category: "Internet", country: "USA", price: "", description: "Test brand. Replace data in line-brands.xlsx", image: "", link: "", active: "yes", sort: 1 },
  { id: 2, brand: "Eero", category: "Router", country: "USA", price: "", description: "WiFi router brand", image: "", link: "", active: "yes", sort: 2 },
  { id: 3, brand: "Nokia", category: "ONT", country: "Finland", price: "", description: "Network equipment brand", image: "", link: "", active: "yes", sort: 3 }
];

let brands = [];
let visibleBrands = [];

const $ = id => document.getElementById(id);

function cleanKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9_а-яіїєґ]/gi, "");
}

function normalizeRow(row, index) {
  const obj = {};
  Object.keys(row || {}).forEach(key => {
    obj[cleanKey(key)] = row[key];
  });

  return {
    id: obj.id || obj.brand_id || index + 1,
    brand: obj.brand || obj.name || obj.назва || obj.бренд || "",
    category: obj.category || obj.type || obj.категорія || "",
    country: obj.country || obj.країна || "",
    price: obj.price || obj.ціна || "",
    description: obj.description || obj.desc || obj.опис || "",
    image: obj.image || obj.img || obj.photo || obj.фото || "",
    link: obj.link || obj.url || obj.посилання || "",
    active: obj.active || obj.активний || "yes",
    sort: Number(obj.sort || obj.порядок || index + 1),
    raw: obj
  };
}

function isActive(value) {
  const v = String(value || "yes").trim().toLowerCase();
  return !["no", "false", "0", "ні", "off"].includes(v);
}

function setStatus(text, type = "info") {
  const box = $("statusBox");
  box.textContent = text;
  box.dataset.type = type;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

async function loadExcelFromServer() {
  if (!window.XLSX) throw new Error("XLSX library not loaded");
  const response = await fetch(EXCEL_FILE, { cache: "no-cache" });
  if (!response.ok) throw new Error("line-brands.xlsx not found");
  const buffer = await response.arrayBuffer();
  parseWorkbook(buffer, "server");
}

function parseWorkbook(buffer, source = "file") {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === "brands") || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  brands = rows
    .map(normalizeRow)
    .filter(item => item.brand && isActive(item.active))
    .sort((a, b) => a.sort - b.sort);

  visibleBrands = brands;
  render();
  setStatus(`Завантажено ${brands.length} брендів з ${source === "server" ? "line-brands.xlsx" : "вибраного Excel файлу"}.`, "ok");
}

function loadFallback() {
  brands = fallbackBrands.map(normalizeRow);
  visibleBrands = brands;
  render();
  setStatus("line-brands.xlsx ще не знайдено. Показую тестові дані. Створи Excel через line-template.html і завантаж файл у GitHub/uCoz.", "warn");
}

function renderStats() {
  const categories = new Set(brands.map(item => item.category).filter(Boolean));
  $("statsBox").innerHTML = `
    <div class="stat"><b>${brands.length}</b><span>брендів</span></div>
    <div class="stat"><b>${categories.size}</b><span>категорій</span></div>
    <div class="stat"><b>${visibleBrands.length}</b><span>знайдено</span></div>
  `;
}

function renderCards() {
  $("brandGrid").innerHTML = visibleBrands.map(item => `
    <article class="card">
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.brand)}">` : `<div class="logo">${escapeHtml(String(item.brand).slice(0, 2).toUpperCase())}</div>`}
      <div class="card-body">
        <h2>${escapeHtml(item.brand)}</h2>
        <p class="meta">${escapeHtml(item.category || "No category")}${item.country ? " • " + escapeHtml(item.country) : ""}</p>
        ${item.price ? `<p class="price">${escapeHtml(item.price)}</p>` : ""}
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Відкрити</a>` : ""}
      </div>
    </article>
  `).join("");
}

function renderTable() {
  const columns = ["id", "brand", "category", "country", "price", "description", "link"];
  $("tableHead").innerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr>`;
  $("tableBody").innerHTML = visibleBrands.map(item => `
    <tr>${columns.map(col => `<td>${escapeHtml(item[col] || "")}</td>`).join("")}</tr>
  `).join("");
}

function render() {
  renderStats();
  renderCards();
  renderTable();
}

function applySearch() {
  const q = $("searchInput").value.trim().toLowerCase();
  visibleBrands = brands.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  render();
}

function bindEvents() {
  $("searchInput").addEventListener("input", applySearch);
  $("reloadBtn").addEventListener("click", async () => {
    setStatus("Оновлюю line-brands.xlsx...", "info");
    try { await loadExcelFromServer(); } catch { loadFallback(); }
  });
  $("fileInput").addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => parseWorkbook(e.target.result, "file");
    reader.readAsArrayBuffer(file);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  try { await loadExcelFromServer(); } catch { loadFallback(); }
});
