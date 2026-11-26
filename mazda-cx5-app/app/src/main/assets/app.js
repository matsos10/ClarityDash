'use strict';
/* ===================== Ponte nativa (fallback no browser) ===================== */
const NATIVE = window.Android || {
  saveReminders() {}, setNotifyHour() {}, checkNow() { return 0; },
  notify(t, b) { alert(t + '\n' + b); }, notificationsAllowed() { return true; }, requestNotifications() {},
  saveFile(name, mime, content) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime })); a.download = name; a.click(); },
  shareText(t) { navigator.clipboard && navigator.clipboard.writeText(t); alert('Copiado'); },
  open(u) { window.open(u); }, toast(m) { console.log(m); }
};

/* ===================== Utilitários ===================== */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const DAY = 86400000;
const today = () => { const d = new Date(); return iso(d); };
const iso = d => { const z = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
const parseD = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const addMonths = (s, m) => { const d = new Date(parseD(s)); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + m); const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return iso(d); };
const fmtD = s => { if (!s) return '—'; const [y, m, d] = s.split('-'); return d + '/' + m + '/' + y; };
const num = (v, dec = 0) => (v == null || isNaN(v)) ? '—' : Number(v).toLocaleString('pt-PT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const km = v => num(v) + ' km';
const money = v => num(v || 0, 2) + ' ' + (S.settings.currency || '€');
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / DAY);

/* ===================== Estado ===================== */
const KEY = 'cx5data_v1';
let S;
function defaults() {
  return {
    setup: false,
    car: { name: 'O meu CX-5', gen: 'KF', year: '', engine: 'g20', trans: 'manual', awd: false, plate: '', vin: '', color: '', startDate: today(), startKm: 0, purchasePrice: '' },
    kmLog: [],
    items: DEFAULT_PLAN.map(p => ({ ...p, enabled: true, initKm: null, initDate: null })),
    services: [], fuel: [], expenses: [], reminders: [], contacts: [], parts: [],
    tires: { size: '225/65 R17', brand: '', pressF: 2.5, pressR: 2.5, current: 'Verão', logs: [] },
    checks: {},
    settings: { warnDays: 30, warnKm: 1500, notifyHour: 9, kmRemindDays: 14, currency: '€', notif: true, severe: false, light: false, fuelType: 'Gasolina 95' }
  };
}
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  const d = defaults();
  if (!S) S = d;
  for (const k in d) if (S[k] === undefined) S[k] = d[k];
  for (const k in d.settings) if (S.settings[k] === undefined) S.settings[k] = d.settings[k];
  // adicionar itens novos do plano que não existam
  DEFAULT_PLAN.forEach(p => { if (!S.items.find(i => i.id === p.id)) S.items.push({ ...p, enabled: true }); });
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { NATIVE.toast('Memória cheia! Remova fotos ou exporte um backup.'); }
  syncNative();
}

/* ===================== Quilometragem ===================== */
function readings() {
  const r = [];
  if (S.car.startDate) r.push({ date: S.car.startDate, km: +S.car.startKm || 0 });
  S.kmLog.forEach(x => r.push(x));
  S.fuel.forEach(x => x.km && r.push({ date: x.date, km: +x.km }));
  S.services.forEach(x => x.km && r.push({ date: x.date, km: +x.km }));
  S.expenses.forEach(x => x.km && r.push({ date: x.date, km: +x.km }));
  return r.filter(x => x.date && !isNaN(x.km)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.km - b.km);
}
function lastReading() {
  const r = readings(); if (!r.length) return { date: today(), km: 0 };
  return r.reduce((a, b) => b.km > a.km ? b : (b.km === a.km && b.date > a.date ? b : a));
}
function curKm() { return lastReading().km; }
function kmPerDay() {
  const r = readings(); if (r.length < 2) return 0;
  // usar últimos 365 dias quando possível
  const last = r[r.length - 1];
  let first = r[0];
  for (const x of r) if (daysBetween(x.date, last.date) <= 365) { first = x; break; }
  if (daysBetween(first.date, last.date) < 7) first = r[0];
  const d = daysBetween(first.date, last.date);
  return d > 0 ? Math.max(0, (last.km - first.km) / d) : 0;
}
function estKm() { const l = lastReading(); return Math.round(l.km + kmPerDay() * Math.max(0, daysBetween(l.date, today()))); }

/* ===================== Plano / estado de cada item ===================== */
function applicable(it) {
  const c = S.car;
  if (it.fuel === 'g' && c.engine.startsWith('d')) return false;
  if (it.fuel === 'd' && !c.engine.startsWith('d')) return false;
  if (it.engines && !it.engines.includes(c.engine)) return false;
  if (it.trans && it.trans !== c.trans) return false;
  if (it.awd && !c.awd) return false;
  return true;
}
function activeItems() { return S.items.filter(i => i.enabled && applicable(i)); }
function intervalOf(it) {
  const sev = S.settings.severe;
  return { km: +(sev && it.severeKm ? it.severeKm : it.km) || 0, months: +(sev && it.severeMonths ? it.severeMonths : it.months) || 0 };
}
function lastDone(it) {
  let best = null;
  if (it.initDate || it.initKm != null && it.initKm !== '') best = { date: it.initDate || S.car.startDate, km: it.initKm !== '' && it.initKm != null ? +it.initKm : null, src: 'manual' };
  S.services.forEach(s => {
    if ((s.items || []).includes(it.id) && (!best || s.date > best.date || (s.date === best.date && (+s.km || 0) > (best.km || 0)))) best = { date: s.date, km: s.km !== '' ? +s.km : null, src: s };
  });
  return best;
}
function itemStatus(it) {
  const iv = intervalOf(it);
  const ld = lastDone(it);
  const baseDate = ld ? ld.date : S.car.startDate;
  const baseKm = ld && ld.km != null ? ld.km : (ld ? null : +S.car.startKm || 0);
  const ck = curKm();
  let dueKm = null, dueDate = null, kmLeft = null, daysLeft = null, pct = 0;
  if (iv.km && baseKm != null) { dueKm = baseKm + iv.km; kmLeft = dueKm - ck; pct = Math.max(pct, (ck - baseKm) / iv.km); }
  if (iv.months && baseDate) { dueDate = addMonths(baseDate, iv.months); daysLeft = daysBetween(today(), dueDate); pct = Math.max(pct, daysBetween(baseDate, today()) / Math.max(1, daysBetween(baseDate, dueDate))); }
  const w = S.settings;
  let st = 'ok';
  if ((kmLeft != null && kmLeft < 0) || (daysLeft != null && daysLeft < 0)) st = 'bad';
  else if ((kmLeft != null && kmLeft <= w.warnKm) || (daysLeft != null && daysLeft <= w.warnDays)) st = 'warn';
  const parts = [];
  if (kmLeft != null) parts.push(kmLeft < 0 ? 'passou ' + km(-kmLeft) : 'faltam ' + km(kmLeft));
  if (daysLeft != null) parts.push(daysLeft < 0 ? 'atraso ' + (-daysLeft) + ' d' : daysLeft < 60 ? 'faltam ' + daysLeft + ' d' : 'até ' + fmtD(dueDate));
  return { st, dueKm, dueDate, kmLeft, daysLeft, pct: Math.min(1.2, Math.max(0, pct)), ld, txt: parts.join(' · ') || 'sem intervalo' };
}
function reminderStatus(r) {
  const w = S.settings; let st = 'ok', daysLeft = null, kmLeft = null;
  if (r.date) daysLeft = daysBetween(today(), r.date);
  if (r.km) kmLeft = r.km - curKm();
  if ((daysLeft != null && daysLeft < 0) || (kmLeft != null && kmLeft < 0)) st = 'bad';
  else if ((daysLeft != null && daysLeft <= (r.warnDays || w.warnDays)) || (kmLeft != null && kmLeft <= w.warnKm)) st = 'warn';
  const p = [];
  if (r.date) p.push(daysLeft < 0 ? 'expirou há ' + (-daysLeft) + ' d' : daysLeft === 0 ? 'hoje' : fmtD(r.date) + ' (' + daysLeft + ' d)');
  if (r.km) p.push(kmLeft < 0 ? 'passou ' + km(-kmLeft) : 'aos ' + km(r.km));
  return { st, daysLeft, kmLeft, txt: p.join(' · ') };
}
function syncNative() {
  try {
    const items = [];
    activeItems().forEach(it => { const s = itemStatus(it); items.push({ id: it.id, title: it.name, dueDate: s.dueDate ? parseD(s.dueDate) + 9 * 3600000 : 0, dueKm: s.dueKm || 0 }); });
    S.reminders.filter(r => !r.done).forEach(r => items.push({ id: r.id, title: r.title, dueDate: r.date ? parseD(r.date) + 9 * 3600000 : 0, dueKm: +r.km || 0, warnDays: +r.warnDays || S.settings.warnDays }));
    const lr = lastReading();
    NATIVE.saveReminders(JSON.stringify({ enabled: S.settings.notif, kmPerDay: kmPerDay(), lastKm: lr.km, lastKmDate: parseD(lr.date) + 12 * 3600000, warnDays: +S.settings.warnDays, warnKm: +S.settings.warnKm, kmRemindDays: +S.settings.kmRemindDays, items }));
  } catch (e) { console.log(e); }
}

