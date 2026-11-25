"use strict";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const ICONS = {
  phone: "📱", tablet: "📲", computer: "💻", server: "🗄️", tv: "📺", console: "🎮", speaker: "🔊",
  camera: "📷", printer: "🖨️", iot: "💡", network: "📡", other: "❔",
};
const EVENT_ICONS = { new_device: "🆕", online: "🟢", offline: "🔴", ip_change: "🔀", wol: "⚡", info: "ℹ️" };

const state = {
  tab: "dashboard", types: {}, devices: [], overview: null,
  sort: { key: "ip", asc: true }, current: null, authRequired: false,
};

// ------------------------------------------------------------------ utilitários
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function api(path, opts = {}) {
  const init = { method: opts.method || "GET", headers: {} };
  if (opts.body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/api/login") { showLogin(); throw new Error(data.error || "Sessão necessária."); }
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

let toastTimer;
function toast(msg, bad = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (bad ? " bad" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 3500);
}

function ago(ts) {
  if (!ts) return "—";
  const s = Math.max(0, Date.now() / 1000 - ts);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "ontem" : `há ${d} dias`;
}
const dateTime = ts => ts ? new Date(ts * 1000).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—";
const ms = v => v == null ? "—" : `${v < 10 ? v.toFixed(1) : Math.round(v)} ms`;

function label(d) { return d.name || d.hostname || d.vendor || d.ip || d.mac || "Aparelho"; }
function typeOf(d) { return d.type || d.guessed_type || "other"; }

async function withBusy(btn, fn) {
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "A trabalhar…";
  try { return await fn(); }
  catch (e) { toast(e.message, true); }
  finally { btn.disabled = false; btn.textContent = old; }
}

// ------------------------------------------------------------------ sessão
function showLogin() {
  $("#app").classList.add("hidden");
  $("#login").classList.remove("hidden");
  $("#login-pass").focus();
}

$("#login-form").addEventListener("submit", async e => {
  e.preventDefault();
  $("#login-error").textContent = "";
  try {
    await api("/api/login", { method: "POST", body: { password: $("#login-pass").value } });
    $("#login-pass").value = "";
    start();
  } catch (err) { $("#login-error").textContent = err.message; }
});

$("#logout-btn").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST", body: {} }).catch(() => {});
  showLogin();
});

