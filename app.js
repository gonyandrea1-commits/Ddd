const ASSET_VERSION = "20260418-2";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US");

let cfg = { ui: {}, report: {}, codes: {}, codeOrder: [], speeds: [], eeros: [], f012: [], f011: [] };
let rowCounter = 0;
let speedOffsets = { up: 0, down: 0 };
let installPrompt = null;

const TROUBLE_OPTIONS = [
  { value: "eero", label: "Заміна eero", outScope: "Replaced the Eero" },
  { value: "ont", label: "Заміна ONT", outScope: "Replaced the ONT" },
  { value: "cable", label: "Заміна кабеля", outScope: "Replaced the cable" }
];

const $ = id => document.getElementById(id);
const val = id => ($(id)?.value || "").trim();
const checked = id => !!$(id)?.checked;
const fmt = n => money.format(Number(n) || 0);

function esc(v) {
  return String(v ?? "").replace(/[&<>\"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

function text(map, key, fallback = "") { return map[key] || fallback; }
function ui(key, fallback = "") { return text(cfg.ui, key, fallback); }
function rep(key, fallback = "") { return text(cfg.report, key, fallback); }
function tpl(str, data = {}) { return String(str || "").replace(/\{\{(.*?)\}\}/g, (_, k) => data[k.trim()] ?? ""); }

async function loadXmlConfig() {
  const res = await fetch(`baza.xml?v=${ASSET_VERSION}`, { cache: "no-cache" });
  if (!res.ok) throw new Error("baza.xml not loaded");
  const xml = new DOMParser().parseFromString(await res.text(), "application/xml");
  const getTexts = sel => Object.fromEntries([...xml.querySelectorAll(sel)].map(n => [n.getAttribute("key"), n.textContent || ""]));
  cfg.ui = getTexts("ui > text");
  cfg.report = getTexts("report > text");
  cfg.codeOrder = [];
  cfg.codes = {};
  xml.querySelectorAll("codes > code").forEach(n => {
    const id = n.getAttribute("id");
    cfg.codeOrder.push(id);
    cfg.codes[id] = { price: Number(n.getAttribute("price") || 0), desc: n.getAttribute("desc") || "" };
  });
  cfg.speeds = [...xml.querySelectorAll("speedOptions > option")].map(n => ({ value: n.getAttribute("value") || "", label: n.textContent || "" }));
  cfg.eeros = [...xml.querySelectorAll("eeroOptions > option")].map(n => ({ value: n.getAttribute("value") || "", label: n.textContent || "" }));
  cfg.f012 = [...xml.querySelectorAll("f012Options > option")].map(n => ({ value: n.getAttribute("value") || "", label: n.getAttribute("label") || n.textContent || "", service: n.getAttribute("service") || n.textContent || "" }));
  cfg.f011 = [...xml.querySelectorAll("f011Options > option")].map(n => ({ value: n.getAttribute("value") || "", label: n.getAttribute("label") || "", body: n.textContent || "" }));
}

function applyUi() {
  document.querySelectorAll("[data-ui-key]").forEach(el => { el.textContent = ui(el.dataset.uiKey, el.textContent); });
  document.querySelectorAll("[data-placeholder-key]").forEach(el => { el.placeholder = ui(el.dataset.placeholderKey, el.placeholder || ""); });
}

function fillMainSelects() {
  $("speedTier").innerHTML = `<option value="" disabled selected>${esc(ui("speedSelectPlaceholder", "Select speed..."))}</option>` + cfg.speeds.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("");
  $("eeroQty").innerHTML = cfg.eeros.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("");
}

function rowOptions() {
  return `<option value="" disabled selected>${esc(ui("codeSelectPlaceholder", "Select..."))}</option>` + cfg.codeOrder.map(c => `<option value="${esc(c)}">${esc(c + " - " + cfg.codes[c].desc)}</option>`).join("");
}
function f012Options() { return cfg.f012.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join(""); }
function f011Options() { return cfg.f011.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join(""); }
function troubleMarkup(id) {
  return `<div id="trouble-${id}" class="trouble-options" style="display:none;margin-top:8px;padding:8px;border:1px solid #d9e1f0;border-radius:10px;background:#f8fbff;">
    <div style="font-size:12px;font-weight:800;color:#244c8d;margin-bottom:6px;">Що зробив:</div>
    ${TROUBLE_OPTIONS.map(o => `<label style="display:flex;align-items:center;gap:7px;margin:5px 0;font-size:13px;font-weight:700;"><input type="checkbox" id="trouble-${esc(o.value)}-${id}" data-trouble-row="${id}" value="${esc(o.value)}">${esc(o.label)}</label>`).join("")}
  </div>`;
}

function getTroubleValues(id) {
  return [...document.querySelectorAll(`#trouble-${id} input[type="checkbox"]:checked`)].map(input => input.value);
}

function troubleOutScope(values = []) {
  const items = values.map(v => TROUBLE_OPTIONS.find(o => o.value === v)?.outScope).filter(Boolean);
  if (!items.length) return "";
  if (items.length === 1) return `${items[0]}.`;
  if (items.length === 2) return `${items[0]} and ${items[1].replace(/^Replaced /, "")}.`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1].replace(/^Replaced /, "")}.`;
}

function addRow(saved = {}) {
  rowCounter++;
  const id = rowCounter;
  const tr = document.createElement("tr");
  tr.id = `row-${id}`;
  tr.innerHTML = `<td class="col-del"><button class="btn-del" type="button" data-del="${id}">X</button></td>
<td><select class="code-select" id="select-${id}" data-id="${id}">${rowOptions()}</select>
<div id="sub12-${id}" style="display:none;margin-top:6px"><select class="code-select" id="f012-${id}">${f012Options()}</select></div>
<div id="sub11-${id}" style="display:none;margin-top:6px"><select class="code-select" id="f011-${id}">${f011Options()}</select></div>
${troubleMarkup(id)}</td>
<td class="col-qty-wrap"><div class="qty-controls"><button class="qty-btn qty-minus" type="button" data-qty="${id}" data-delta="-1">-</button><input class="qty-input" id="qty-${id}" type="number" min="0" step="1" value="${esc(saved.qty || 1)}"><button class="qty-btn qty-plus" type="button" data-qty="${id}" data-delta="1">+</button></div></td>
<td class="col-total total-cell" id="total-${id}" data-total="0">$0.00</td>`;
  $("tableBody").appendChild(tr);
  if (saved.code) $(`select-${id}`).value = saved.code;
  (saved.trouble || []).forEach(v => { const box = $(`trouble-${v}-${id}`); if (box) box.checked = true; });
  updateRow(id, false);
}

function updateRow(id, save = true) {
  const code = $(`select-${id}`)?.value || "";
  const qty = Number($(`qty-${id}`)?.value || 0);
  const total = (cfg.codes[code]?.price || 0) * qty;
  $(`sub12-${id}`).style.display = code === "F012" ? "block" : "none";
  $(`sub11-${id}`).style.display = code === "F011" ? "block" : "none";
  const trouble = $(`trouble-${id}`);
  if (trouble) trouble.style.display = code === "F008" ? "block" : "none";
  $(`total-${id}`).dataset.total = String(total);
  $(`total-${id}`).textContent = fmt(total);
  calculateTotal();
  generateReport();
  updateCopyButtons();
  if (save) saveState();
}

function calculateTotal() {
  const total = [...document.querySelectorAll(".total-cell:not(#grandTotal)")].reduce((s, el) => s + Number(el.dataset.total || 0), 0);
  $("grandTotal").textContent = fmt(total);
  $("weeklyTotal").textContent = fmt(total);
  $("monthlyTotal").textContent = fmt(total);
}

function rows() {
  return [...document.querySelectorAll("#tableBody tr")].map(tr => {
    const id = tr.id.split("-")[1];
    const code = $(`select-${id}`)?.value || "";
    return {
      id,
      code,
      qty: Number($(`qty-${id}`)?.value || 0),
      f012: $(`f012-${id}`)?.value || "",
      f011: $(`f011-${id}`)?.value || "",
      trouble: getTroubleValues(id)
    };
  }).filter(r => r.code);
}

function getF012(v) { return cfg.f012.find(o => o.value === v) || cfg.f012[0] || { service: "" }; }
function getF011(v) { return cfg.f011.find(o => o.value === v) || cfg.f011[0] || { body: "" }; }

function buildHeader() {
  const parts = [
    `${rep("headerDatePrefix", "DATE:")}${dateFmt.format(new Date())}`,
    val("techName") ? `${rep("headerTechPrefix", "TECHNAME: ")}${val("techName")}` : "",
    val("crissId") ? `${rep("headerCrissPrefix", "Criss ID: ")}${val("crissId")}` : "",
    val("callId") ? `${rep("headerCallPrefix", "CALL ID:")}${val("callId")}` : "",
    val("customerName") ? `${rep("headerCustomerPrefix", "CUSTOMER: ")}${val("customerName").toUpperCase()}` : "",
    val("phoneNumber") ? `${rep("headerPhonePrefix", "PHONE: ")}${val("phoneNumber")}` : "",
    val("btnNumber") ? `${rep("headerBtnPrefix", "BTN: ")}${val("btnNumber")}` : "",
    val("fullAddress") ? `${rep("headerAddressPrefix", "FULL ADDRESS: ")}${val("fullAddress").toUpperCase()}` : ""
  ];
  return parts.filter(Boolean).join("\n");
}

function tici() {
  const pair = () => {
    let a = Math.floor(Math.random() * 99).toString().padStart(2, "0");
    let b = Math.floor(Math.random() * 99).toString().padStart(2, "0");
    if (+a > +b) [a, b] = [b, a];
    return `-15.${a}-15.${b}`;
  };
  return `TICI ${pair()} TICI ${pair()}`;
}

function buildDropAndStack(allRows) {
  let dropTotal = 0;
  const details = [];
  const stack = [];
  const out = [];
  const troubleOut = [];

  allRows.forEach(r => {
    const desc = cfg.codes[r.code]?.desc || "";
    if (r.code === "F006") { dropTotal += r.qty * 100; details.push(tpl(rep("aerialDetail", "Aerial footage {{ft}} ft, {{qty}} spans"), { ft: r.qty * 100, qty: r.qty })); }
    else if (r.code === "F031") { dropTotal += r.qty; details.push(tpl(rep("mduDetail", "MDU {{qty}} ft"), { qty: r.qty })); }
    else if (r.code === "F014-10") { dropTotal += r.qty; details.push(tpl(rep("conduitDetail", "conduit {{qty}} ft"), { qty: r.qty })); }
    else if (r.code === "TL-Footage") { dropTotal += r.qty; details.push(tpl(rep("tempLineDetail", "temp line {{qty}} ft"), { qty: r.qty })); }

    if (r.code === "F012") {
      const service = getF012(r.f012).service || "WallFish";
      stack.push(tpl(rep("f012Stackable"), { qty: r.qty, service, timeOnJob: 2 + r.qty }));
      out.push(tpl(rep("outScopeF012"), { qty: r.qty, service }));
    } else if (r.code === "F011") {
      const variant = r.f011 || "1";
      stack.push(`F011 (${variant}) ${getF011(variant).body || desc};`);
    } else if (r.code === "F006") {
      stack.push(tpl(rep("f006Stackable", "{{code}} ({{qty}}) Installed Aerial Drop {{qty}} Spans;"), { code: r.code, qty: r.qty }));
    } else if (r.code === "F008") {
      stack.push(`F008 (${r.qty}) TROUBLE TICKET;`);
      const troubleText = troubleOutScope(r.trouble);
      if (troubleText) troubleOut.push(troubleText);
    } else {
      stack.push(tpl(rep("genericStackable", "{{code}} ({{qty}}) {{desc}};"), { code: r.code, qty: r.qty, desc }));
    }
    if (r.code === "F014-6") out.push(rep("outScopeRemovedOnt", "removed old ont"));
    if (r.code === "1-F014-5") out.push(tpl(rep("outScopeExtraLines"), { qty: r.qty }));
    if (r.code === "2-F014-5") out.push(tpl(rep("outScopeJacks"), { qty: r.qty }));
  });

  const dropLine = `${rep("dropPrefix", "Drop Length: ")}${dropTotal};` + (details.length ? ` ${details.join(", ")}` : "");
  return { dropLine, stack, out, troubleOut };
}

function generateReport() {
  ["callId", "customerName", "phoneNumber", "btnNumber", "fullAddress", "speedTier"].forEach(id => $(id)?.classList.toggle("empty", !val(id)));
  const allRows = rows();
  const hasTroubleTicket = allRows.some(r => r.code === "F008");
  const eeroText = $("eeroQty").selectedOptions[0]?.textContent || "";
  const eeroQty = (eeroText.match(/\((\d+)\)/) || [])[1] || "";
  const eeroModel = eeroText.toLowerCase().includes("max") ? "7 max" : "7 pro";
  const speed = val("speedTier");
  const speedResult = speed ? `${Number(speed) + speedOffsets.up}/${Number(speed) + speedOffsets.down}` : "REQUIRED";
  const { dropLine, stack, out, troubleOut } = buildDropAndStack(allRows);

  if (hasTroubleTicket) {
    const outScopeText = troubleOut.length ? [...new Set(troubleOut)].join(" ") : "NA";
    $("resultText").value = `${buildHeader()}\n\n${dropLine}\n${tici()};\nONT mounted on the wall: NA\nEquipment Placement: NA\nSpeed Test Up/Down: ${speedResult}\nIBOB: NA\nCat6 Runs: NA\nSilicone at Entry: Yes\nEeros: NA\nUnbreakable: NA\nWhole Home WiFi: NA\nVerified Service With: ${val("customerName").toUpperCase()}\nOut-of-Scope Work Documented: ${outScopeText}\nAdditional Comments: all works good\nCustomer educated\n\n${rep("stackableHeader", "Stackable codes used :")}\n${stack.join("\n")}`.trim();
    return;
  }

  if (!checked("ontWallMountedCheck")) out.push(rep("outScopeNoMount", "the customer did not want to mount the ONT on the wall"));
  const addItems = [];
  if (checked("ibobCheck")) addItems.push(rep("ibobLine", "IBOB: yes;"));
  if (checked("unbreakableCheck")) addItems.push(rep("unbreakableLine", "Unbreakable: yes;"));
  if (checked("wholeHomeCheck")) addItems.push(rep("wholeHomeLine", "Whole Home WiFi: yes;"));
  const outLine = out.filter(Boolean).length ? tpl(rep("outOfScopeTemplate", "Out-of-Scope Work documented: {{items}};"), { items: [...new Set(out)].join(", ") }) : "";
  $("resultText").value = `${buildHeader()}\n\n${dropLine}\n${tici()};\n${tpl(rep("ontMountedTemplate", "ONT mounted on the wall:{{value}};"), { value: checked("ontWallMountedCheck") ? "yes" : "no" })}\n${tpl(rep("equipmentPlacementTemplate"), { eeroModel })}\n${tpl(rep("speedTestTemplate"), { speedResult })}\n${addItems.join("\n")}\n${rep("cat6RunsBase", "Cat6 Runs: run 1 included Ethernet line")};\n${rep("siliconeLine", "Silicone at Entry: Yes;")}\n${tpl(rep("eerosTemplate"), { eeroQty, eeroModel })}\n${tpl(rep("verifiedTemplate"), { cust: val("customerName").toUpperCase() })}\n${outLine}\n${rep("additionalComments", "Additional Comments: Installed main eero, checked connectivity.")}\n\n${rep("stackableHeader", "Stackable codes used :")}\n${stack.join("\n")}`.trim();
}

function saveState() {
  localStorage.setItem("tech_calc_state", JSON.stringify({
    fields: ["techName", "crissId", "callId", "customerName", "fullAddress", "phoneNumber", "btnNumber", "speedTier", "eeroQty"].reduce((o, id) => (o[id] = $(id)?.value || "", o), {}),
    checks: ["unbreakableCheck", "wholeHomeCheck", "ibobCheck", "ontWallMountedCheck"].reduce((o, id) => (o[id] = checked(id), o), {}),
    rows: rows().map(r => ({ code: r.code, qty: r.qty, trouble: r.trouble }))
  }));
}

function loadState() {
  const raw = localStorage.getItem("tech_calc_state");
  if (!raw) { addRow({ code: "F014-1", qty: 1 }); return; }
  try {
    const s = JSON.parse(raw);
    Object.entries(s.fields || {}).forEach(([id, v]) => { if ($(id)) $(id).value = v; });
    Object.entries(s.checks || {}).forEach(([id, v]) => { if ($(id)) $(id).checked = !!v; });
    (s.rows?.length ? s.rows : [{ code: "F014-1", qty: 1 }]).forEach(addRow);
  } catch { addRow({ code: "F014-1", qty: 1 }); }
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok;
  }
}

async function handleCopy(type) {
  generateReport();
  let out = $("resultText").value;
  if (type === "mtpn") out = out.split(rep("stackableHeader", "Stackable codes used :"))[1]?.trim() || out;
  if (type === "headerf012") out = `${buildHeader()}\n\n${rows().filter(r => r.code === "F012").map(r => `F012 (${r.qty}) ${getF012(r.f012).service}`).join("\n")}`;
  if (type === "headerf011") out = `${buildHeader()}\n\n${rows().filter(r => r.code === "F011").map(r => getF011(r.f011).body).join("\n\n")}`;
  if (type === "pd") out = `${buildHeader()}\n\nPD / Per Diem`;
  const ok = await copy(out);
  $("copyStatus").textContent = ok ? "Copied" : ui("copyFailed", "Copy failed. Please try again.");
}

function updateCopyButtons() {
  const has = c => rows().some(r => r.code === c);
  $("copyHeaderF012Btn").style.display = has("F012") ? "inline-flex" : "none";
  $("copyHeaderF011Btn").style.display = has("F011") ? "inline-flex" : "none";
  $("copyPdBtn").style.display = has("PD") ? "inline-flex" : "none";
}

function cleanOcr(t) { return String(t || "").replace(/\r/g, "").replace(/[|]/g, "").replace(/\s+$/gm, "").trim(); }
function parseOcr(t) {
  const s = cleanOcr(t);
  const call = s.match(/(?:SOC|SO|CALL\s*ID)?\s*(\d{7,})/i)?.[1] || "";
  const name = s.match(/Customer\s*Name\s*\n?\s*([A-Z][A-Z .'-]+)/i)?.[1] || "";
  const addrMatch = s.match(/Customer\s*Address\s*\n?\s*([\s\S]*?)(?:\n\s*(?:Phone|BTN|$))/i);
  const phone = s.match(/(?:Phone|PH)\D*(\d{10})/i)?.[1] || s.match(/\b(\d{10})\b/)?.[1] || "";
  return { call, name: name.trim(), address: addrMatch ? addrMatch[1].trim().replace(/\n+/g, "\n") : "", phone };
}

async function handleOcr(file) {
  if (!file || !window.Tesseract) return;
  $("ocrStatus").textContent = ui("ocrStatusLoading", "OCR: loading...");
  try {
    const result = await Tesseract.recognize(file, "eng");
    const data = parseOcr(result.data.text || "");
    if (data.call) $("callId").value = data.call;
    if (data.name) $("customerName").value = data.name;
    if (data.address) $("fullAddress").value = data.address;
    if (data.phone) $("phoneNumber").value = data.phone;
    $("ocrStatus").textContent = data.call || data.name || data.address ? ui("ocrStatusDone", "OCR: done, fields filled") : ui("ocrStatusNotFound", "OCR: text was read, but required fields were not found");
    generateReport(); saveState();
  } catch (e) { $("ocrStatus").textContent = ui("ocrStatusError", "OCR: image reading error"); }
}

function bindEvents() {
  document.body.addEventListener("input", e => {
    if (!e.target.matches("input,textarea,select")) return;
    const id = e.target.id || "";
    if (id.startsWith("select-") || id.startsWith("qty-") || id.startsWith("f0")) {
      updateRow((e.target.dataset.id || id.split("-")[1] || e.target.closest("tr")?.id.split("-")[1]));
    } else {
      generateReport();
      saveState();
    }
  });
  document.body.addEventListener("click", e => {
    const del = e.target.dataset.del; if (del) { $(`row-${del}`)?.remove(); calculateTotal(); generateReport(); saveState(); updateCopyButtons(); }
    const qty = e.target.dataset.qty; if (qty) { const i = $(`qty-${qty}`); i.value = Math.max(0, Number(i.value || 0) + Number(e.target.dataset.delta || 0)); updateRow(qty); }
    if (e.target.id === "addRowBtn") addRow();
    if (e.target.id === "resetDataBtn" && confirm(ui("resetConfirm", "Reset all data?"))) { localStorage.removeItem("tech_calc_state"); location.reload(); }
    if (e.target.dataset.copyType) handleCopy(e.target.dataset.copyType);
    if (e.target.id === "refreshAppBtn") location.reload();
    if (e.target.id === "installBtn" && installPrompt) { installPrompt.prompt(); installPrompt = null; $("installBanner").classList.remove("show"); }
  });
  $("speedTier").addEventListener("change", () => { speedOffsets = { up: Math.floor(Math.random() * 51), down: Math.floor(Math.random() * 51) }; generateReport(); saveState(); });
  $("ocrImageInput").addEventListener("change", e => handleOcr(e.target.files[0]));
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; $("installBanner").classList.add("show"); });
}

async function initApp() {
  try {
    await loadXmlConfig();
    applyUi();
    fillMainSelects();
    bindEvents();
    loadState();
    generateReport();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(`sw.js?v=${ASSET_VERSION}`).catch(console.error);
  } catch (e) {
    console.error(e);
    alert("App initialization failed: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