/* ===================== Navegação ===================== */
let page = 'home', stack = [];
const TITLES = { home: 'CX-5', plan: 'Plano de manutenção', history: 'Histórico de serviços', fuel: 'Combustível', more: 'Mais opções', expenses: 'Despesas', reminders: 'Lembretes e documentos', tires: 'Pneus', stats: 'Estatísticas', secret: 'Códigos secretos', lights: 'Luzes do painel', dtc: 'Códigos OBD', specs: 'Especificações', checklists: 'Checklists', tips: 'Dicas', contacts: 'Oficinas e contactos', calc: 'Calculadoras', settings: 'Definições', car: 'O meu carro', kmlog: 'Registo de quilómetros', parts: 'Peças e referências', report: 'Relatório' };
function go(p, push = true) {
  if (push && p !== page) stack.push(page);
  if (['home', 'plan', 'history', 'fuel', 'more'].includes(p)) stack = [];
  page = p; render(); window.scrollTo(0, 0);
}
function handleBack() {
  if (!$('#modal').classList.contains('hidden')) { closeModal(); return true; }
  if (stack.length) { page = stack.pop(); render(); return true; }
  if (page !== 'home') { go('home', false); return true; }
  return false;
}
window.handleBack = handleBack;

function render() {
  $('#pageTitle').textContent = page === 'home' ? (S.car.name || 'CX-5') : TITLES[page] || '';
  $('#pageSub').textContent = page === 'home' ? [S.car.plate, ENGINES[S.car.engine]].filter(Boolean).join(' · ') : '';
  $('#backBtn').classList.toggle('hidden', ['home', 'plan', 'history', 'fuel', 'more'].includes(page));
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.p === page || (b.dataset.p === 'more' && !['home', 'plan', 'history', 'fuel'].includes(page))));
  document.body.classList.toggle('light', !!S.settings.light);
  const fn = PAGES[page] || PAGES.home;
  $('#main').innerHTML = fn();
  if (AFTER[page]) AFTER[page]();
}

/* ===================== Modal / formulários ===================== */
function openModal(html) { $('#sheet').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); $('#sheet').innerHTML = ''; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