// ------------------------------------------------------------------ navegação
function setTab(tab) {
  state.tab = tab;
  $$("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".tab").forEach(s => s.classList.toggle("hidden", s.id !== `tab-${tab}`));
  try { localStorage.setItem("cd-tab", tab); } catch { /* sem armazenamento */ }
  refresh();
}
$$("#tabs button").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
document.addEventListener("click", e => {
  const go = e.target.closest("[data-goto]");
  if (go) setTab(go.dataset.goto);
});

// ------------------------------------------------------------------ painel
async function loadOverview() {
  const o = await api("/api/overview");
  state.overview = o;
  state.types = o.types;
  const c = o.counts;
  $("#st-online").textContent = c.online;
  $("#st-total").textContent = `de ${c.total} conhecidos`;
  const un = $("#st-untrusted");
  un.textContent = c.untrusted;
  un.className = "stat-value" + (c.untrusted ? " warn" : "");
  setLatencyStat("#st-gw", o.latency.gateway, o.network.gateway ? `router ${o.network.gateway}` : "router desconhecido");
  setLatencyStat("#st-net", o.latency.internet, o.latency.internet == null ? "sem resposta" : "ligação ativa");
  $("#ping-warning").classList.toggle("hidden", o.ping_available);

  const s = o.status;
  $("#scan-status").textContent = s.scanning ? "A varrer a rede…" : (s.last_scan ? `Último varrimento ${ago(s.last_scan)}` : "");
  $("#scan-btn").disabled = s.scanning;
  $("#scan-btn").textContent = s.scanning ? "A varrer…" : "Varrer agora";

  const n = o.network;
  $("#net-info").innerHTML = [
    ["Interface", n.interface || "—"],
    ["IP deste servidor", n.local_ip],
    ["Router (gateway)", n.gateway || "—"],
    ["Rede varrida", s.cidr || n.cidr],
    ["Último varrimento", s.last_scan ? `${dateTime(s.last_scan)} · ${s.found} ativos · ${s.duration}s` : "em curso…"],
    ...(s.error ? [["Erro", s.error]] : []),
    ...(state.publicIp ? [["IP público", state.publicIp]] : []),
  ].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
}

function setLatencyStat(sel, v, sub) {
  const el = $(sel);
  el.textContent = ms(v);
  el.className = "stat-value " + (v == null ? "bad" : v > 100 ? "warn" : "ok");
  $(sel + "-sub").textContent = sub;
}

async function loadDashboard() {
  await loadOverview();
  const [{ devices }, { events }, { points }] = await Promise.all([
    api("/api/devices"), api("/api/events?limit=12"), api("/api/latency?hours=24"),
  ]);
  state.devices = devices;

  const untrusted = devices.filter(d => !d.trusted);
  $("#trust-all-btn").classList.toggle("hidden", !untrusted.length);
  $("#untrusted-list").innerHTML = untrusted.length
    ? untrusted.map(d => `
      <div class="list-item clickable" data-device="${esc(d.id)}">
        <span class="ev-icon">${ICONS[typeOf(d)]}</span>
        <div class="grow"><div class="title">${esc(label(d))}</div>
          <div class="muted small">${esc(d.ip)} · ${esc(d.mac || "MAC desconhecido")}${d.randomized ? " · MAC privado" : ""}</div></div>
        <span class="time">${esc(ago(d.first_seen))}</span>
      </div>`).join("")
    : `<p class="empty">Todos os aparelhos estão confirmados. 👍</p>`;

  $("#recent-events").innerHTML = renderEvents(events, true);
  renderChart(points);
}

function renderEvents(events, compact = false) {
  if (!events.length) return `<p class="empty">Sem eventos.</p>`;
  return events.map(e => `
    <div class="list-item${e.device_id ? " clickable" : ""}" ${e.device_id ? `data-device="${esc(e.device_id)}"` : ""}>
      <span class="ev-icon">${EVENT_ICONS[e.kind] || "•"}</span>
      <div class="grow">${esc(e.message)}</div>
      <span class="time" title="${esc(dateTime(e.ts))}">${esc(compact ? ago(e.ts) : dateTime(e.ts))}</span>
    </div>`).join("");
}

function renderChart(points) {
  const el = $("#latency-chart");
  const W = 600, H = 170, L = 34, B = 18, T = 6;
  const now = Date.now() / 1000, from = now - 86400;
  const series = { gateway: [], internet: [] };
  points.forEach(p => series[p.target] && series[p.target].push(p));
  const vals = points.map(p => p.ms).filter(v => v != null);
  if (!points.length) {
    el.innerHTML = `<p class="empty">Ainda sem medições — a primeira chega dentro de um minuto.</p>`;
    $("#latency-summary").textContent = "";
    return;
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 10;
  const max = Math.max(10, Math.ceil(p95 * 1.25 / 10) * 10);
  const x = ts => L + (ts - from) / 86400 * (W - L);
  const y = v => T + (H - B - T) * (1 - Math.min(v, max) / max);

  const path = list => {
    let d = "", pen = false, prev = 0;
    for (const p of list) {
      if (p.ms == null || (pen && p.ts - prev > 180)) { pen = false; }
      if (p.ms != null) { d += `${pen ? "L" : "M"}${x(p.ts).toFixed(1)},${y(p.ms).toFixed(1)}`; pen = true; prev = p.ts; }
    }
    return d;
  };
  const losses = series.internet.filter(p => p.ms == null)
    .map(p => `<rect class="loss" x="${x(p.ts).toFixed(1)}" y="${H - B - 4}" width="2" height="4"/>`).join("");
  const grid = [0, 0.5, 1].map(f => {
    const v = max * f, yy = y(v);
    return `<line x1="${L}" x2="${W}" y1="${yy}" y2="${yy}"/><text x="${L - 6}" y="${yy + 3}" text-anchor="end">${Math.round(v)}</text>`;
  }).join("");
  const hours = [-24, -18, -12, -6, 0].map(h => {
    const ts = now + h * 3600;
    const t = new Date(ts * 1000).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    return `<text x="${x(ts)}" y="${H - 3}" text-anchor="${h === -24 ? "start" : h === 0 ? "end" : "middle"}">${t}</text>`;
  }).join("");

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Latência nas últimas 24 horas">
    <g class="grid">${grid}${hours}</g>
    <path class="gw" d="${path(series.gateway)}" vector-effect="non-scaling-stroke"/>
    <path class="inet" d="${path(series.internet)}" vector-effect="non-scaling-stroke"/>
    ${losses}</svg>`;

  const summary = (list, name) => {
    if (!list.length) return null;
    const ok = list.filter(p => p.ms != null);
    const avg = ok.length ? ok.reduce((a, p) => a + p.ms, 0) / ok.length : null;
    const loss = Math.round(100 * (list.length - ok.length) / list.length);
    return `${name}: média ${ms(avg)}, ${loss}% sem resposta`;
  };
  $("#latency-summary").textContent = [summary(series.gateway, "Router"), summary(series.internet, "Internet")].filter(Boolean).join(" · ");
}

$("#public-ip-btn").addEventListener("click", e => withBusy(e.target, async () => {
  state.publicIp = (await api("/api/tools/public-ip")).ip;
  loadOverview();
}));

$("#trust-all-btn").addEventListener("click", async () => {
  if (!confirm("Marcar todos os aparelhos por confirmar como confiáveis?")) return;
  await api("/api/devices/trust-all", { method: "POST", body: {} });
  toast("Aparelhos confirmados.");
  refresh();
});

$("#scan-btn").addEventListener("click", async () => {
  await api("/api/scan", { method: "POST", body: {} });
  toast("Varrimento iniciado.");
  setTimeout(loadOverview, 600);
});

// ------------------------------------------------------------------ aparelhos
async function loadDevices() {
  const { devices, types } = await api("/api/devices");
  state.devices = devices;
  state.types = types;
  const sel = $("#dev-type");
  if (sel.options.length === 1) {
    sel.insertAdjacentHTML("beforeend", Object.entries(types).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join(""));
  }
  renderDevices();
}

function ipKey(ip) { return (ip || "").split(".").map(n => n.padStart(3, "0")).join("."); }

function renderDevices() {
  const q = $("#dev-search").value.trim().toLowerCase();
  const filter = $("#dev-filter").value, type = $("#dev-type").value;
  let list = state.devices.filter(d => {
    if (filter === "online" && !d.online) return false;
    if (filter === "offline" && d.online) return false;
    if (filter === "untrusted" && d.trusted) return false;
    if (type && typeOf(d) !== type) return false;
    if (!q) return true;
    return [d.name, d.hostname, d.vendor, d.ip, d.mac, d.owner, d.location, d.notes].some(v => (v || "").toLowerCase().includes(q));
  });
  const { key, asc } = state.sort;
  const val = d => key === "label" ? label(d).toLowerCase() : key === "ip" ? ipKey(d.ip) : (d[key] ?? (asc ? Infinity : -Infinity));
  list.sort((a, b) => (b.online - a.online) || ((val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * (asc ? 1 : -1)));

  $$(".devices th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === key);
    th.classList.toggle("asc", th.dataset.sort === key && asc);
  });
  $("#dev-empty").classList.toggle("hidden", list.length > 0);
  $("#dev-rows").innerHTML = list.map(d => `
    <tr data-device="${esc(d.id)}" class="${d.online ? "" : "offline"}">
      <td><span class="dot ${d.online ? "on" : "off"}" title="${d.online ? "Online" : "Offline"}"></span></td>
      <td><div class="dev-name"><span class="dev-icon">${ICONS[typeOf(d)]}</span><div>
        <div class="title">${esc(label(d))}${d.trusted ? "" : `<span class="badge warn">por confirmar</span>`}</div>
        <div class="sub">${esc([state.types[typeOf(d)], d.owner, d.location].filter(Boolean).join(" · "))}</div></div></div></td>
      <td class="mono">${esc(d.ip)}</td>
      <td class="mono hide-sm">${esc(d.mac || "—")}${d.randomized ? `<span class="badge" title="MAC privado/aleatório">priv.</span>` : ""}</td>
      <td class="hide-md">${esc(d.vendor || "—")}</td>
      <td class="hide-sm">${d.online ? "agora" : esc(ago(d.last_seen))}</td>
      <td class="hide-sm">${d.online ? esc(ms(d.latency)) : "—"}</td>
    </tr>`).join("");
}

["#dev-search", "#dev-filter", "#dev-type"].forEach(s => $(s).addEventListener("input", renderDevices));
$$(".devices th[data-sort]").forEach(th => th.addEventListener("click", () => {
  const key = th.dataset.sort;
  state.sort = { key, asc: state.sort.key === key ? !state.sort.asc : key !== "last_seen" };
  renderDevices();
}));

// ------------------------------------------------------------------ painel do aparelho
document.addEventListener("click", e => {
  const row = e.target.closest("[data-device]");
  if (row && !e.target.closest("a")) openDevice(row.dataset.device);
});

async function openDevice(id) {
  let d;
  try { d = await api(`/api/devices/${id}`); } catch (e) { return toast(e.message, true); }
  state.current = d;
  $("#d-result").classList.add("hidden");
  renderDrawer(d);
  $("#drawer").classList.remove("hidden");
  $("#drawer-backdrop").classList.remove("hidden");
}

function renderDrawer(d) {
  $("#d-title").innerHTML = `<span>${ICONS[typeOf(d)]}</span>${esc(label(d))}`;
  $("#d-sub").innerHTML = `<span class="dot ${d.online ? "on" : "off"}"></span> ${d.online ? `Online · ${esc(ms(d.latency))}` : `Offline · visto ${esc(ago(d.last_seen))}`}`;
  $("#d-info").innerHTML = [
    ["IP", d.ip],
    ["MAC", (d.mac || "—") + (d.randomized ? " (privado/aleatório)" : "")],
    ["Fabricante", d.vendor || "—"],
    ["Hostname", d.hostname || "—"],
    ["Tipo detetado", state.types[d.guessed_type] || "—"],
    ["Visto pela 1.ª vez", dateTime(d.first_seen)],
    ["Visto pela última vez", dateTime(d.last_seen)],
  ].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");

  $("#d-wake").disabled = !d.mac;
  renderPorts(d.open_ports, d.ports_scanned_at, d.ip);

  const f = $("#d-form");
  $("#d-type").innerHTML = `<option value="">Automático (${esc(state.types[d.guessed_type] || "Outro")})</option>` +
    Object.entries(state.types).map(([k, v]) => `<option value="${k}">${ICONS[k]} ${esc(v)}</option>`).join("");
  for (const k of ["name", "type", "owner", "location", "notes"]) f.elements[k].value = d[k] || "";
  f.elements.trusted.checked = d.trusted;
  f.elements.alert_offline.checked = d.alert_offline;
  $("#d-events").innerHTML = renderEvents(d.events);
}

function renderPorts(ports, scannedAt, ip) {
  const el = $("#d-ports-list");
  if (!scannedAt) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="muted small" style="margin-bottom:6px">Portas abertas (análise ${esc(ago(scannedAt))}):</div>` +
    (ports.length ? `<div class="ports">${ports.map(p => {
      const txt = `${p.port}${p.service ? " · " + esc(p.service) : ""}`;
      return `<span class="port">${p.web ? `<a href="${p.web}://${esc(ip)}:${p.port}/" target="_blank" rel="noopener">${txt}</a>` : txt}</span>`;
    }).join("")}</div>` : `<div class="muted small">Nenhuma porta comum aberta.</div>`);
}

function closeDrawer() {
  $("#drawer").classList.add("hidden");
  $("#drawer-backdrop").classList.add("hidden");
  state.current = null;
}
$("#d-close").addEventListener("click", closeDrawer);
$("#drawer-backdrop").addEventListener("click", closeDrawer);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

function showResult(el, text) { el.textContent = text; el.classList.remove("hidden"); }

function pingText(r) {
  const lines = r.results.map((v, i) => `#${i + 1}  ${v == null ? "sem resposta" : ms(v)}`);
  return `${lines.join("\n")}\n\n${r.received}/${r.sent} respostas · ${r.loss}% perdidos` +
    (r.avg != null ? `\nmín ${ms(r.min)} · média ${ms(r.avg)} · máx ${ms(r.max)}` : "");
}

$("#d-ping").addEventListener("click", e => withBusy(e.target, async () => {
  const r = await api(`/api/devices/${state.current.id}/ping`, { method: "POST", body: {} });
  showResult($("#d-result"), pingText(r));
}));
$("#d-ports").addEventListener("click", e => withBusy(e.target, async () => {
  const { ports } = await api(`/api/devices/${state.current.id}/ports`, { method: "POST", body: {} });
  $("#d-result").classList.add("hidden");
  renderPorts(ports, Date.now() / 1000, state.current.ip);
}));
$("#d-wake").addEventListener("click", e => withBusy(e.target, async () => {
  await api(`/api/devices/${state.current.id}/wake`, { method: "POST", body: {} });
  toast("Pacote Wake-on-LAN enviado.");
}));

$("#d-form").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, body = {};
  for (const k of ["name", "type", "owner", "location", "notes"]) body[k] = f.elements[k].value.trim();
  body.trusted = f.elements.trusted.checked;
  body.alert_offline = f.elements.alert_offline.checked;
  try {
    const d = await api(`/api/devices/${state.current.id}`, { method: "PUT", body });
    d.events = state.current.events;
    state.current = d;
    renderDrawer(d);
    toast("Guardado.");
    refresh();
  } catch (err) { toast(err.message, true); }
});