let FORM = null;
function form(title, fields, values, onSave, onDelete) {
  FORM = { fields, onSave, onDelete, photo: values.photo || null };
  let h = '<h2>' + esc(title) + '</h2>';
  fields.forEach(f => {
    const v = values[f.k] != null ? values[f.k] : (f.def != null ? f.def : '');
    if (f.type === 'check') h += `<label class="chk"><input type="checkbox" id="f_${f.k}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
    else if (f.type === 'select') h += `<label class="f">${esc(f.label)}<select id="f_${f.k}">${f.options.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select></label>`;
    else if (f.type === 'textarea') h += `<label class="f">${esc(f.label)}<textarea id="f_${f.k}">${esc(v)}</textarea></label>`;
    else if (f.type === 'multi') h += `<div class="f muted small">${esc(f.label)}</div><div class="card" style="padding:4px 12px">${f.options.map(([ov, ol]) => `<label class="chk"><input type="checkbox" name="m_${f.k}" value="${esc(ov)}" ${(v || []).includes(ov) ? 'checked' : ''}> ${esc(ol)}</label>`).join('')}</div>`;
    else if (f.type === 'photo') h += `<label class="f">${esc(f.label)}<input type="file" accept="image/*" onchange="pickPhoto(this)"></label><div id="photoPrev">${FORM.photo ? `<img class="photo" src="${FORM.photo}"><button class="btn sm danger" onclick="FORM.photo=null;$('#photoPrev').innerHTML=''">Remover foto</button>` : ''}</div>`;
    else h += `<label class="f">${esc(f.label)}<input id="f_${f.k}" type="${f.type || 'text'}" ${f.type === 'number' ? 'inputmode="decimal" step="any"' : ''} value="${esc(v)}" placeholder="${esc(f.ph || '')}"></label>`;
  });
  h += '<div class="actions">' + (onDelete ? '<button class="btn danger" onclick="formDelete()">Apagar</button>' : '') + '<button class="btn sec" onclick="closeModal()">Cancelar</button><button class="btn" onclick="formSave()">Guardar</button></div>';
  openModal(h);
}
function formSave() {
  const o = {};
  for (const f of FORM.fields) {
    if (f.type === 'check') o[f.k] = $('#f_' + f.k).checked;
    else if (f.type === 'multi') o[f.k] = [...document.querySelectorAll(`input[name="m_${f.k}"]:checked`)].map(x => x.value);
    else if (f.type === 'photo') o[f.k] = FORM.photo;
    else { let v = $('#f_' + f.k).value.trim(); if (f.type === 'number') v = v === '' ? '' : parseFloat(v.replace(',', '.')); o[f.k] = v; }
    if (f.req && (o[f.k] === '' || o[f.k] == null)) { NATIVE.toast('Preencha: ' + f.label); return; }
  }
  if (FORM.onSave(o) === false) return;
  save(); closeModal(); render();
}
function formDelete() { if (!confirm('Apagar este registo?')) return; FORM.onDelete(); save(); closeModal(); render(); }
function pickPhoto(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 900, sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * sc; c.height = img.height * sc;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      FORM.photo = c.toDataURL('image/jpeg', 0.6);
      $('#photoPrev').innerHTML = `<img class="photo" src="${FORM.photo}">`;
    };
    img.src = r.result;
  };
  r.readAsDataURL(f);
}
function showPhoto(src) { openModal(`<img class="photo" src="${src}"><div class="actions"><button class="btn sec" onclick="closeModal()">Fechar</button></div>`); }

/* ===================== Ações rápidas ===================== */
function quickKm() {
  form('Atualizar quilometragem', [
    { k: 'km', label: 'Quilómetros atuais (conta-km)', type: 'number', req: true, ph: 'ex.: 45230' },
    { k: 'date', label: 'Data', type: 'date', def: today() }
  ], { km: '' }, o => {
    if (o.km < curKm() && !confirm('Valor inferior à última leitura (' + km(curKm()) + '). Guardar mesmo assim?')) return false;
    S.kmLog.push({ id: uid(), date: o.date || today(), km: o.km });
  });
}
function svcForm(s, preItems) {
  const isNew = !s; s = s || { date: today(), km: curKm() || '', items: preItems || [], cost: '', workshop: '', title: '' };
  form(isNew ? 'Registar serviço' : 'Editar serviço', [
    { k: 'date', label: 'Data', type: 'date', req: true },
    { k: 'km', label: 'Quilómetros', type: 'number' },
    { k: 'title', label: 'Descrição', ph: 'ex.: Revisão dos 40.000 km' },
    { k: 'items', label: 'Itens do plano realizados', type: 'multi', options: activeItems().map(i => [i.id, i.name]) },
    { k: 'cost', label: 'Custo total (' + S.settings.currency + ')', type: 'number' },
    { k: 'labor', label: 'Dos quais mão-de-obra', type: 'number' },
    { k: 'workshop', label: 'Oficina', ph: 'Concessionário / oficina', def: (S.contacts.find(c => c.type === 'Oficina') || {}).name || '' },
    { k: 'warranty', label: 'Garantia do serviço até', type: 'date' },
    { k: 'notes', label: 'Notas / peças usadas', type: 'textarea' },
    { k: 'photo', label: 'Foto da fatura', type: 'photo' }
  ], s, o => {
    if (isNew) S.services.push({ id: uid(), ...o }); else Object.assign(s, o);
  }, isNew ? null : () => { S.services = S.services.filter(x => x !== s); });
}
function markDone(id) { svcForm(null, [id]); }

/* ===================== Gráficos ===================== */
function chart(id, labels, values, opt = {}) {
  const c = document.getElementById(id); if (!c) return;
  const dpr = window.devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
  c.width = W * dpr; c.height = H * dpr;
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  const css = getComputedStyle(document.body);
  const muted = css.getPropertyValue('--muted').trim(), line = css.getPropertyValue('--line').trim();
  const color = opt.color || '#e0314c';
  if (!values.length) { g.fillStyle = muted; g.font = '13px sans-serif'; g.fillText('Sem dados suficientes', 10, H / 2); return; }
  const max = Math.max(...values) * 1.15 || 1, min = opt.line ? Math.min(...values) * 0.9 : 0;
  const pl = 40, pb = 22, pt = 8, w = W - pl - 6, h = H - pb - pt;
  g.strokeStyle = line; g.fillStyle = muted; g.font = '10px sans-serif'; g.lineWidth = 1;
  for (let i = 0; i <= 3; i++) { const y = pt + h - h * i / 3; g.beginPath(); g.moveTo(pl, y); g.lineTo(W - 6, y); g.stroke(); g.fillText(num(min + (max - min) * i / 3, opt.dec || 0), 2, y + 3); }
  const n = values.length, step = w / n;
  const yOf = v => pt + h - (v - min) / (max - min) * h;
  if (opt.line) {
    g.strokeStyle = color; g.lineWidth = 2; g.beginPath();
    values.forEach((v, i) => { const x = pl + step * i + step / 2; i ? g.lineTo(x, yOf(v)) : g.moveTo(x, yOf(v)); }); g.stroke();
    g.fillStyle = color; values.forEach((v, i) => { g.beginPath(); g.arc(pl + step * i + step / 2, yOf(v), 2.5, 0, 7); g.fill(); });
  } else {
    g.fillStyle = color;
    values.forEach((v, i) => { const bw = Math.max(2, step * 0.65); const x = pl + step * i + (step - bw) / 2; g.fillRect(x, yOf(v), bw, pt + h - yOf(v)); });
  }
  g.fillStyle = muted; const every = Math.ceil(n / 8);
  labels.forEach((l, i) => { if (i % every === 0) g.fillText(l, pl + step * i + 2, H - 6); });
}

/* ===================== Combustível: cálculos ===================== */
function fuelCalc() {
  const f = [...S.fuel].sort((a, b) => a.km - b.km);
  const res = []; let litersAcc = 0, lastFullKm = null;
  f.forEach(x => {
    if (lastFullKm == null) { if (x.full) lastFullKm = +x.km; return; }
    litersAcc += +x.liters;
    if (x.full) { const d = x.km - lastFullKm; if (d > 0) res.push({ id: x.id, date: x.date, l100: litersAcc / d * 100, dist: d }); litersAcc = 0; lastFullKm = +x.km; }
  });
  const totL = res.reduce((a, b) => a + b.l100 * b.dist / 100, 0), totD = res.reduce((a, b) => a + b.dist, 0);
  return { list: res, avg: totD ? totL / totD * 100 : null };
}

/* ===================== Páginas ===================== */
const AFTER = {};
const PAGES = {};

PAGES.home = () => {
  if (!S.setup) return `<div class="card hero"><div class="big">Bem-vindo! 👋</div><p>Configure o seu Mazda CX-5 para gerar automaticamente o plano de manutenção e as notificações.</p><button class="btn block" style="background:#fff;color:#7a0019" onclick="carForm(true)">Configurar o meu carro</button></div>` + PAGES.homeBody();
  return PAGES.homeBody();
};
PAGES.homeBody = () => {
  const ck = curKm(), kpd = kmPerDay(), lr = lastReading();
  const all = activeItems().map(i => ({ i, s: itemStatus(i) }));
  const rem = S.reminders.filter(r => !r.done).map(r => ({ r, s: reminderStatus(r) }));
  const bad = all.filter(x => x.s.st === 'bad').length + rem.filter(x => x.s.st === 'bad').length;
  const warn = all.filter(x => x.s.st === 'warn').length + rem.filter(x => x.s.st === 'warn').length;
  const health = all.length ? Math.round(all.filter(x => x.s.st === 'ok').length / all.length * 100) : 100;
  const next = all.filter(x => x.s.st !== 'ok' || x.s.pct > 0.6).sort((a, b) => b.s.pct - a.s.pct).slice(0, 6);
  const year = new Date().getFullYear() + '';
  const spentY = sumYear(year);
  const fc = fuelCalc();
  let h = `<div class="card hero">
    <div class="row between"><div><div class="muted small">Conta-quilómetros</div><div class="km">${num(ck)} km</div>
    <div class="muted small">Última leitura ${fmtD(lr.date)}${kpd ? ' · estimativa hoje ≈ ' + num(estKm()) + ' km' : ''}</div></div>
    <div class="right"><div class="big">${health}%</div><div class="muted small">saúde</div></div></div>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn sm" style="background:#fff;color:#7a0019" onclick="quickKm()">📟 Atualizar km</button><button class="btn sm" style="background:#ffffff26" onclick="svcForm()">🔧 Serviço</button><button class="btn sm" style="background:#ffffff26" onclick="fuelForm()">⛽ Abastecer</button></div></div>`;
  h += `<div class="grid3" style="margin-bottom:12px">
    <div class="stat"><div class="v bad">${bad}</div><div class="l">Em atraso</div></div>
    <div class="stat"><div class="v warn">${warn}</div><div class="l">Brevemente</div></div>
    <div class="stat"><div class="v">${kpd ? num(kpd * 30) : '—'}</div><div class="l">km / mês</div></div>
    <div class="stat"><div class="v">${money(spentY)}</div><div class="l">Gasto ${year}</div></div>
    <div class="stat"><div class="v">${fc.avg ? num(fc.avg, 1) : '—'}</div><div class="l">L/100 km</div></div>
    <div class="stat"><div class="v">${costPerKm() ? num(costPerKm(), 2) : '—'}</div><div class="l">${S.settings.currency}/km</div></div></div>`;
  h += `<div class="card"><h3>Próximas manutenções</h3>${next.length ? next.map(x => itemRow(x.i, x.s)).join('') : '<div class="muted">Tudo em dia ✅</div>'}<button class="btn sec block sm" style="margin-top:8px" onclick="go('plan')">Ver plano completo</button></div>`;
  const remSoon = rem.filter(x => x.s.st !== 'ok' || (x.s.daysLeft != null && x.s.daysLeft < 90));
  h += `<div class="card"><h3>Documentos e lembretes</h3>${remSoon.length ? remSoon.map(x => remRow(x.r, x.s)).join('') : '<div class="muted small">Sem lembretes nos próximos 90 dias.</div>'}<button class="btn sec block sm" style="margin-top:8px" onclick="go('reminders')">Gerir lembretes</button></div>`;
  const lastS = [...S.services].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (lastS) h += `<div class="card"><h3>Último serviço</h3>${svcRow(lastS)}</div>`;
  h += `<div class="card"><h3>💡 Dica</h3><div>${esc(TIPS[new Date().getDate() % TIPS.length])}</div></div>`;
  return h;
};
function itemRow(it, s) {
  const col = { ok: 'ok', warn: 'warn', bad: 'bad' }[s.st];
  return `<div class="item" onclick="itemDetail('${it.id}')"><span class="dot bg-${col}"></span><div class="grow"><div class="t">${esc(it.name)}</div><div class="d">${s.txt}</div><div class="bar"><i class="bg-${col}" style="width:${Math.min(100, s.pct * 100)}%"></i></div></div></div>`;
}
function remRow(r, s) {
  return `<div class="item" onclick="remForm('${r.id}')"><span class="dot bg-${r.done ? 'off' : s.st}"></span><div class="grow"><div class="t">${esc(r.title)}</div><div class="d">${s.txt || 'sem data'}${r.repeatMonths ? ' · repete ' + r.repeatMonths + ' meses' : ''}</div></div>${!r.done ? `<button class="btn sm sec" onclick="event.stopPropagation();remDone('${r.id}')">✓</button>` : ''}</div>`;
}
function svcRow(s) {
  const names = (s.items || []).map(id => (S.items.find(i => i.id === id) || {}).name).filter(Boolean);
  return `<div class="item" onclick="svcForm(S.services.find(x=>x.id==='${s.id}'))"><div class="grow"><div class="t">${esc(s.title || names[0] || 'Serviço')}</div><div class="d">${fmtD(s.date)} · ${km(s.km)}${s.workshop ? ' · ' + esc(s.workshop) : ''}</div>${names.length ? `<div class="d">${names.map(esc).join(', ')}</div>` : ''}</div><div class="right"><b>${s.cost !== '' && s.cost != null ? money(s.cost) : ''}</b>${s.photo ? '<div class="small">📎</div>' : ''}</div></div>`;
}

/* ---- Plano ---- */
let planFilter = 'Todos';
PAGES.plan = () => {
  const cats = ['Todos', 'Atenção', ...new Set(activeItems().map(i => i.cat))];
  let list = activeItems().map(i => ({ i, s: itemStatus(i) }));
  if (planFilter === 'Atenção') list = list.filter(x => x.s.st !== 'ok'); else if (planFilter !== 'Todos') list = list.filter(x => x.i.cat === planFilter);
  list.sort((a, b) => ({ bad: 0, warn: 1, ok: 2 }[a.s.st] - { bad: 0, warn: 1, ok: 2 }[b.s.st]) || b.s.pct - a.s.pct);
  const off = S.items.filter(i => !i.enabled && applicable(i));
  return `<div class="row between" style="margin-bottom:8px"><label class="chk" style="padding:0"><input type="checkbox" ${S.settings.severe ? 'checked' : ''} onchange="S.settings.severe=this.checked;save();render()"> Uso severo (cidade, trajetos curtos)</label></div>
  <div class="chips">${cats.map(c => `<button class="chip ${c === planFilter ? 'on' : ''}" onclick="planFilter='${c}';render()">${c}</button>`).join('')}</div>
  <div class="card">${list.map(x => itemRow(x.i, x.s)).join('') || '<div class="empty">Nada aqui 👍</div>'}</div>
  ${off.length ? `<div class="card"><h3>Desativados</h3>${off.map(i => `<div class="item" onclick="itemEdit('${i.id}')"><span class="dot bg-off"></span><div class="grow">${esc(i.name)}</div></div>`).join('')}</div>` : ''}
  <button class="btn sec block" onclick="itemEdit()">＋ Adicionar item personalizado</button>`;
};
function itemDetail(id) {
  const it = S.items.find(i => i.id === id), s = itemStatus(it), iv = intervalOf(it);
  const hist = S.services.filter(x => (x.items || []).includes(id)).sort((a, b) => b.date.localeCompare(a.date));
  openModal(`<h2>${esc(it.name)}</h2>
  <div class="badge ${s.st}" style="display:inline-block;margin-bottom:10px">${{ ok: 'Em dia', warn: 'Brevemente', bad: 'Em atraso' }[s.st]}</div>
  <table><tr><td>Intervalo</td><td>${iv.km ? km(iv.km) : ''}${iv.km && iv.months ? ' / ' : ''}${iv.months ? iv.months + ' meses' : ''}${S.settings.severe && (it.severeKm || it.severeMonths) ? ' (uso severo)' : ''}</td></tr>
  <tr><td>Última vez</td><td>${s.ld ? fmtD(s.ld.date) + (s.ld.km != null ? ' · ' + km(s.ld.km) : '') : 'Nunca registado (contagem desde ' + fmtD(S.car.startDate) + ')'}</td></tr>
  <tr><td>Próxima</td><td>${s.dueKm ? km(s.dueKm) : ''}${s.dueKm && s.dueDate ? ' ou ' : ''}${s.dueDate ? fmtD(s.dueDate) : ''}</td></tr>
  <tr><td>Estado</td><td>${s.txt}</td></tr></table>
  ${it.notes ? `<div class="code">${esc(it.notes)}</div>` : ''}
  ${hist.length ? '<h3 class="muted small" style="margin-top:12px">HISTÓRICO</h3>' + hist.map(svcRow).join('') : ''}
  <div class="actions"><button class="btn sec" onclick="itemEdit('${id}')">Editar</button><button class="btn" onclick="markDone('${id}')">✓ Feito</button></div>`);
}
function itemEdit(id) {
  const it = id ? S.items.find(i => i.id === id) : null;
  form(it ? 'Editar item' : 'Novo item', [
    { k: 'name', label: 'Nome', req: true },
    { k: 'cat', label: 'Categoria', def: 'Outros' },
    { k: 'km', label: 'Intervalo em km (0 = sem limite de km)', type: 'number', def: 0 },
    { k: 'months', label: 'Intervalo em meses (0 = sem limite de tempo)', type: 'number', def: 12 },
    { k: 'severeKm', label: 'Intervalo km em uso severo (opcional)', type: 'number' },
    { k: 'severeMonths', label: 'Intervalo meses em uso severo (opcional)', type: 'number' },
    { k: 'initKm', label: 'Última vez feito aos (km) – se não houver registo', type: 'number' },
    { k: 'initDate', label: 'Última vez feito em (data)', type: 'date' },
    { k: 'notes', label: 'Notas', type: 'textarea' },
    { k: 'enabled', label: 'Ativo (gera avisos)', type: 'check', def: true }
  ], it || {}, o => {
    if (it) Object.assign(it, o); else S.items.push({ id: uid(), ...o });
  }, it && !DEFAULT_PLAN.find(p => p.id === id) ? () => { S.items = S.items.filter(x => x !== it); } : null);
}

/* ---- Histórico ---- */
let histQ = '';
PAGES.history = () => {
  const list = [...S.services].sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km).filter(s => !histQ || JSON.stringify([s.title, s.workshop, s.notes, (s.items || []).map(id => (S.items.find(i => i.id === id) || {}).name)]).toLowerCase().includes(histQ.toLowerCase()));
  const tot = S.services.reduce((a, b) => a + (+b.cost || 0), 0);
  const years = {}; list.forEach(s => (years[s.date.slice(0, 4)] = years[s.date.slice(0, 4)] || []).push(s));
  return `<div class="grid2" style="margin-bottom:12px"><div class="stat"><div class="v">${S.services.length}</div><div class="l">Serviços</div></div><div class="stat"><div class="v">${money(tot)}</div><div class="l">Total em manutenção</div></div></div>
  <input class="s" placeholder="🔍 Pesquisar…" value="${esc(histQ)}" oninput="histQ=this.value;clearTimeout(window._ht);window._ht=setTimeout(()=>{render();const i=document.querySelector('input.s');i.focus();i.setSelectionRange(i.value.length,i.value.length)},300)" style="margin-bottom:12px">
  ${Object.keys(years).sort().reverse().map(y => `<div class="card"><h3>${y} · ${money(years[y].reduce((a, b) => a + (+b.cost || 0), 0))}</h3>${years[y].map(svcRow).join('')}</div>`).join('') || '<div class="empty">Sem serviços registados.<br>Toque em ＋ para adicionar.</div>'}
  <button class="fab" onclick="svcForm()">＋</button>`;
};

/* ---- Combustível ---- */
function fuelForm(id) {
  const f = id ? S.fuel.find(x => x.id === id) : null;
  const lastP = S.fuel.length ? [...S.fuel].sort((a, b) => b.date.localeCompare(a.date))[0].price : '';
  form(f ? 'Editar abastecimento' : 'Abastecimento', [
    { k: 'date', label: 'Data', type: 'date', def: today(), req: true },
    { k: 'km', label: 'Quilómetros no conta-km', type: 'number', req: true, def: curKm() || '' },
    { k: 'liters', label: 'Litros', type: 'number', req: true },
    { k: 'price', label: 'Preço por litro', type: 'number', def: lastP },
    { k: 'total', label: 'Total pago (vazio = calcula)', type: 'number' },
    { k: 'full', label: 'Depósito cheio (necessário para calcular consumo)', type: 'check', def: true },
    { k: 'fuelType', label: 'Combustível', type: 'select', options: ['Gasolina 95', 'Gasolina 98', 'Gasóleo', 'Gasóleo aditivado', 'AdBlue'], def: S.car.engine.startsWith('d') ? 'Gasóleo' : 'Gasolina 95' },
    { k: 'station', label: 'Posto' },
    { k: 'notes', label: 'Notas (ex.: autoestrada, cidade, A/C)', type: 'textarea' }
  ], f || {}, o => {
    if (o.total === '' && o.price !== '') o.total = Math.round(o.liters * o.price * 100) / 100;
    if (o.price === '' && o.total !== '') o.price = Math.round(o.total / o.liters * 1000) / 1000;
    if (f) Object.assign(f, o); else S.fuel.push({ id: uid(), ...o });
  }, f ? () => { S.fuel = S.fuel.filter(x => x !== f); } : null);
}
PAGES.fuel = () => {
  const fc = fuelCalc(), map = {}; fc.list.forEach(x => map[x.id] = x.l100);
  const list = [...S.fuel].sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km);
  const tot = S.fuel.reduce((a, b) => a + (+b.total || 0), 0), totL = S.fuel.reduce((a, b) => a + (+b.liters || 0), 0);
  const best = fc.list.length ? Math.min(...fc.list.map(x => x.l100)) : null, worst = fc.list.length ? Math.max(...fc.list.map(x => x.l100)) : null;
  const avgP = totL ? tot / totL : null;
  return `<div class="grid2" style="margin-bottom:12px">
    <div class="stat"><div class="v">${fc.avg ? num(fc.avg, 2) : '—'}</div><div class="l">L/100 km médio</div></div>
    <div class="stat"><div class="v">${fc.avg && avgP ? num(fc.avg * avgP / 100, 3) : '—'}</div><div class="l">${S.settings.currency}/km combustível</div></div>
    <div class="stat"><div class="v">${money(tot)}</div><div class="l">Total gasto (${num(totL, 0)} L)</div></div>
    <div class="stat"><div class="v">${best ? num(best, 1) + ' / ' + num(worst, 1) : '—'}</div><div class="l">Melhor / pior L/100</div></div></div>
  <div class="card"><h3>Consumo (L/100 km)</h3><canvas id="cFuel"></canvas></div>
  <div class="card"><h3>Preço por litro</h3><canvas id="cPrice"></canvas></div>
  <div class="card"><h3>Abastecimentos</h3>${list.map(f => `<div class="item" onclick="fuelForm('${f.id}')"><div class="grow"><div class="t">${num(f.liters, 2)} L · ${money(f.total)}</div><div class="d">${fmtD(f.date)} · ${km(f.km)} · ${num(f.price, 3)}/L${f.station ? ' · ' + esc(f.station) : ''}${f.full ? '' : ' · parcial'}</div></div><div class="right">${map[f.id] ? '<b>' + num(map[f.id], 1) + '</b><div class="small muted">L/100</div>' : ''}</div></div>`).join('') || '<div class="empty">Sem abastecimentos.</div>'}</div>
  <button class="fab" onclick="fuelForm()">＋</button>`;
};
AFTER.fuel = () => {
  const fc = fuelCalc().list.slice(-20);
  chart('cFuel', fc.map(x => x.date.slice(5)), fc.map(x => x.l100), { line: true, dec: 1 });
  const p = [...S.fuel].filter(x => x.price).sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
  chart('cPrice', p.map(x => x.date.slice(5)), p.map(x => +x.price), { line: true, dec: 2, color: '#f0a020' });
};

/* ---- Mais ---- */
PAGES.more = () => {
  const m = [['reminders', '📅', 'Lembretes & documentos'], ['expenses', '💶', 'Despesas'], ['stats', '📊', 'Estatísticas'], ['tires', '🛞', 'Pneus'], ['secret', '🔐', 'Códigos secretos'], ['lights', '🚨', 'Luzes do painel'], ['dtc', '🧰', 'Códigos OBD'], ['specs', '📐', 'Especificações'], ['parts', '🔩', 'Peças & referências'], ['checklists', '✅', 'Checklists'], ['calc', '🧮', 'Calculadoras'], ['contacts', '📞', 'Oficinas & contactos'], ['kmlog', '📟', 'Registo de km'], ['report', '📄', 'Relatório / venda'], ['tips', '💡', 'Dicas'], ['car', '🚙', 'O meu carro'], ['settings', '⚙️', 'Definições']];
  return `<div class="menu-grid">${m.map(([p, i, l]) => `<button onclick="go('${p}')"><span>${i}</span>${l}</button>`).join('')}</div>`;
};

/* ---- Lembretes ---- */
function remForm(id) {
  const r = id ? S.reminders.find(x => x.id === id) : null;
  form(r ? 'Editar lembrete' : 'Novo lembrete', [
    { k: 'title', label: 'Título', req: true, ph: 'ex.: Seguro, IUC, IPO, Via Verde…' },
    { k: 'cat', label: 'Categoria', type: 'select', options: ['Documentos', 'Manutenção', 'Garantia', 'Pagamentos', 'Outros'], def: 'Documentos' },
    { k: 'date', label: 'Data', type: 'date' },
    { k: 'km', label: 'Ou aos quilómetros', type: 'number' },
    { k: 'repeatMonths', label: 'Repetir a cada (meses, 0 = não repete)', type: 'number', def: 0 },
    { k: 'warnDays', label: 'Avisar com quantos dias de antecedência', type: 'number', def: S.settings.warnDays },
    { k: 'amount', label: 'Valor previsto', type: 'number' },
    { k: 'notes', label: 'Notas (nº apólice, contacto…)', type: 'textarea' },
    { k: 'done', label: 'Concluído', type: 'check' }
  ], r || {}, o => {
    if (!o.date && !o.km) { NATIVE.toast('Indique uma data ou km'); return false; }
    if (r) Object.assign(r, o); else S.reminders.push({ id: uid(), ...o });
  }, r ? () => { S.reminders = S.reminders.filter(x => x !== r); } : null);
}
function remDone(id) {
  const r = S.reminders.find(x => x.id === id);
  if (+r.repeatMonths > 0 && r.date) {
    if (r.amount && confirm('Registar ' + money(r.amount) + ' como despesa?')) S.expenses.push({ id: uid(), date: today(), cat: /seguro/i.test(r.title) ? 'Seguro' : /iuc|imposto/i.test(r.title) ? 'IUC / Impostos' : /ipo|inspe/i.test(r.title) ? 'Inspeção' : 'Outros', desc: r.title, amount: r.amount, km: '' });
    r.date = addMonths(r.date, +r.repeatMonths);
    NATIVE.toast('Próximo: ' + fmtD(r.date));
  } else r.done = true;
  save(); render();
}
PAGES.reminders = () => {
  const act = S.reminders.filter(r => !r.done).map(r => ({ r, s: reminderStatus(r) })).sort((a, b) => (a.s.daysLeft ?? 99999) - (b.s.daysLeft ?? 99999));
  const done = S.reminders.filter(r => r.done);
  return `<div class="card"><h3>Ativos</h3>${act.map(x => remRow(x.r, x.s)).join('') || '<div class="muted">Sem lembretes.</div>'}</div>
  ${done.length ? `<div class="card"><h3>Concluídos</h3>${done.map(r => remRow(r, reminderStatus(r))).join('')}</div>` : ''}
  <div class="card"><h3>Adicionar rapidamente</h3><div class="row wrap">${['Seguro automóvel', 'IUC – Imposto Único de Circulação', 'Inspeção periódica (IPO)', 'Fim da garantia', 'Via Verde', 'Carta de condução', 'Prestação / leasing', 'Lavagem'].map(t => `<button class="chip" onclick="remQuick('${t}')">${t}</button>`).join('')}</div></div>
  <button class="fab" onclick="remForm()">＋</button>`;
};
function remQuick(t) { remForm(); $('#f_title').value = t; const rep = { 'Seguro automóvel': 12, 'IUC – Imposto Único de Circulação': 12, 'Inspeção periódica (IPO)': 24, 'Prestação / leasing': 1, 'Lavagem': 1 }[t]; if (rep) $('#f_repeatMonths').value = rep; }

/* ---- Despesas ---- */
let expYear = 'Todos';
function expForm(id) {
  const e = id ? S.expenses.find(x => x.id === id) : null;
  form(e ? 'Editar despesa' : 'Nova despesa', [
    { k: 'date', label: 'Data', type: 'date', def: today(), req: true },
    { k: 'cat', label: 'Categoria', type: 'select', options: EXPENSE_CATS },
    { k: 'desc', label: 'Descrição' },
    { k: 'amount', label: 'Valor', type: 'number', req: true },
    { k: 'km', label: 'Quilómetros (opcional)', type: 'number' },
    { k: 'photo', label: 'Foto do recibo', type: 'photo' }
  ], e || {}, o => { if (e) Object.assign(e, o); else S.expenses.push({ id: uid(), ...o }); }, e ? () => { S.expenses = S.expenses.filter(x => x !== e); } : null);
}
function allCosts() {
  return [
    ...S.services.map(s => ({ date: s.date, cat: 'Manutenção', amount: +s.cost || 0 })),
    ...S.fuel.map(f => ({ date: f.date, cat: 'Combustível', amount: +f.total || 0 })),
    ...S.expenses.map(e => ({ date: e.date, cat: e.cat, amount: +e.amount || 0 }))
  ];
}
function sumYear(y) { return allCosts().filter(c => c.date.startsWith(y)).reduce((a, b) => a + b.amount, 0); }
function costPerKm() { const r = readings(); if (r.length < 2) return null; const d = curKm() - (+S.car.startKm || 0); const t = allCosts().filter(c => c.date >= S.car.startDate).reduce((a, b) => a + b.amount, 0); return d > 100 ? t / d : null; }
PAGES.expenses = () => {
  const years = ['Todos', ...new Set(S.expenses.map(e => e.date.slice(0, 4)))].sort().reverse();
  const list = S.expenses.filter(e => expYear === 'Todos' || e.date.startsWith(expYear)).sort((a, b) => b.date.localeCompare(a.date));
  const byCat = {}; list.forEach(e => byCat[e.cat] = (byCat[e.cat] || 0) + (+e.amount || 0));
  const tot = list.reduce((a, b) => a + (+b.amount || 0), 0);
  return `<div class="chips">${years.map(y => `<button class="chip ${y === expYear ? 'on' : ''}" onclick="expYear='${y}';render()">${y}</button>`).join('')}</div>
  <div class="card"><h3>Total: ${money(tot)}</h3>${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<div class="row between small" style="padding:4px 0"><span>${esc(c)}</span><b>${money(v)}</b></div><div class="bar"><i class="bg-warn" style="width:${v / tot * 100}%"></i></div>`).join('') || '<div class="muted">Sem despesas.</div>'}</div>
  <div class="card">${list.map(e => `<div class="item" onclick="expForm('${e.id}')"><div class="grow"><div class="t">${esc(e.desc || e.cat)}</div><div class="d">${fmtD(e.date)} · ${esc(e.cat)}${e.photo ? ' · 📎' : ''}</div></div><b>${money(e.amount)}</b></div>`).join('') || '<div class="empty">Sem despesas.</div>'}</div>
  <button class="fab" onclick="expForm()">＋</button>`;
};

/* ---- Estatísticas ---- */
PAGES.stats = () => {
  const c = allCosts(), tot = c.reduce((a, b) => a + b.amount, 0);
  const byCat = {}; c.forEach(x => byCat[x.cat] = (byCat[x.cat] || 0) + x.amount);
  const driven = curKm() - (+S.car.startKm || 0);
  const days = Math.max(1, daysBetween(S.car.startDate, today()));
  return `<div class="grid2" style="margin-bottom:12px">
   <div class="stat"><div class="v">${money(tot)}</div><div class="l">Total registado</div></div>
   <div class="stat"><div class="v">${km(driven)}</div><div class="l">Percorridos desde ${fmtD(S.car.startDate)}</div></div>
   <div class="stat"><div class="v">${money(tot / days * 30)}</div><div class="l">Custo médio / mês</div></div>
   <div class="stat"><div class="v">${costPerKm() ? num(costPerKm(), 3) + ' ' + S.settings.currency : '—'}</div><div class="l">Custo por km</div></div>
   <div class="stat"><div class="v">${num(kmPerDay() * 365)}</div><div class="l">km / ano (estimado)</div></div>
   <div class="stat"><div class="v">${S.car.purchasePrice ? money((+S.car.purchasePrice || 0) + tot) : '—'}</div><div class="l">Custo total c/ compra</div></div></div>
  <div class="card"><h3>Gastos por mês (12 meses)</h3><canvas id="cMonth"></canvas></div>
  <div class="card"><h3>Quilómetros por mês</h3><canvas id="cKm"></canvas></div>
  <div class="card"><h3>Por categoria</h3>${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="row between small" style="padding:4px 0"><span>${esc(k)}</span><b>${money(v)} · ${num(v / tot * 100)}%</b></div><div class="bar"><i class="bg-ok" style="width:${v / tot * 100}%"></i></div>`).join('') || '<div class="muted">Sem dados</div>'}</div>
  <div class="card"><h3>Por ano</h3>${[...new Set(c.map(x => x.date.slice(0, 4)))].sort().reverse().map(y => `<div class="row between" style="padding:5px 0"><span>${y}</span><b>${money(sumYear(y))}</b></div>`).join('') || '<div class="muted">Sem dados</div>'}</div>`;
};
AFTER.stats = () => {
  const months = []; const d = new Date(); d.setDate(1);
  for (let i = 11; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); months.push(iso(x).slice(0, 7)); }
  const c = allCosts();
  chart('cMonth', months.map(m => m.slice(5)), months.map(m => c.filter(x => x.date.startsWith(m)).reduce((a, b) => a + b.amount, 0)));
  const r = readings();
  const kmAt = m => { const end = r.filter(x => x.date.slice(0, 7) <= m); return end.length ? Math.max(...end.map(x => x.km)) : null; };
  const vals = months.map((m, i) => { const a = kmAt(m), prev = i ? kmAt(months[i - 1]) : kmAt(iso(new Date(d.getFullYear(), d.getMonth() - 12, 1)).slice(0, 7)); return a != null && prev != null ? Math.max(0, a - prev) : 0; });
  chart('cKm', months.map(m => m.slice(5)), vals, { color: '#2fb36d' });
};

/* ---- Pneus ---- */
PAGES.tires = () => {
  const t = S.tires, logs = [...t.logs].sort((a, b) => b.date.localeCompare(a.date));
  const last = logs[0];
  const minD = last ? Math.min(...['fl', 'fr', 'rl', 'rr'].map(k => +last[k]).filter(v => !isNaN(v))) : null;
  return `<div class="card"><h3>Configuração</h3><table>
   <tr><td>Medida</td><td>${esc(t.size)}</td></tr><tr><td>Marca / modelo</td><td>${esc(t.brand) || '—'}</td></tr>
   <tr><td>Pressão frente / trás</td><td>${num(t.pressF, 1)} / ${num(t.pressR, 1)} bar (${num(t.pressF * 14.5038)} / ${num(t.pressR * 14.5038)} psi)</td></tr>
   <tr><td>Jogo montado</td><td>${esc(t.current)}</td></tr><tr><td>Montados em</td><td>${t.mountDate ? fmtD(t.mountDate) + ' · ' + km(t.mountKm) : '—'}</td></tr>
   <tr><td>DOT (fabrico)</td><td>${esc(t.dot) || '—'}</td></tr></table>
   <button class="btn sec block sm" style="margin-top:10px" onclick="tireForm()">Editar</button></div>
  <div class="card"><h3>Estado do piso</h3>${last ? `<div class="grid2"><div class="stat"><div class="l">Frente esq.</div><div class="v">${last.fl} mm</div></div><div class="stat"><div class="l">Frente dir.</div><div class="v">${last.fr} mm</div></div><div class="stat"><div class="l">Trás esq.</div><div class="v">${last.rl} mm</div></div><div class="stat"><div class="l">Trás dir.</div><div class="v">${last.rr} mm</div></div></div>
   <div class="${minD < 2 ? 'bad' : minD < 3 ? 'warn' : 'ok'}" style="margin-top:8px">${minD < 1.6 ? '⛔ Abaixo do limite legal (1,6 mm)!' : minD < 3 ? '⚠️ Considere trocar em breve (< 3 mm)' : '✅ Piso em bom estado'}</div>` : '<div class="muted">Registe a profundidade do piso com um medidor.</div>'}
   <button class="btn block sm" style="margin-top:10px" onclick="treadForm()">＋ Registar medição / evento</button></div>
  <div class="card"><h3>Registos</h3>${logs.map(l => `<div class="item" onclick="treadForm('${l.id}')"><div class="grow"><div class="t">${esc(l.type || 'Medição')}</div><div class="d">${fmtD(l.date)} · ${km(l.km)} · ${[l.fl, l.fr, l.rl, l.rr].filter(x => x !== '').join(' / ')} mm ${l.note ? '· ' + esc(l.note) : ''}</div></div></div>`).join('') || '<div class="muted">Sem registos</div>'}</div>
  <div class="card"><h3>Dica</h3><div class="small">Verifique as pressões a frio, 1× por mês. Após acertar, inicialize o TPMS (ver Códigos secretos). Rotação a cada 10.000 km.</div></div>`;
};
function tireForm() {
  form('Pneus', [
    { k: 'size', label: 'Medida' }, { k: 'brand', label: 'Marca / modelo' },
    { k: 'pressF', label: 'Pressão frente (bar)', type: 'number' }, { k: 'pressR', label: 'Pressão trás (bar)', type: 'number' },
    { k: 'current', label: 'Jogo montado', type: 'select', options: ['Verão', 'Inverno', 'All-season'] },
    { k: 'mountDate', label: 'Data de montagem', type: 'date' }, { k: 'mountKm', label: 'Km na montagem', type: 'number' },
    { k: 'dot', label: 'Código DOT (semana/ano, ex.: 2324)' }, { k: 'storage', label: 'Local onde está o outro jogo' }
  ], S.tires, o => { Object.assign(S.tires, o); });
}
function treadForm(id) {
  const l = id ? S.tires.logs.find(x => x.id === id) : null;
  form('Pneus – registo', [
    { k: 'type', label: 'Tipo', type: 'select', options: ['Medição', 'Rotação', 'Troca de pneus', 'Troca verão/inverno', 'Furo / reparação', 'Calibragem pressões'] },
    { k: 'date', label: 'Data', type: 'date', def: today() }, { k: 'km', label: 'Km', type: 'number', def: curKm() },
    { k: 'fl', label: 'Frente esq. (mm)', type: 'number' }, { k: 'fr', label: 'Frente dir. (mm)', type: 'number' },
    { k: 'rl', label: 'Trás esq. (mm)', type: 'number' }, { k: 'rr', label: 'Trás dir. (mm)', type: 'number' },
    { k: 'note', label: 'Nota' }
  ], l || {}, o => {
    if (l) Object.assign(l, o); else S.tires.logs.push({ id: uid(), ...o });
    if (!l && o.type === 'Rotação') { const it = S.items.find(i => i.id === 'rotation'); if (it) S.services.push({ id: uid(), date: o.date, km: o.km, items: ['rotation'], title: 'Rotação dos pneus', cost: '' }); }
  }, l ? () => { S.tires.logs = S.tires.logs.filter(x => x !== l); } : null);
}