$("#d-delete").addEventListener("click", async () => {
  if (!confirm("Esquecer este aparelho? O nome, notas e histórico são apagados. Se voltar a ligar-se, aparece como novo.")) return;
  await api(`/api/devices/${state.current.id}`, { method: "DELETE" });
  closeDrawer();
  toast("Aparelho removido.");
  refresh();
});

// ------------------------------------------------------------------ eventos
async function loadEvents() {
  const kind = $("#ev-kind").value;
  const { events } = await api(`/api/events?limit=500${kind ? "&kind=" + kind : ""}`);
  $("#events-list").innerHTML = renderEvents(events);
}
$("#ev-kind").addEventListener("input", loadEvents);
$("#ev-clear").addEventListener("click", async () => {
  if (!confirm("Apagar todo o histórico de eventos?")) return;
  await api("/api/events", { method: "DELETE" });
  loadEvents();
});

// ------------------------------------------------------------------ ferramentas
$$("form.tool").forEach(form => form.addEventListener("submit", e => {
  e.preventDefault();
  const tool = form.dataset.tool, out = $(".result", form);
  const body = Object.fromEntries(new FormData(form));
  withBusy($("button", form), async () => {
    const r = await api(`/api/tools/${tool}`, { method: "POST", body });
    if (tool === "ping") showResult(out, `${r.host}\n\n${pingText(r)}`);
    if (tool === "dns") showResult(out, r.error ? `Erro: ${r.error}` : `${r.addresses.join("\n")}\n\nResolvido em ${r.ms} ms`);
    if (tool === "ports") showResult(out, r.ports.length
      ? r.ports.map(p => `${String(p.port).padEnd(6)} ${p.service}`).join("\n")
      : "Nenhuma das portas analisadas está aberta.");
    if (tool === "wake") showResult(out, `Pacote mágico enviado para ${r.mac}.`);
  });
}));