/* ---- Códigos secretos ---- */
PAGES.secret = () => `<div class="warnbox" style="margin-bottom:12px">⚠️ Procedimentos recolhidos do manual e da comunidade Mazda. Podem variar com o ano/versão do software. Use por sua conta e risco – faça-os com o carro parado.</div>` +
  SECRET_CODES.map(g => `<div class="card"><h3>${esc(g.group)}</h3>${g.items.map(i => `<details><summary>${esc(i.title)}</summary><div><div class="small muted">COMO</div><div class="code">${esc(i.how)}</div><div class="small muted">PARA QUE SERVE</div><div>${esc(i.what)}</div>${i.warn ? `<div class="warnbox">${esc(i.warn)}</div>` : ''}</div></details>`).join('')}</div>`).join('');

/* ---- Luzes ---- */
let lightF = 'all';
PAGES.lights = () => `<div class="seg">${[['all', 'Todas'], ['red', '🔴 Vermelhas'], ['amber', '🟠 Âmbar'], ['green', '🟢 Verdes']].map(([k, l]) => `<button class="${lightF === k ? 'on' : ''}" onclick="lightF='${k}';render()">${l}</button>`).join('')}</div>
 <div class="card">${WARNING_LIGHTS.filter(l => lightF === 'all' || l.color === lightF).map(l => `<details style="border:0;padding:0;margin:0;border-bottom:1px solid var(--line);border-radius:0"><summary><span class="light-chip">${l.icon}</span> <span class="${{ red: 'bad', amber: 'warn', green: 'ok' }[l.color]}">●</span> ${esc(l.name)}</summary><div><div>${esc(l.meaning)}</div><div class="code">👉 ${esc(l.action)}</div></div></details>`).join('')}</div>
 <div class="small muted">🔴 Vermelho: parar em segurança · 🟠 Âmbar: verificar brevemente · 🟢 Verde: informação</div>`;

/* ---- DTC ---- */
let dtcQ = '';
PAGES.dtc = () => {
  const q = dtcQ.toLowerCase(), list = DTC_CODES.filter(d => !q || d.join(' ').toLowerCase().includes(q));
  return `<input class="s" id="dtcQ" placeholder="🔍 Código (ex.: P0420) ou palavra" value="${esc(dtcQ)}" oninput="dtcQ=this.value;document.getElementById('dtcList').innerHTML=dtcList()" style="margin-bottom:10px">
  <div class="card" id="dtcList">${dtcList()}</div>
  <div class="card small"><h3>Como ler os códigos</h3>Use um leitor OBD-II Bluetooth (ELM327/OBDLink) e uma app (FORScan Lite, Car Scanner, Torque). Ficha OBD por baixo do volante. Primeira letra: <b>P</b> motor/caixa, <b>C</b> chassis, <b>B</b> carroçaria, <b>U</b> rede de comunicação.</div>`;
};
function dtcList() {
  const q = dtcQ.toLowerCase(), list = DTC_CODES.filter(d => !q || d.join(' ').toLowerCase().includes(q));
  return list.map(([c, d, x]) => `<div class="item"><b style="width:62px;flex:none" class="warn">${c}</b><div class="grow"><div>${esc(d)}</div><div class="d">Causas: ${esc(x)}</div></div></div>`).join('') || `<div class="muted">Código não encontrado na lista local.</div><button class="btn sec sm" style="margin-top:8px" onclick="NATIVE.open('https://www.google.com/search?q='+encodeURIComponent('Mazda CX-5 '+dtcQ))">Pesquisar na internet</button>`;
}
AFTER.dtc = () => {};

/* ---- Especificações ---- */
PAGES.specs = () => `<div class="warnbox" style="margin-bottom:12px">Valores de referência. Confirme no manual do proprietário e na etiqueta do pilar da porta.</div>` +
  SPECS.map(g => `<div class="card"><h3>${esc(g.group)}</h3><table>${g.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table></div>`).join('') +
  `<div class="card"><h3>O meu carro</h3><table><tr><td>Motor</td><td>${esc(ENGINES[S.car.engine])}</td></tr><tr><td>Caixa</td><td>${S.car.trans === 'auto' ? 'Automática' : 'Manual'}${S.car.awd ? ' · AWD' : ' · 2WD'}</td></tr><tr><td>VIN</td><td>${esc(S.car.vin) || '—'}</td></tr><tr><td>Pneus</td><td>${esc(S.tires.size)}</td></tr></table></div>`;

/* ---- Peças ---- */
PAGES.parts = () => `<div class="card"><h3>As minhas peças e referências</h3>${S.parts.map(p => `<div class="item" onclick="partForm('${p.id}')"><div class="grow"><div class="t">${esc(p.name)}</div><div class="d">${esc(p.ref)}${p.brand ? ' · ' + esc(p.brand) : ''}${p.price ? ' · ' + money(p.price) : ''}${p.where ? ' · ' + esc(p.where) : ''}</div></div></div>`).join('') || '<div class="muted small">Guarde aqui as referências das peças que usa (filtros, escovas, pastilhas, lâmpadas…) para comprar mais facilmente.</div>'}</div>
  <button class="fab" onclick="partForm()">＋</button>`;
function partForm(id) {
  const p = id ? S.parts.find(x => x.id === id) : null;
  form('Peça', [{ k: 'name', label: 'Peça', req: true, ph: 'Filtro de óleo' }, { k: 'ref', label: 'Referência', ph: 'PE01-14-302B' }, { k: 'brand', label: 'Marca' }, { k: 'price', label: 'Preço', type: 'number' }, { k: 'where', label: 'Onde comprar' }, { k: 'notes', label: 'Notas', type: 'textarea' }], p || {},
    o => { if (p) Object.assign(p, o); else S.parts.push({ id: uid(), ...o }); }, p ? () => { S.parts = S.parts.filter(x => x !== p); } : null);
}