// ------------------------------------------------------------------ configurações
async function loadSettings() {
  const { settings, detected_cidr, vendors } = await api("/api/settings");
  const f = $("#settings-form");
  for (const [k, v] of Object.entries(settings)) {
    const el = f.elements[k];
    if (!el) continue;
    if (el.type === "checkbox") el.checked = v; else el.value = v;
  }
  $("#set-subnet").placeholder = `automático (${detected_cidr})`;
  $("#set-subnet-hint").textContent = `Deixa vazio para usar a rede detetada: ${detected_cidr}. Máximo /22.`;
  $("#vendors-info").textContent = vendors.updating
    ? "A descarregar a lista de fabricantes…"
    : vendors.count
      ? `${vendors.count.toLocaleString("pt-PT")} fabricantes conhecidos (lista pública do IEEE).`
      : `Lista de fabricantes ainda não disponível${vendors.error ? ` (${vendors.error})` : ""}.`;
}

$("#settings-form").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, body = {};
  for (const el of f.elements) {
    if (!el.name) continue;
    body[el.name] = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value.trim();
  }
  try {
    await api("/api/settings", { method: "PUT", body });
    $("#settings-msg").textContent = "Guardado.";
    setTimeout(() => ($("#settings-msg").textContent = ""), 2500);
  } catch (err) { toast(err.message, true); }
});