/* ---- Checklists ---- */
PAGES.checklists = () => Object.entries(CHECKLISTS).map(([name, items]) => {
  const st = S.checks[name] || {}, done = items.filter((_, i) => st[i]).length;
  return `<details><summary>${esc(name)} <span class="small muted">(${done}/${items.length})</span></summary><div>${items.map((t, i) => `<label class="chk"><input type="checkbox" ${st[i] ? 'checked' : ''} onchange="toggleCheck('${name}',${i},this.checked)"> ${esc(t)}</label>`).join('')}<button class="btn sec sm" onclick="S.checks['${name}']={};save();render()">Limpar</button></div></details>`;
}).join('');
function toggleCheck(n, i, v) { S.checks[n] = S.checks[n] || {}; S.checks[n][i] = v; save(); }

/* ---- Dicas ---- */
PAGES.tips = () => `<div class="card">${TIPS.map(t => `<div class="item"><span>💡</span><div class="grow">${esc(t)}</div></div>`).join('')}</div>`;

/* ---- Contactos ---- */
PAGES.contacts = () => `<div class="card">${S.contacts.map(c => `<div class="item"><div class="grow" onclick="contactForm('${c.id}')"><div class="t">${esc(c.name)}</div><div class="d">${esc(c.type)}${c.phone ? ' · ' + esc(c.phone) : ''}${c.address ? ' · ' + esc(c.address) : ''}</div></div>${c.phone ? `<button class="btn sm" onclick="NATIVE.open('tel:${esc(c.phone.replace(/\s/g, ''))}')">📞</button>` : ''}${c.address ? `<button class="btn sm sec" onclick="NATIVE.open('geo:0,0?q='+encodeURIComponent('${esc(c.address).replace(/'/g, '')}'))">🗺️</button>` : ''}</div>`).join('') || '<div class="muted small">Adicione a sua oficina, o concessionário Mazda e a assistência em viagem do seguro.</div>'}</div>
  <div class="card"><h3>Úteis</h3><button class="btn sec block" style="margin-bottom:8px" onclick="NATIVE.open('tel:112')">🚨 Emergência 112</button><button class="btn sec block" onclick="NATIVE.open('geo:0,0?q='+encodeURIComponent('Mazda concessionário'))">🗺️ Concessionários Mazda próximos</button></div>
  <button class="fab" onclick="contactForm()">＋</button>`;
function contactForm(id) {
  const c = id ? S.contacts.find(x => x.id === id) : null;
  form('Contacto', [{ k: 'name', label: 'Nome', req: true }, { k: 'type', label: 'Tipo', type: 'select', options: ['Oficina', 'Concessionário Mazda', 'Seguro / assistência', 'Pneus', 'Lavagem', 'Outro'] }, { k: 'phone', label: 'Telefone', type: 'tel' }, { k: 'address', label: 'Morada' }, { k: 'notes', label: 'Notas', type: 'textarea' }], c || {},
    o => { if (c) Object.assign(c, o); else S.contacts.push({ id: uid(), ...o }); }, c ? () => { S.contacts = S.contacts.filter(x => x !== c); } : null);
}

/* ---- Calculadoras ---- */
PAGES.calc = () => {
  const fc = fuelCalc(), lastP = S.fuel.length ? [...S.fuel].sort((a, b) => b.date.localeCompare(a.date))[0].price : 1.75;
  return `<div class="card"><h3>Custo de uma viagem</h3>
   <label class="f">Distância (km)<input id="c1d" type="number" value="300" oninput="calc1()"></label>
   <label class="f">Consumo (L/100 km)<input id="c1c" type="number" value="${fc.avg ? fc.avg.toFixed(1) : 7}" oninput="calc1()"></label>
   <label class="f">Preço / L<input id="c1p" type="number" value="${lastP}" oninput="calc1()"></label>
   <label class="f">Portagens<input id="c1t" type="number" value="0" oninput="calc1()"></label>
   <label class="f">Pessoas<input id="c1n" type="number" value="1" oninput="calc1()"></label>
   <div class="code" id="c1r"></div></div>
  <div class="card"><h3>Consumo de um depósito</h3>
   <label class="f">Km percorridos<input id="c2k" type="number" oninput="calc2()"></label>
   <label class="f">Litros abastecidos<input id="c2l" type="number" oninput="calc2()"></label><div class="code" id="c2r">—</div></div>
  <div class="card"><h3>Autonomia</h3><label class="f">Litros no depósito<input id="c3l" type="number" value="${S.car.awd ? 58 : 56}" oninput="calc3()"></label><div class="code" id="c3r"></div></div>
  <div class="card"><h3>Conversões</h3>
   <label class="f">bar<input id="cvb" type="number" value="2.5" oninput="conv('b')"></label><label class="f">psi<input id="cvp" type="number" oninput="conv('p')"></label><label class="f">kPa<input id="cvk" type="number" oninput="conv('k')"></label>
   <label class="f">L/100 km<input id="cvl" type="number" value="7" oninput="conv('l')"></label><label class="f">km/L<input id="cvkl" type="number" oninput="conv('kl')"></label><label class="f">MPG (UK)<input id="cvm" type="number" oninput="conv('m')"></label></div>`;
};
AFTER.calc = () => { calc1(); calc3(); conv('b'); conv('l'); };
const v = id => parseFloat(($('#' + id).value || '0').replace(',', '.')) || 0;
function calc1() { const l = v('c1d') * v('c1c') / 100, c = l * v('c1p') + v('c1t'); $('#c1r').innerHTML = `${num(l, 1)} L · <b>${money(c)}</b>${v('c1n') > 1 ? ' · ' + money(c / v('c1n')) + ' por pessoa' : ''}<br>Ida e volta: ${money(c * 2)}`; }
function calc2() { const k = v('c2k'), l = v('c2l'); $('#c2r').textContent = k && l ? num(l / k * 100, 2) + ' L/100 km · ' + num(k / l, 2) + ' km/L' : '—'; }
function calc3() { const fc = fuelCalc().avg || 7; $('#c3r').textContent = '≈ ' + num(v('c3l') / fc * 100) + ' km com ' + num(fc, 1) + ' L/100 km'; }
function conv(w) {
  if (w === 'b') { $('#cvp').value = (v('cvb') * 14.5038).toFixed(1); $('#cvk').value = (v('cvb') * 100).toFixed(0); }
  if (w === 'p') { $('#cvb').value = (v('cvp') / 14.5038).toFixed(2); $('#cvk').value = (v('cvp') * 6.89476).toFixed(0); }
  if (w === 'k') { $('#cvb').value = (v('cvk') / 100).toFixed(2); $('#cvp').value = (v('cvk') / 6.89476).toFixed(1); }
  if (w === 'l' && v('cvl')) { $('#cvkl').value = (100 / v('cvl')).toFixed(2); $('#cvm').value = (282.481 / v('cvl')).toFixed(1); }
  if (w === 'kl' && v('cvkl')) { $('#cvl').value = (100 / v('cvkl')).toFixed(2); $('#cvm').value = (282.481 / (100 / v('cvkl'))).toFixed(1); }
  if (w === 'm' && v('cvm')) { $('#cvl').value = (282.481 / v('cvm')).toFixed(2); $('#cvkl').value = (100 / (282.481 / v('cvm'))).toFixed(2); }
}

/* ---- Registo de km ---- */
PAGES.kmlog = () => {
  const r = [...S.kmLog].sort((a, b) => b.date.localeCompare(a.date));
  return `<div class="grid2" style="margin-bottom:12px"><div class="stat"><div class="v">${num(kmPerDay(), 1)}</div><div class="l">km / dia (média)</div></div><div class="stat"><div class="v">${num(estKm())}</div><div class="l">Estimativa hoje</div></div></div>
  <div class="card small muted">A quilometragem também é obtida automaticamente dos abastecimentos, serviços e despesas.</div>
  <div class="card">${r.map(x => `<div class="item" onclick="kmEdit('${x.id}')"><div class="grow"><div class="t">${km(x.km)}</div><div class="d">${fmtD(x.date)}</div></div></div>`).join('') || '<div class="muted">Sem leituras manuais.</div>'}</div>
  <button class="fab" onclick="quickKm()">＋</button>`;
};
function kmEdit(id) { const x = S.kmLog.find(k => k.id === id); form('Leitura', [{ k: 'km', label: 'Km', type: 'number', req: true }, { k: 'date', label: 'Data', type: 'date' }], x, o => Object.assign(x, o), () => { S.kmLog = S.kmLog.filter(k => k !== x); }); }