$("#test-webhook").addEventListener("click", e => withBusy(e.target, async () => {
  await api("/api/settings/test-webhook", { method: "POST", body: { url: $("#settings-form").elements.webhook_url.value.trim() } });
  toast("Notificação de teste enviada.");
}));

$("#vendors-update").addEventListener("click", async () => {
  await api("/api/vendors/update", { method: "POST", body: {} });
  toast("A atualizar a lista de fabricantes…");
  setTimeout(loadSettings, 1500);
});

// ------------------------------------------------------------------ arranque
async function refresh() {
  try {
    if (state.tab === "dashboard") await loadDashboard();
    else {
      await loadOverview();
      if (state.tab === "devices") await loadDevices();
      if (state.tab === "events") await loadEvents();
      if (state.tab === "settings") await loadSettings();
    }
  } catch (e) { if (!$("#app").classList.contains("hidden")) toast(e.message, true); }
}

let pollTimer;
async function start() {
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#logout-btn").classList.toggle("hidden", !state.authRequired);
  let tab = "dashboard";
  try { tab = localStorage.getItem("cd-tab") || tab; } catch { /* sem armazenamento */ }
  setTab($(`#tabs button[data-tab="${tab}"]`) ? tab : "dashboard");
  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (document.hidden) return;
    if (state.tab === "dashboard" || state.tab === "devices") refresh(); else loadOverview().catch(() => {});
  }, 15000);
}

(async () => {
  const s = await api("/api/session").catch(() => ({ auth_required: false, authenticated: true }));
  state.authRequired = s.auth_required;
  if (s.authenticated) start(); else showLogin();
})();