/* ---- Relatório ---- */
function reportText() {
  const c = S.car, L = [];
  L.push(`MAZDA CX-5 – HISTÓRICO DE MANUTENÇÃO`, `${c.name}${c.plate ? ' · ' + c.plate : ''}${c.year ? ' · ' + c.year : ''}`, `Motor: ${ENGINES[c.engine]} · ${c.trans === 'auto' ? 'Automática' : 'Manual'}${c.awd ? ' · AWD' : ''}`, c.vin ? 'VIN: ' + c.vin : '', `Quilometragem: ${km(curKm())} (${fmtD(lastReading().date)})`, '', 'SERVIÇOS:');
  [...S.services].sort((a, b) => a.date.localeCompare(b.date)).forEach(s => {
    const n = (s.items || []).map(id => (S.items.find(i => i.id === id) || {}).name).filter(Boolean).join(', ');
    L.push(`• ${fmtD(s.date)} – ${km(s.km)} – ${s.title || ''}${n ? ' [' + n + ']' : ''}${s.workshop ? ' – ' + s.workshop : ''}${s.cost !== '' && s.cost != null ? ' – ' + money(s.cost) : ''}`);
  });
  L.push('', 'ESTADO DO PLANO:');
  activeItems().forEach(it => { const s = itemStatus(it); L.push(`• ${it.name}: ${s.ld ? 'última ' + fmtD(s.ld.date) + (s.ld.km != null ? ' / ' + km(s.ld.km) : '') : 'sem registo'} – ${s.txt}`); });
  const fc = fuelCalc(); if (fc.avg) L.push('', `Consumo médio registado: ${num(fc.avg, 2)} L/100 km`);
  L.push('', 'Gerado pela app CX-5 Manutenção em ' + fmtD(today()));
  return L.filter(x => x !== null).join('\n');
}
PAGES.report = () => `<div class="card"><pre style="white-space:pre-wrap;font-size:12px;margin:0">${esc(reportText())}</pre></div>
 <div class="actions"><button class="btn sec" onclick="NATIVE.shareText(reportText())">Partilhar</button><button class="btn" onclick="NATIVE.saveFile('CX5_historico_${today()}.txt','text/plain',reportText())">Guardar .txt</button></div>`;

/* ---- Carro ---- */
PAGES.car = () => {
  const c = S.car;
  return `<div class="card"><table><tr><td>Nome</td><td>${esc(c.name)}</td></tr><tr><td>Geração</td><td>${c.gen === 'KE' ? 'KE (2012–2017)' : 'KF (2017+)'}</td></tr><tr><td>Ano</td><td>${esc(c.year) || '—'}</td></tr><tr><td>Motor</td><td>${esc(ENGINES[c.engine])}</td></tr><tr><td>Caixa</td><td>${c.trans === 'auto' ? 'Automática' : 'Manual'}</td></tr><tr><td>Tração</td><td>${c.awd ? 'AWD' : '2WD'}</td></tr><tr><td>Matrícula</td><td>${esc(c.plate) || '—'}</td></tr><tr><td>VIN</td><td>${esc(c.vin) || '—'}</td></tr><tr><td>Cor</td><td>${esc(c.color) || '—'}</td></tr><tr><td>Início do registo</td><td>${fmtD(c.startDate)} · ${km(c.startKm)}</td></tr><tr><td>Preço de compra</td><td>${c.purchasePrice ? money(c.purchasePrice) : '—'}</td></tr></table>
  <button class="btn block" style="margin-top:12px" onclick="carForm()">Editar</button></div>`;
};
function carForm(first) {
  form(first ? 'Configurar o carro' : 'O meu carro', [
    { k: 'name', label: 'Nome', def: 'O meu CX-5' },
    { k: 'gen', label: 'Geração', type: 'select', options: [['KF', 'KF – 2.ª geração (2017+)'], ['KE', 'KE – 1.ª geração (2012–2017)']] },
    { k: 'year', label: 'Ano', type: 'number' },
    { k: 'engine', label: 'Motor', type: 'select', options: Object.entries(ENGINES) },
    { k: 'trans', label: 'Caixa', type: 'select', options: [['manual', 'Manual'], ['auto', 'Automática']] },
    { k: 'awd', label: 'Tração integral AWD', type: 'check' },
    { k: 'plate', label: 'Matrícula' }, { k: 'vin', label: 'VIN (nº de chassis)' }, { k: 'color', label: 'Cor' },
    { k: 'startDate', label: 'Data de início do registo (compra / matrícula)', type: 'date', req: true },
    { k: 'startKm', label: 'Km nessa data', type: 'number', def: 0 },
    { k: 'nowKm', label: 'Km atuais (opcional)', type: 'number' },
    { k: 'purchasePrice', label: 'Preço de compra (opcional)', type: 'number' }
  ], S.car, o => {
    const nowKm = o.nowKm; delete o.nowKm;
    Object.assign(S.car, o);
    if (nowKm !== '' && nowKm != null) S.kmLog.push({ id: uid(), date: today(), km: nowKm });
    if (first) {
      S.setup = true;
      if (!S.reminders.length) DEFAULT_REMINDERS.forEach(r => S.reminders.push({ id: uid(), ...r, date: '', km: '', warnDays: 30 }));
      setTimeout(() => NATIVE.toast('Defina as datas do seguro, IUC e IPO em Lembretes'), 400);
      if (!NATIVE.notificationsAllowed()) NATIVE.requestNotifications();
    }
  });
}

/* ---- Definições ---- */
PAGES.settings = () => {
  const s = S.settings;
  return `<div class="card"><h3>Notificações</h3>
   <label class="chk"><input type="checkbox" ${s.notif ? 'checked' : ''} onchange="S.settings.notif=this.checked;save()"> Ativar notificações</label>
   <label class="f">Hora do aviso diário<select onchange="S.settings.notifyHour=+this.value;save();NATIVE.setNotifyHour(+this.value)">${Array.from({ length: 24 }, (_, i) => `<option value="${i}" ${i === +s.notifyHour ? 'selected' : ''}>${String(i).padStart(2, '0')}:00</option>`).join('')}</select></label>
   <label class="f">Avisar com antecedência (dias)<input type="number" value="${s.warnDays}" onchange="S.settings.warnDays=+this.value;save()"></label>
   <label class="f">Avisar com antecedência (km)<input type="number" value="${s.warnKm}" onchange="S.settings.warnKm=+this.value;save()"></label>
   <label class="f">Pedir atualização de km a cada (dias, 0 = nunca)<input type="number" value="${s.kmRemindDays}" onchange="S.settings.kmRemindDays=+this.value;save()"></label>
   <div class="row"><button class="btn sec grow" onclick="testNotif()">Testar</button><button class="btn sec grow" onclick="save();const n=NATIVE.checkNow();NATIVE.toast(n+' aviso(s) enviados')">Verificar agora</button></div>
   ${NATIVE.notificationsAllowed() ? '' : '<button class="btn block" style="margin-top:8px" onclick="NATIVE.requestNotifications()">Permitir notificações</button>'}</div>
  <div class="card"><h3>Aparência e unidades</h3>
   <label class="chk"><input type="checkbox" ${s.light ? 'checked' : ''} onchange="S.settings.light=this.checked;save();render()"> Tema claro</label>
   <label class="f">Moeda<input value="${esc(s.currency)}" onchange="S.settings.currency=this.value;save()"></label></div>
  <div class="card"><h3>Dados e cópias de segurança</h3>
   <button class="btn block" style="margin-bottom:8px" onclick="NATIVE.saveFile('CX5_backup_${today()}.json','application/json',JSON.stringify(S))">💾 Exportar backup (JSON)</button>
   <label class="btn sec block" style="display:block;text-align:center;margin-bottom:8px">📂 Importar backup<input type="file" accept=".json,application/json,text/*" style="display:none" onchange="importBackup(this)"></label>
   <button class="btn sec block" style="margin-bottom:8px" onclick="exportCSV()">📊 Exportar CSV (Excel)</button>
   <button class="btn sec block" style="margin-bottom:8px" onclick="resetPlan()">↺ Repor plano de manutenção original</button>
   <button class="btn danger block" onclick="wipe()">🗑️ Apagar todos os dados</button>
   <div class="small muted" style="margin-top:8px">Armazenamento usado: ${num(JSON.stringify(S).length / 1024)} KB</div></div>
  <div class="card small muted">CX-5 Manutenção v1.0 · dados guardados apenas no telemóvel. Intervalos de manutenção indicativos – siga sempre o livro de manutenção do seu veículo.</div>`;
};
function testNotif() { if (!NATIVE.notificationsAllowed()) { NATIVE.requestNotifications(); return; } NATIVE.notify('🔧 Teste CX-5', 'As notificações estão a funcionar!'); }
function importBackup(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { const d = JSON.parse(r.result); if (!d.car || !d.items) throw 0; if (!confirm('Substituir todos os dados atuais pelo backup?')) return; S = d; load2(); save(); render(); NATIVE.toast('Backup importado'); } catch (e) { alert('Ficheiro inválido'); } };
  r.readAsText(f);
}
function load2() { localStorage.setItem(KEY, JSON.stringify(S)); load(); }
function exportCSV() {
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const L = ['Tipo;Data;Km;Descrição;Categoria;Litros;Preço/L;Valor;Oficina/Posto;Notas'];
  S.services.forEach(s => L.push(['Serviço', s.date, s.km, s.title || (s.items || []).map(id => (S.items.find(i => i.id === id) || {}).name).join(' + '), 'Manutenção', '', '', s.cost, s.workshop, s.notes].map(q).join(';')));
  S.fuel.forEach(f => L.push(['Combustível', f.date, f.km, f.fuelType, 'Combustível', f.liters, f.price, f.total, f.station, f.notes].map(q).join(';')));
  S.expenses.forEach(e => L.push(['Despesa', e.date, e.km, e.desc, e.cat, '', '', e.amount, '', ''].map(q).join(';')));
  NATIVE.saveFile('CX5_registos_' + today() + '.csv', 'text/csv', '﻿' + L.join('\n'));
}
function resetPlan() { if (!confirm('Repor intervalos originais? (o histórico mantém-se)')) return; const custom = S.items.filter(i => !DEFAULT_PLAN.find(p => p.id === i.id)); S.items = DEFAULT_PLAN.map(p => { const o = S.items.find(i => i.id === p.id) || {}; return { ...p, enabled: true, initKm: o.initKm, initDate: o.initDate }; }).concat(custom); save(); render(); }
function wipe() { if (!confirm('Apagar TODOS os dados? Esta ação é irreversível.')) return; if (!confirm('Tem a certeza absoluta?')) return; localStorage.removeItem(KEY); load(); save(); go('home'); }

/* ===================== Arranque ===================== */
load();
save();
render();
