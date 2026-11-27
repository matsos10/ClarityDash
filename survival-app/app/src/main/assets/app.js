/* Sobrevivência – lógica da aplicação (100% offline) */
(function () {
'use strict';
const A = window.Android || null;
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('sv_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sv_' + k, JSON.stringify(v)); } catch (e) { } }
};
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const vib = ms => { if (A) A.vibrate(ms); else if (navigator.vibrate) navigator.vibrate(ms); };
const torch = on => { if (A) A.torch(!!on); };
const hasTorch = () => A ? A.hasTorch() : false;
const keepOn = on => { if (A) A.keepScreenOn(!!on); };

/* ---------- Áudio ---------- */
let actx = null;
function ac() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; }
function tone(freq, ms, type = 'sine', vol = 0.6) {
  const c = ac(), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + ms / 1000);
}
let contTone = null;
function toneOn(freq, type = 'square', vol = 1) {
  toneOff(); const c = ac(), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol; o.connect(g); g.connect(c.destination); o.start(); contTone = { o, g };
}
function toneOff() { if (contTone) { try { contTone.o.stop(); } catch (e) { } contTone = null; } }

/* ---------- Sensores ---------- */
const sensorSubs = new Set(); let sensorRunning = false; let lastPressure = -1;
window.onSensor = function (az, pitch, roll, pres) {
  if (pres > 0) { lastPressure = pres; autoLogPressure(pres); }
  sensorSubs.forEach(f => f({ az, pitch, roll, pres }));
};
function browserOrient(e) {
  let az = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.alpha != null ? (360 - e.alpha) % 360 : 0);
  window.onSensor(az, -(e.beta || 0), e.gamma || 0, -1);
}
function subSensors(f) {
  sensorSubs.add(f);
  if (!sensorRunning) { sensorRunning = true; if (A) A.startSensors(); else { window.addEventListener('deviceorientationabsolute', browserOrient); window.addEventListener('deviceorientation', browserOrient); } }
  return () => { sensorSubs.delete(f); if (!sensorSubs.size) { sensorRunning = false; if (A) A.stopSensors(); else { window.removeEventListener('deviceorientationabsolute', browserOrient); window.removeEventListener('deviceorientation', browserOrient); } } };
}
function autoLogPressure(p) {
  const log = store.get('pres', []); const now = Date.now();
  if (!log.length || now - log[log.length - 1].t > 15 * 60000) { log.push({ t: now, p: +p.toFixed(1) }); while (log.length > 300) log.shift(); store.set('pres', log); }
}

/* ---------- GPS ---------- */
const gpsSubs = new Set(); let gpsRunning = false, geoWatch = null; let lastFix = store.get('lastfix', null);
window.onGps = function (lat, lon, alt, acc, spd, t) {
  lastFix = { lat, lon, alt: alt === -9999 ? null : alt, acc, spd, t: t || Date.now() }; store.set('lastfix', lastFix);
  gpsSubs.forEach(f => f(lastFix));
};
window.onGpsError = function (m) { toast(m); gpsSubs.forEach(f => f(null, m)); };
function subGps(f) {
  gpsSubs.add(f);
  if (!gpsRunning) {
    gpsRunning = true;
    if (A) A.startGps();
    else if (navigator.geolocation) geoWatch = navigator.geolocation.watchPosition(p => window.onGps(p.coords.latitude, p.coords.longitude, p.coords.altitude == null ? -9999 : p.coords.altitude, p.coords.accuracy, p.coords.speed || 0, p.timestamp), e => window.onGpsError(e.message), { enableHighAccuracy: true });
  }
  return () => { gpsSubs.delete(f); if (!gpsSubs.size) { gpsRunning = false; if (A) A.stopGps(); else if (geoWatch != null) navigator.geolocation.clearWatch(geoWatch); } };
}

/* ---------- Geo utilitários ---------- */
const R = 6371000, rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
function dist(a, b) { const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon); const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function bearing(a, b) { const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat)); const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon)); return (deg(Math.atan2(y, x)) + 360) % 360; }
const fmtDist = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(m < 10000 ? 2 : 1) + ' km';
const cardinal = d => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'][Math.round(d / 22.5) % 16];
function dms(v, pos, neg) { const s = v < 0 ? neg : pos; v = Math.abs(v); const d = Math.floor(v), mf = (v - d) * 60, m = Math.floor(mf), sec = ((mf - m) * 60).toFixed(1); return `${d}°${String(m).padStart(2, '0')}'${String(sec).padStart(4, '0')}"${s}`; }
function toUTM(lat, lon) {
  const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2);
  let zone = Math.floor((lon + 180) / 6) + 1;
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
  if (lat >= 72 && lat < 84) { if (lon >= 0 && lon < 9) zone = 31; else if (lon >= 9 && lon < 21) zone = 33; else if (lon >= 21 && lon < 33) zone = 35; else if (lon >= 33 && lon < 42) zone = 37; }
  const lon0 = rad((zone - 1) * 6 - 180 + 3), φ = rad(lat), λ = rad(lon);
  const N = a / Math.sqrt(1 - e2 * Math.sin(φ) ** 2), T = Math.tan(φ) ** 2, C = ep2 * Math.cos(φ) ** 2, Aa = Math.cos(φ) * (λ - lon0);
  const M = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * φ - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * φ) + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * φ) - (35 * e2 ** 3 / 3072) * Math.sin(6 * φ));
  const E = k0 * N * (Aa + (1 - T + C) * Aa ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * Aa ** 5 / 120) + 500000;
  let Nn = k0 * (M + N * Math.tan(φ) * (Aa * Aa / 2 + (5 - T + 9 * C + 4 * C * C) * Aa ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * Aa ** 6 / 720));
  if (lat < 0) Nn += 10000000;
  const band = 'CDEFGHJKLMNPQRSTUVWXX'[Math.floor((lat + 80) / 8)] || '';
  return `${zone}${band} ${Math.round(E)} E ${Math.round(Nn)} N`;
}
function coordBlock(f) {
  if (!f) return '<p class="muted">Sem posição.</p>';
  return `<table class="tbl"><tr><th>Decimal</th><td>${f.lat.toFixed(6)}, ${f.lon.toFixed(6)}</td></tr>
  <tr><th>GMS</th><td>${dms(f.lat, 'N', 'S')} ${dms(f.lon, 'E', 'O')}</td></tr>
  <tr><th>UTM</th><td>${toUTM(f.lat, f.lon)}</td></tr>
  <tr><th>Altitude</th><td>${f.alt != null ? Math.round(f.alt) + ' m' : '—'}</td></tr>
  <tr><th>Precisão</th><td>± ${Math.round(f.acc)} m</td></tr>
  <tr><th>Velocidade</th><td>${(f.spd * 3.6).toFixed(1)} km/h</td></tr>
  <tr><th>Hora</th><td>${new Date(f.t).toLocaleTimeString('pt-PT')}</td></tr></table>`;
}

/* ---------- Sol & Lua ---------- */
function sunTimes(date, lat, lon, zenith = 90.833) {
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 864e5);
  const lngHour = lon / 15;
  function calc(rise) {
    const t = day + ((rise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(rad(M)) + 0.020 * Math.sin(rad(2 * M)) + 282.634; L = (L + 360) % 360;
    let RA = deg(Math.atan(0.91764 * Math.tan(rad(L)))); RA = (RA + 360) % 360;
    RA = (RA + Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;
    const sinDec = 0.39782 * Math.sin(rad(L)), cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(rad(zenith)) - sinDec * Math.sin(rad(lat))) / (cosDec * Math.cos(rad(lat)));
    if (cosH > 1) return 'never'; if (cosH < -1) return 'always';
    let H = rise ? 360 - deg(Math.acos(cosH)) : deg(Math.acos(cosH)); H /= 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = (T - lngHour) % 24; if (UT < 0) UT += 24;
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); d.setUTCMinutes(Math.round(UT * 60));
    return d;
  }
  return { rise: calc(true), set: calc(false) };
}
function moon(date) {
  const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
  const age = (((date - ref) / 864e5) % syn + syn) % syn;
  const illum = Math.round((1 - Math.cos(2 * Math.PI * age / syn)) / 2 * 100);
  const names = ['🌑 Lua nova', '🌒 Crescente', '🌓 Quarto crescente', '🌔 Crescente gibosa', '🌕 Lua cheia', '🌖 Minguante gibosa', '🌗 Quarto minguante', '🌘 Minguante'];
  return { age: age.toFixed(1), illum, name: names[Math.floor((age / syn) * 8 + 0.5) % 8], next: new Date(+date + (syn / 2 - age + (age > syn / 2 ? syn : 0)) * 864e5), nextNew: new Date(+date + (syn - age) * 864e5) };
}
const hm = d => d instanceof Date ? d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : (d === 'never' ? 'não nasce' : 'não se põe');

/* ---------- Morse ---------- */
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.', '-': '-....-', '(': '-.--.', ')': '-.--.-', ':': '---...', '=': '-...-', '+': '.-.-.' };
const RMORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const toMorse = s => norm(s.toUpperCase()).split(/\s+/).filter(Boolean).map(w => w.split('').map(c => MORSE[c] || '').filter(Boolean).join(' ')).join(' / ');
const fromMorse = s => s.trim().split(/\s*\/\s*|\s{3,}/).map(w => w.split(/\s+/).map(c => RMORSE[c] || (c ? '?' : '')).join('')).join(' ');
let signalToken = 0;
async function playMorse(code, o, unit = 220) {
  const my = ++signalToken; const alive = () => my === signalToken;
  const on = ms => { if (o.torch) torch(true); if (o.screen) overlay(true); if (o.sound) toneOn(700, 'sine', .7); if (o.vibrate) vib(ms); };
  const off = () => { if (o.torch) torch(false); if (o.screen) overlay(false); if (o.sound) toneOff(); };
  do {
    for (const ch of code) {
      if (!alive()) { off(); return; }
      if (ch === '.') { on(unit); await sleep(unit); off(); await sleep(unit); }
      else if (ch === '-') { on(unit * 3); await sleep(unit * 3); off(); await sleep(unit); }
      else if (ch === ' ') await sleep(unit * 2);
      else if (ch === '/') await sleep(unit * 4);
    }
    if (o.loop) await sleep(unit * 7);
  } while (o.loop && alive());
  off();
}
function stopSignals() { signalToken++; torch(false); toneOff(); overlay(false); }
function overlay(on, color = '#fff') { const o = $('#lightOverlay'); o.style.background = color; o.style.display = on ? 'block' : 'none'; }
$('#lightOverlay').addEventListener('click', () => { stopSignals(); if (A) A.brightness(-1); });

/* ---------- Router ---------- */
let cleanup = null;
const routes = {};
function nav(h) { location.hash = '#/' + h; }
window.goBack = function () { const h = location.hash.replace(/^#\/?/, ''); if (!h) return false; history.back(); return true; };
function setTitle(t, home) { $('#title').textContent = t; $('#back').style.visibility = home ? 'hidden' : 'visible'; }
function render() {
  if (cleanup) { try { cleanup(); } catch (e) { } cleanup = null; }
  stopSignals(); keepOn(false);
  const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const fn = routes[parts[0] || ''] || routes[''];
  window.scrollTo(0, 0);
  const c = fn(...parts.slice(1)); if (typeof c === 'function') cleanup = c;
}
window.addEventListener('hashchange', render);
$('#back').onclick = () => history.back();
$('#nightBtn').onclick = () => { document.body.classList.toggle('night'); store.set('night', document.body.classList.contains('night')); };
if (store.get('night', false)) document.body.classList.add('night');

/* ---------- Início ---------- */
const MODULES = [
  ['guia', '📖', 'Guia'], ['luz', '🔦', 'Lanterna & SOS'], ['bussola', '🧭', 'Bússola'],
  ['gps', '📍', 'GPS & Pontos'], ['apito', '📢', 'Apito'], ['morse', '📡', 'Morse'],
  ['rcp', '❤️', 'Metrónomo RCP'], ['checklists', '✅', 'Checklists'], ['inventario', '📦', 'Inventário'],
  ['calc', '🧮', 'Calculadoras'], ['sol', '🌅', 'Sol & Lua'], ['barometro', '🌡️', 'Barómetro'],
  ['ficha', '🩺', 'Ficha Médica'], ['contactos', '☎️', 'Contactos'], ['diario', '📝', 'Diário'],
  ['nivel', '📐', 'Nível'], ['pesquisa', '🔍', 'Pesquisar'], ['dados', '💾', 'Cópia de segurança']
];
routes[''] = () => {
  setTitle('Sobrevivência', true);
  const ice = store.get('ficha', {});
  view.innerHTML = `
  <a class="btn danger block" href="tel:112" style="font-size:20px;min-height:60px">📞 LIGAR 112</a>
  <div class="row" style="margin:6px 0 14px"><button class="btn" id="qsos">🆘 SOS luz</button><button class="btn" id="qpos">📍 A minha posição</button></div>
  <div class="grid">${MODULES.map(m => `<a class="tile" href="#/${m[0]}"><span class="ic">${m[1]}</span>${m[2]}</a>`).join('')}</div>
  ${ice.nome ? `<div class="card"><b>🩺 ${esc(ice.nome)}</b> · Sangue: ${esc(ice.sangue || '—')}<br><span class="muted">Alergias: ${esc(ice.alergias || '—')}</span></div>` : ''}
  <p class="muted" style="text-align:center;margin-top:18px">Funciona 100% sem internet. Informação de referência – não substitui formação nem os serviços de emergência.</p>`;
  $('#qsos').onclick = () => nav('luz/sos');
  $('#qpos').onclick = () => nav('gps');
};

/* ---------- Guia ---------- */
routes.guia = () => {
  setTitle('Guia de Sobrevivência');
  view.innerHTML = `<input class="search" id="gs" placeholder="🔍 Pesquisar no guia…"><div class="list">${GUIDE.map(c => `<a class="item" href="#/cat/${c.id}"><span class="ic">${c.ic}</span><span class="t">${c.t}<small>${c.a.length} artigos</small></span>›</a>`).join('')}</div>`;
  $('#gs').addEventListener('keydown', e => { if (e.key === 'Enter') nav('pesquisa/' + encodeURIComponent(e.target.value)); });
};
routes.cat = id => {
  const c = GUIDE.find(x => x.id === id); if (!c) return nav('guia');
  setTitle(c.ic + ' ' + c.t);
  view.innerHTML = `<div class="list">${c.a.map(a => `<a class="item" href="#/art/${c.id}/${a.id}"><span class="t">${a.t}</span>›</a>`).join('')}</div>`;
};
routes.art = (cid, aid, q) => {
  const c = GUIDE.find(x => x.id === cid); const a = c && c.a.find(x => x.id === aid); if (!a) return nav('guia');
  setTitle(a.t);
  const i = c.a.indexOf(a), prev = c.a[i - 1], next = c.a[i + 1];
  const fav = store.get('favs', []); const isFav = fav.includes(cid + '/' + aid);
  let html = a.h;
  if (q) { const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); html = html.replace(/>([^<]+)</g, (m, t) => '>' + t.replace(re, '<mark class="hl">$1</mark>') + '<'); }
  view.innerHTML = `<div class="muted">${c.ic} ${c.t}</div><h2 style="margin-top:4px">${a.t}</h2><div class="article">${html}</div>
  <div class="row" style="margin-top:16px"><button class="btn" id="fav">${isFav ? '★ Favorito' : '☆ Favorito'}</button></div>
  <div class="row" style="margin-top:8px">${prev ? `<a class="btn" href="#/art/${cid}/${prev.id}">‹ ${prev.t}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/art/${cid}/${next.id}">${next.t} ›</a>` : '<span></span>'}</div>`;
  $('#fav').onclick = () => { let f = store.get('favs', []); const k = cid + '/' + aid; f = f.includes(k) ? f.filter(x => x !== k) : f.concat(k); store.set('favs', f); render(); };
};
routes.pesquisa = (q = '') => {
  setTitle('Pesquisar');
  view.innerHTML = `<input class="search" id="q" placeholder="Ex.: água, hipotermia, sismo…" value="${esc(q)}"><div id="res"></div>`;
  const inp = $('#q'), res = $('#res');
  const run = () => {
    const s = norm(inp.value.trim().toLowerCase());
    const favs = store.get('favs', []);
    if (s.length < 2) {
      res.innerHTML = favs.length ? '<h3>★ Favoritos</h3><div class="list">' + favs.map(k => { const [ci, ai] = k.split('/'); const c = GUIDE.find(x => x.id === ci), a = c && c.a.find(x => x.id === ai); return a ? `<a class="item" href="#/art/${ci}/${ai}"><span class="ic">${c.ic}</span><span class="t">${a.t}</span>›</a>` : ''; }).join('') + '</div>' : '<p class="muted">Escreva pelo menos 2 letras.</p>';
      return;
    }
    const out = [];
    GUIDE.forEach(c => c.a.forEach(a => {
      const txt = a.h.replace(/<[^>]+>/g, ' '); const n = norm(txt.toLowerCase()), nt = norm(a.t.toLowerCase());
      const idx = n.indexOf(s);
      if (idx >= 0 || nt.includes(s)) out.push({ c, a, score: nt.includes(s) ? 2 : 1, snip: idx >= 0 ? txt.substr(Math.max(0, idx - 40), 120) : '' });
    }));
    out.sort((x, y) => y.score - x.score);
    res.innerHTML = out.length ? '<div class="list">' + out.map(r => `<a class="item" href="#/art/${r.c.id}/${r.a.id}/${encodeURIComponent(inp.value.trim())}"><span class="ic">${r.c.ic}</span><span class="t">${r.a.t}<small>…${esc(r.snip)}…</small></span></a>`).join('') + '</div>' : '<p class="muted">Sem resultados.</p>';
  };
  inp.oninput = run; run(); inp.focus();
};

/* ---------- Lanterna & SOS ---------- */
routes.luz = (auto) => {
  setTitle('Lanterna & SOS');
  const ht = hasTorch();
  view.innerHTML = `
  ${!ht ? '<div class="warn">Flash não disponível neste dispositivo/modo – use a luz de ecrã.</div>' : ''}
  <div class="card"><h3>🔦 Flash</h3>
   <button class="btn primary block" id="t1" style="min-height:70px;font-size:20px">Ligar / desligar</button>
   <div class="row"><button class="btn" id="tsos">SOS (···–––···)</button><button class="btn" id="tstrobe">Estroboscópio</button></div>
   <label>Velocidade do estroboscópio</label><input type="range" id="spd" min="40" max="800" value="150">
  </div>
  <div class="card"><h3>📱 Luz de ecrã</h3>
   <div class="row"><button class="btn" data-c="#ffffff">Branca</button><button class="btn" data-c="#ff0000">Vermelha</button><button class="btn" data-c="#ffbf00">Âmbar</button></div>
   <div class="row" style="margin-top:8px"><button class="btn" id="ssos">SOS no ecrã</button><button class="btn" id="sstrobe">Ecrã estroboscópio</button></div>
   <p class="muted">Toque no ecrã para desligar. A luz vermelha preserva a visão noturna.</p>
  </div>
  <div class="card"><h3>🆘 SOS completo</h3><p class="muted">Flash + ecrã + som + vibração em repetição.</p><button class="btn danger block" id="allsos">ATIVAR SOS TOTAL</button></div>
  <button class="btn block" id="stop">⏹ Parar tudo</button>`;
  let on = false, strobe = 0;
  const stopAll = () => { on = false; clearInterval(strobe); strobe = 0; stopSignals(); document.querySelectorAll('.btn.on').forEach(b => b.classList.remove('on')); };
  $('#t1').onclick = e => { const was = on; stopAll(); if (!was) { on = true; torch(true); e.target.classList.add('on'); } };
  $('#tsos').onclick = e => { stopAll(); e.target.classList.add('on'); keepOn(true); playMorse('... --- ...', { torch: true, loop: true }); };
  $('#tstrobe').onclick = e => { stopAll(); e.target.classList.add('on'); let s = false; const ms = () => +$('#spd').value; const tick = () => { s = !s; torch(s); strobe = setTimeout(tick, ms()); }; tick(); };
  document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { stopAll(); if (A) A.brightness(1); keepOn(true); overlay(true, b.dataset.c); });
  $('#ssos').onclick = () => { stopAll(); if (A) A.brightness(1); keepOn(true); playMorse('... --- ...', { screen: true, loop: true }); };
  $('#sstrobe').onclick = () => { stopAll(); if (A) A.brightness(1); keepOn(true); let s = false; const tick = () => { s = !s; overlay(s); strobe = setTimeout(tick, +$('#spd').value); }; tick(); };
  $('#allsos').onclick = e => { stopAll(); e.target.classList.add('on'); keepOn(true); playMorse('... --- ...', { torch: true, sound: true, vibrate: true, loop: true }); };
  $('#stop').onclick = stopAll;
  if (auto === 'sos') setTimeout(() => $('#allsos').click(), 100);
  return () => { clearTimeout(strobe); stopSignals(); if (A) A.brightness(-1); };
};

/* ---------- Apito ---------- */
routes.apito = () => {
  setTitle('Apito de emergência');
  view.innerHTML = `<p class="muted">Ponha o volume no máximo. 3 apitos = pedido de socorro internacional.</p>
  <button class="btn primary block" id="hold" style="min-height:120px;font-size:22px">Manter premido para apitar</button>
  <button class="btn danger block" id="sos3">🔁 3 apitos + pausa (repetir)</button>
  <button class="btn block" id="sosm">🔁 SOS sonoro (Morse)</button>
  <button class="btn block" id="siren">🚨 Sirene</button>
  <button class="btn block" id="stop">⏹ Parar</button>
  <label>Frequência: <span id="fv">3150</span> Hz</label><input type="range" id="freq" min="1000" max="4500" value="3150">`;
  const f = () => +$('#freq').value; $('#freq').oninput = () => $('#fv').textContent = f();
  let sirenT = 0;
  const stop = () => { stopSignals(); clearInterval(sirenT); sirenT = 0; };
  const h = $('#hold');
  const down = e => { e.preventDefault(); stop(); toneOn(f(), 'square', 1); vib(60); };
  h.addEventListener('touchstart', down); h.addEventListener('mousedown', down);
  ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(ev => h.addEventListener(ev, () => toneOff()));
  $('#sos3').onclick = async () => {
    stop(); const my = ++signalToken; keepOn(true);
    while (my === signalToken) { for (let i = 0; i < 3 && my === signalToken; i++) { toneOn(f(), 'square', 1); await sleep(1000); toneOff(); await sleep(400); } for (let i = 0; i < 30 && my === signalToken; i++) await sleep(200); }
  };
  $('#sosm').onclick = () => { stop(); keepOn(true); const my = ++signalToken; (async () => { while (my === signalToken) { for (const ch of '... --- ...') { if (my !== signalToken) return; if (ch === ' ') { await sleep(400); continue; } toneOn(f(), 'square', 1); await sleep(ch === '.' ? 200 : 600); toneOff(); await sleep(200); } await sleep(1400); } })(); };
  $('#siren').onclick = () => { stop(); keepOn(true); toneOn(f(), 'sawtooth', 1); let up = true; sirenT = setInterval(() => { if (!contTone) return; up = !up; contTone.o.frequency.linearRampToValueAtTime(up ? f() : f() / 2, ac().currentTime + 0.5); }, 500); };
  $('#stop').onclick = stop;
  return stop;
};

/* ---------- Morse ---------- */
routes.morse = () => {
  setTitle('Tradutor Morse');
  view.innerHTML = `<label>Texto</label><textarea id="txt" style="min-height:70px">SOS</textarea>
  <label>Morse ( . e - ; espaço entre letras; / entre palavras )</label><textarea id="mc" class="morse" style="min-height:70px"></textarea>
  <div class="row" style="margin-top:8px"><button class="btn primary" id="pl">▶ Transmitir</button><button class="btn" id="st">⏹ Parar</button></div>
  <div class="row muted" style="margin-top:6px">
   <label class="row" style="flex:none;gap:6px"><input type="checkbox" id="oT" style="width:20px" checked> Flash</label>
   <label class="row" style="flex:none;gap:6px"><input type="checkbox" id="oS" style="width:20px" checked> Som</label>
   <label class="row" style="flex:none;gap:6px"><input type="checkbox" id="oV" style="width:20px"> Vibrar</label>
   <label class="row" style="flex:none;gap:6px"><input type="checkbox" id="oL" style="width:20px"> Repetir</label></div>
  <label>Velocidade (unidade: <span id="uv">200</span> ms)</label><input type="range" id="unit" min="60" max="500" value="200">
  <h3>Recetor manual</h3><p class="muted">Toque curto = ponto, toque longo = traço. Pausa longa = nova letra.</p>
  <button class="btn block" id="key" style="min-height:80px">TECLA</button><div class="card"><div class="morse" id="rx"></div><div class="mid" id="rxt"></div></div><button class="btn" id="clr">Limpar</button>
  <h3>Tabela</h3><table class="tbl morse" style="font-size:15px">${Object.entries(MORSE).slice(0, 36).reduce((acc, e, i, arr) => i % 3 ? acc : acc + '<tr>' + arr.slice(i, i + 3).map(([k, v]) => `<td><b>${k}</b> ${v.replace(/\./g, '·').replace(/-/g, '–')}</td>`).join('') + '</tr>', '')}</table>`;
  const txt = $('#txt'), mc = $('#mc');
  txt.oninput = () => mc.value = toMorse(txt.value); mc.oninput = () => txt.value = fromMorse(mc.value); txt.oninput();
  $('#unit').oninput = e => $('#uv').textContent = e.target.value;
  $('#pl').onclick = () => { keepOn(true); playMorse(mc.value, { torch: $('#oT').checked, sound: $('#oS').checked, vibrate: $('#oV').checked, loop: $('#oL').checked }, +$('#unit').value); };
  $('#st').onclick = stopSignals;
  let t0 = 0, seq = '', gap = 0; const rx = $('#rx'), rxt = $('#rxt'), key = $('#key');
  const d = e => { e.preventDefault(); t0 = Date.now(); clearTimeout(gap); toneOn(700, 'sine', .5); };
  const u = e => { if (!t0) return; e.preventDefault(); toneOff(); const dt = Date.now() - t0; t0 = 0; seq += dt < 250 ? '.' : '-'; rx.textContent = seq; gap = setTimeout(() => { rxt.textContent += RMORSE[seq] || '?'; seq = ''; rx.textContent = ''; gap = setTimeout(() => rxt.textContent += ' ', 1200); }, 700); };
  key.addEventListener('touchstart', d); key.addEventListener('mousedown', d); key.addEventListener('touchend', u); key.addEventListener('mouseup', u);
  $('#clr').onclick = () => { seq = ''; rx.textContent = ''; rxt.textContent = ''; };
  return () => clearTimeout(gap);
};

/* ---------- Bússola ---------- */
function roseSVG() {
  let ticks = '';
  for (let i = 0; i < 360; i += 5) { const l = i % 30 === 0 ? 14 : 7; ticks += `<line x1="150" y1="${12}" x2="150" y2="${12 + l}" stroke="currentColor" stroke-width="${i % 30 ? 1 : 2}" transform="rotate(${i} 150 150)"/>`; }
  let nums = '';
  for (let i = 0; i < 360; i += 30) { if (i % 90) nums += `<text x="150" y="44" text-anchor="middle" font-size="12" fill="currentColor" transform="rotate(${i} 150 150)">${i}</text>`; }
  const card = [['N', 0, '#d9463b'], ['E', 90], ['S', 180], ['O', 270]].map(([t, a, c]) => `<text x="150" y="50" text-anchor="middle" font-size="24" font-weight="800" fill="${c || 'currentColor'}" transform="rotate(${a} 150 150)">${t}</text>`).join('');
  return `<svg viewBox="0 0 300 300"><g id="rose"><circle cx="150" cy="150" r="140" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>${ticks}${nums}${card}</g>
  <g id="tgt" style="display:none"><polygon points="150,62 160,86 140,86" fill="var(--accent2)"/></g>
  <polygon points="150,70 162,150 150,140 138,150" fill="var(--accent)"/><polygon points="150,230 162,150 150,160 138,150" fill="var(--muted)"/>
  <line x1="150" y1="0" x2="150" y2="22" stroke="var(--accent)" stroke-width="4"/><circle cx="150" cy="150" r="6" fill="var(--text)"/></svg>`;
}
routes.bussola = () => {
  setTitle('Bússola');
  const decl = store.get('decl', 0);
  view.innerHTML = `<div class="compass">${roseSVG()}</div><div class="big" id="hd">—°</div><div class="mid" id="cd"></div>
  <div class="row" style="margin-top:10px"><button class="btn" id="lock">📌 Marcar rumo</button><button class="btn" id="unlock">Limpar</button></div>
  <div id="lk" class="mid muted"></div>
  <label>Declinação magnética (° , Este positivo) – Portugal ≈ 0 a −2</label><input type="number" id="decl" step="0.1" value="${decl}">
  <div class="tip">Segure o telefone na horizontal. Se a leitura parecer errada, calibre movendo o telefone em forma de “8” várias vezes. Afaste-se de metais, ímanes e carros.</div>`;
  const rose = $('#rose'), tgt = $('#tgt'); let lock = store.get('lock', null), smooth = null;
  const showLock = () => { $('#lk').textContent = lock != null ? 'Rumo marcado: ' + Math.round(lock) + '° ' + cardinal(lock) : ''; tgt.style.display = lock != null ? '' : 'none'; };
  showLock();
  $('#decl').oninput = e => store.set('decl', +e.target.value || 0);
  $('#lock').onclick = () => { if (smooth != null) { lock = smooth; store.set('lock', lock); showLock(); vib(40); } };
  $('#unlock').onclick = () => { lock = null; store.set('lock', null); showLock(); };
  return subSensors(s => {
    let h = (s.az + (+$('#decl').value || 0) + 360) % 360;
    if (smooth == null) smooth = h; else { let d = ((h - smooth + 540) % 360) - 180; smooth = (smooth + d * 0.3 + 360) % 360; }
    rose.setAttribute('transform', `rotate(${-smooth} 150 150)`);
    if (lock != null) tgt.setAttribute('transform', `rotate(${lock - smooth} 150 150)`);
    $('#hd').textContent = Math.round(smooth) + '°'; $('#cd').textContent = cardinal(smooth);
  });
};

/* ---------- Nível ---------- */
routes.nivel = () => {
  setTitle('Nível / Inclinómetro');
  view.innerHTML = `<div class="level"><div class="ring"></div><div class="bub" id="b"></div></div><div class="row"><div><div class="muted" style="text-align:center">Inclinação</div><div class="mid" id="p">—</div></div><div><div class="muted" style="text-align:center">Rolamento</div><div class="mid" id="r">—</div></div></div>
  <div class="tip">Coloque o telefone sobre a superfície. Útil para avaliar a inclinação de encostas (risco de avalanche &gt; 30°), nivelar abrigos e escoamento de água.</div>`;
  const b = $('#b');
  return subSensors(s => {
    const x = Math.max(-100, Math.min(100, s.roll * 2.5)), y = Math.max(-100, Math.min(100, -s.pitch * 2.5));
    b.style.left = (100 + x) + 'px'; b.style.top = (100 + y) + 'px';
    $('#p').textContent = Math.abs(s.pitch).toFixed(1) + '°'; $('#r').textContent = Math.abs(s.roll).toFixed(1) + '°';
  });
};

/* ---------- GPS & Pontos ---------- */
routes.gps = () => {
  setTitle('GPS & Pontos');
  const render2 = () => {
    const wps = store.get('wps', []);
    $('#wl').innerHTML = wps.length ? wps.map((w, i) => `<div class="item"><span class="ic">📌</span><span class="t">${esc(w.n)}<small>${w.lat.toFixed(5)}, ${w.lon.toFixed(5)}${lastFix ? ' · ' + fmtDist(dist(lastFix, w)) + ' ' + cardinal(bearing(lastFix, w)) : ''}</small></span><a class="btn" href="#/ir/${i}">Ir</a><button class="btn" data-del="${i}">🗑</button></div>`).join('') : '<p class="muted">Nenhum ponto guardado.</p>';
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('Apagar ponto?')) { const w = store.get('wps', []); w.splice(+b.dataset.del, 1); store.set('wps', w); render2(); } });
  };
  view.innerHTML = `<div class="card" id="pos"><p class="muted">A obter posição GPS… (no exterior é mais rápido)</p>${lastFix ? '<p class="muted">Última posição conhecida:</p>' + coordBlock(lastFix) : ''}</div>
  <div class="row"><button class="btn primary" id="save">📌 Guardar ponto</button><button class="btn" id="share">✉️ SMS posição</button></div>
  <div class="row" style="margin-top:8px"><button class="btn" id="manual">➕ Inserir coordenadas</button><button class="btn" id="track">🥾 Registar percurso</button></div>
  <div id="trk" class="muted"></div>
  <h2>Pontos guardados</h2><div class="list" id="wl"></div>
  <div class="tip">Guarde a posição do carro/acampamento antes de se afastar. O GPS funciona sem internet nem rede móvel.</div>`;
  render2();
  let tracking = store.get('tracking', false);
  const trkInfo = () => { const tr = store.get('track', []); let d = 0; for (let i = 1; i < tr.length; i++) d += dist(tr[i - 1], tr[i]); $('#trk').innerHTML = tr.length ? `Percurso: ${tr.length} pontos, ${fmtDist(d)} ${tracking ? '(a registar…)' : ''} <a href="#" id="trkclr">limpar</a> · <a href="#" id="trkback">voltar ao início</a>` : (tracking ? 'A registar percurso…' : ''); const c = $('#trkclr'); if (c) { c.onclick = e => { e.preventDefault(); store.set('track', []); trkInfo(); }; $('#trkback').onclick = e => { e.preventDefault(); const t = store.get('track', []); if (t.length) { const w = store.get('wps', []); w.push({ n: 'Início do percurso', lat: t[0].lat, lon: t[0].lon }); store.set('wps', w); nav('ir/' + (w.length - 1)); } }; } };
  $('#track').textContent = tracking ? '⏹ Parar percurso' : '🥾 Registar percurso'; trkInfo();
  $('#track').onclick = () => { tracking = !tracking; store.set('tracking', tracking); $('#track').textContent = tracking ? '⏹ Parar percurso' : '🥾 Registar percurso'; if (tracking) keepOn(true); trkInfo(); };
  $('#save').onclick = () => { if (!lastFix) return toast('Ainda sem posição'); const n = prompt('Nome do ponto:', 'Ponto ' + (store.get('wps', []).length + 1)); if (n == null) return; const w = store.get('wps', []); w.push({ n, lat: lastFix.lat, lon: lastFix.lon, alt: lastFix.alt, t: Date.now() }); store.set('wps', w); render2(); toast('Ponto guardado'); };
  $('#share').onclick = () => { if (!lastFix) return toast('Ainda sem posição'); const msg = `SOCORRO. Estou em: ${lastFix.lat.toFixed(6)}, ${lastFix.lon.toFixed(6)} (± ${Math.round(lastFix.acc)} m) UTM ${toUTM(lastFix.lat, lastFix.lon)}`; location.href = 'sms:?body=' + encodeURIComponent(msg); };
  $('#manual').onclick = () => { const s = prompt('Coordenadas decimais "lat, lon":'); if (!s) return; const m = s.replace(/;/g, ',').split(',').map(x => parseFloat(x)); if (m.length < 2 || isNaN(m[0]) || isNaN(m[1]) || Math.abs(m[0]) > 90 || Math.abs(m[1]) > 180) return toast('Formato inválido'); const n = prompt('Nome:', 'Destino') || 'Destino'; const w = store.get('wps', []); w.push({ n, lat: m[0], lon: m[1] }); store.set('wps', w); render2(); };
  if (tracking) keepOn(true);
  return subGps((f, err) => {
    if (!f) { if (err) $('#pos').innerHTML = `<p class="muted">${esc(err)}</p>` + (lastFix ? coordBlock(lastFix) : ''); return; }
    $('#pos').innerHTML = coordBlock(f); render2();
    if (tracking && f.acc < 50) { const tr = store.get('track', []); const l = tr[tr.length - 1]; if (!l || dist(l, f) > 15) { tr.push({ lat: f.lat, lon: f.lon, t: f.t }); store.set('track', tr); trkInfo(); } }
  });
};
routes.ir = idx => {
  const w = store.get('wps', [])[+idx]; if (!w) return nav('gps');
  setTitle('Ir para: ' + w.n);
  view.innerHTML = `<div class="compass">${roseSVG()}</div><div class="big" id="dd">—</div><div class="mid" id="bb">—</div><div class="muted" style="text-align:center" id="ex"></div>
  <div class="tip">A seta verde aponta para o destino. Rode-se até a seta verde ficar no topo (marca laranja).</div>`;
  $('#tgt').style.display = '';
  let br = null, sm = null; keepOn(true);
  const u1 = subGps(f => { if (!f) return; const d = dist(f, w); br = bearing(f, w); $('#dd').textContent = fmtDist(d); $('#bb').textContent = 'Rumo ' + Math.round(br) + '° ' + cardinal(br); $('#ex').textContent = `± ${Math.round(f.acc)} m · a 4 km/h: ${Math.round(d / 4000 * 60)} min`; if (d < Math.max(15, f.acc)) { $('#ex').textContent = '✅ Chegou ao destino!'; } });
  const u2 = subSensors(s => { const h = (s.az + store.get('decl', 0) + 360) % 360; if (sm == null) sm = h; else { const d = ((h - sm + 540) % 360) - 180; sm = (sm + d * .3 + 360) % 360; } $('#rose').setAttribute('transform', `rotate(${-sm} 150 150)`); if (br != null) $('#tgt').setAttribute('transform', `rotate(${br - sm} 150 150)`); });
  return () => { u1(); u2(); };
};

/* ---------- RCP ---------- */
routes.rcp = () => {
  setTitle('Metrónomo RCP');
  view.innerHTML = `<div class="danger-box"><b>Ligue 112 primeiro</b> (altifalante). Se houver DAE, peça que o tragam.</div>
  <div class="big" id="cnt" style="font-size:90px">0</div><div class="mid" id="ph">Pronto</div><div class="muted" style="text-align:center" id="tm">00:00 · ciclos 0</div>
  <label>Ritmo: <span id="bv">110</span> /min</label><input type="range" id="bpm" min="100" max="120" value="110">
  <div class="row" style="margin-top:6px"><label class="row" style="flex:none;gap:6px"><input type="checkbox" id="only" style="width:20px"> Só compressões (sem insuflações)</label></div>
  <button class="btn danger block" id="go" style="min-height:70px;font-size:22px">▶ INICIAR</button>
  <div class="card article"><ol><li>Centro do peito, braços esticados.</li><li>Comprimir 5–6 cm, deixar subir totalmente.</li><li>30 compressões → 2 insuflações (1 s cada).</li><li>Trocar de reanimador a cada 2 min.</li></ol></div>`;
  let run = false, timer = 0, n = 0, cyc = 0, start = 0, clock = 0, breath = 0;
  const bpm = () => +$('#bpm').value; $('#bpm').oninput = () => $('#bv').textContent = bpm();
  const beat = () => {
    if (!run) return;
    if (breath > 0) { breath--; if (breath === 0) { n = 0; $('#ph').textContent = 'COMPRIMIR'; } timer = setTimeout(beat, 60000 / bpm()); return; }
    n++; $('#cnt').textContent = n; tone(n === 30 ? 1200 : 880, 60, 'square', .8); vib(30);
    if (n >= 30 && !$('#only').checked) { cyc++; $('#ph').textContent = '💨 2 INSUFLAÇÕES'; tone(500, 400, 'sine', .8); breath = Math.round(5 * bpm() / 60); }
    else if (n >= 30) { n = 0; cyc++; }
    timer = setTimeout(beat, 60000 / bpm());
  };
  const tick = () => { const s = Math.floor((Date.now() - start) / 1000); $('#tm').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} · ciclos ${cyc}`; if (s > 0 && s % 120 === 0) { toast('2 minutos – troque de reanimador / verifique'); vib(400); } };
  const stop = () => { run = false; clearTimeout(timer); clearInterval(clock); $('#go').textContent = '▶ INICIAR'; $('#ph').textContent = 'Parado'; };
  $('#go').onclick = () => { if (run) return stop(); ac(); run = true; n = 0; cyc = 0; breath = 0; start = Date.now(); keepOn(true); $('#ph').textContent = 'COMPRIMIR'; $('#go').textContent = '⏹ PARAR'; clock = setInterval(tick, 1000); beat(); };
  return stop;
};

/* ---------- Checklists ---------- */
function clState(id) { const def = CHECKLISTS[id]; const s = store.get('cl_' + id, null); if (s) return s; return { items: (def ? def.items : []).map(t => ({ t, d: false })) }; }
routes.checklists = () => {
  setTitle('Checklists');
  const custom = store.get('cl_custom', []);
  const all = Object.entries(CHECKLISTS).map(([id, c]) => ({ id, t: c.t, ic: c.ic })).concat(custom.map(c => ({ id: c.id, t: c.t, ic: '🗒️' })));
  view.innerHTML = `<div class="list">${all.map(c => { const s = clState(c.id); const d = s.items.filter(i => i.d).length; return `<a class="item" href="#/cl/${c.id}"><span class="ic">${c.ic}</span><span class="t">${esc(c.t)}<small>${d}/${s.items.length} concluídos</small><div class="progress"><i style="width:${s.items.length ? d / s.items.length * 100 : 0}%"></i></div></span>›</a>`; }).join('')}</div>
  <button class="btn block" id="new">➕ Nova checklist</button>`;
  $('#new').onclick = () => { const t = prompt('Nome da checklist:'); if (!t) return; const c = store.get('cl_custom', []); const id = 'u' + Date.now(); c.push({ id, t }); store.set('cl_custom', c); store.set('cl_' + id, { items: [] }); nav('cl/' + id); };
};
routes.cl = id => {
  const def = CHECKLISTS[id] || store.get('cl_custom', []).find(c => c.id === id); if (!def) return nav('checklists');
  setTitle(def.t);
  const draw = () => {
    const s = clState(id); const d = s.items.filter(i => i.d).length;
    view.innerHTML = `<div class="muted">${d}/${s.items.length} concluídos</div><div class="progress"><i style="width:${s.items.length ? d / s.items.length * 100 : 0}%"></i></div>
    <div class="card" style="padding:0">${s.items.map((it, i) => `<label class="chk ${it.d ? 'done' : ''}"><input type="checkbox" data-i="${i}" ${it.d ? 'checked' : ''}><span>${esc(it.t)}</span><button class="x" data-x="${i}">×</button></label>`).join('')}</div>
    <div class="row"><input id="ni" placeholder="Adicionar item…"><button class="btn primary" id="add" style="flex:none">+</button></div>
    <div class="row" style="margin-top:10px"><button class="btn" id="reset">↺ Desmarcar tudo</button>${CHECKLISTS[id] ? '<button class="btn" id="orig">Repor original</button>' : '<button class="btn danger" id="delcl">Apagar lista</button>'}</div>`;
    view.querySelectorAll('[data-i]').forEach(c => c.onchange = () => { const s2 = clState(id); s2.items[+c.dataset.i].d = c.checked; store.set('cl_' + id, s2); draw(); });
    view.querySelectorAll('[data-x]').forEach(b => b.onclick = e => { e.preventDefault(); const s2 = clState(id); s2.items.splice(+b.dataset.x, 1); store.set('cl_' + id, s2); draw(); });
    const add = () => { const v = $('#ni').value.trim(); if (!v) return; const s2 = clState(id); s2.items.push({ t: v, d: false }); store.set('cl_' + id, s2); draw(); $('#ni').focus(); };
    $('#add').onclick = add; $('#ni').onkeydown = e => { if (e.key === 'Enter') add(); };
    $('#reset').onclick = () => { const s2 = clState(id); s2.items.forEach(i => i.d = false); store.set('cl_' + id, s2); draw(); };
    if ($('#orig')) $('#orig').onclick = () => { if (confirm('Repor a lista original?')) { localStorage.removeItem('sv_cl_' + id); draw(); } };
    if ($('#delcl')) $('#delcl').onclick = () => { if (confirm('Apagar esta lista?')) { store.set('cl_custom', store.get('cl_custom', []).filter(c => c.id !== id)); localStorage.removeItem('sv_cl_' + id); nav('checklists'); } };
  };
  draw();
};

/* ---------- Inventário ---------- */
const CATS = ['Água', 'Comida', 'Medicamentos', 'Energia/Pilhas', 'Combustível', 'Higiene', 'Ferramentas', 'Outros'];
routes.inventario = () => {
  setTitle('Inventário de reservas');
  const draw = () => {
    const inv = store.get('inv', []); const now = Date.now();
    const st = it => { if (!it.exp) return ''; const d = Math.ceil((new Date(it.exp) - now) / 864e5); return d < 0 ? `<span class="pill red">expirado</span>` : d <= 30 ? `<span class="pill yel">${d} dias</span>` : `<span class="pill grn">${new Date(it.exp).toLocaleDateString('pt-PT')}</span>`; };
    const water = inv.filter(i => i.cat === 'Água' && /^l/i.test(i.unit || '')).reduce((a, i) => a + (+i.qty || 0), 0);
    const kcal = inv.filter(i => i.cat === 'Comida').reduce((a, i) => a + (+i.kcal || 0) * (+i.qty || 0), 0);
    const ppl = store.get('people', 1);
    const exp = inv.filter(i => i.exp && new Date(i.exp) - now < 30 * 864e5).length;
    view.innerHTML = `<div class="card"><div class="row"><div><div class="muted">Pessoas</div><input type="number" id="ppl" min="1" value="${ppl}"></div><div><div class="muted">Água</div><b>${water.toFixed(0)} L</b><br><span class="muted">${(water / ppl / 4).toFixed(1)} dias</span></div><div><div class="muted">Comida</div><b>${Math.round(kcal)} kcal</b><br><span class="muted">${(kcal / ppl / 2000).toFixed(1)} dias</span></div></div>${exp ? `<div class="warn" style="margin-bottom:0">${exp} item(s) expirado(s) ou a expirar em 30 dias.</div>` : ''}</div>
    <details class="card"><summary><b>➕ Adicionar item</b></summary>
     <label>Nome</label><input id="n" placeholder="Ex.: Atum em lata">
     <div class="row"><div><label>Quantidade</label><input id="q" type="number" value="1"></div><div><label>Unidade</label><input id="u" placeholder="un, L, kg" value="un"></div></div>
     <div class="row"><div><label>Categoria</label><select id="c">${CATS.map(c => `<option>${c}</option>`).join('')}</select></div><div><label>Validade</label><input id="e" type="date"></div></div>
     <label>kcal por unidade (comida, opcional)</label><input id="k" type="number" placeholder="ex.: 200">
     <button class="btn primary block" id="add" style="margin-top:10px">Adicionar</button></details>
    ${CATS.map(c => { const items = inv.map((it, i) => ({ it, i })).filter(x => x.it.cat === c).sort((a, b) => (a.it.exp || '9') < (b.it.exp || '9') ? -1 : 1); return items.length ? `<h3>${c}</h3><div class="list">${items.map(({ it, i }) => `<div class="item"><span class="t">${esc(it.n)} ${st(it)}<small>${esc(it.qty)} ${esc(it.unit)}${it.kcal ? ' · ' + esc(it.kcal) + ' kcal/un' : ''}</small></span><button class="btn" data-m="${i}">−</button><button class="btn" data-p="${i}">+</button><button class="btn" data-d="${i}">🗑</button></div>`).join('')}</div>` : ''; }).join('')}
    ${inv.length ? '' : '<p class="muted">Registe as suas reservas para controlar quantidades e validades.</p>'}`;
    $('#ppl').onchange = e => { store.set('people', Math.max(1, +e.target.value || 1)); draw(); };
    $('#add').onclick = () => { const n = $('#n').value.trim(); if (!n) return toast('Indique o nome'); const inv2 = store.get('inv', []); inv2.push({ n, qty: +$('#q').value || 0, unit: $('#u').value, cat: $('#c').value, exp: $('#e').value || null, kcal: +$('#k').value || 0 }); store.set('inv', inv2); draw(); toast('Adicionado'); };
    const mod = (i, d) => { const inv2 = store.get('inv', []); inv2[i].qty = Math.max(0, (+inv2[i].qty || 0) + d); store.set('inv', inv2); draw(); };
    view.querySelectorAll('[data-m]').forEach(b => b.onclick = () => mod(+b.dataset.m, -1));
    view.querySelectorAll('[data-p]').forEach(b => b.onclick = () => mod(+b.dataset.p, 1));
    view.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Apagar item?')) { const inv2 = store.get('inv', []); inv2.splice(+b.dataset.d, 1); store.set('inv', inv2); draw(); } });
  };
  draw();
};

/* ---------- Calculadoras ---------- */
routes.calc = () => {
  setTitle('Calculadoras');
  view.innerHTML = `
  <details class="card" open><summary><b>💧 Água necessária</b></summary>
   <div class="row"><div><label>Pessoas</label><input type="number" id="wp" value="${store.get('people', 1)}"></div><div><label>Dias</label><input type="number" id="wd" value="3"></div></div>
   <label>Condições</label><select id="wc"><option value="3">Ameno, repouso (3 L)</option><option value="4" selected>Casa: beber+cozinhar+higiene (4 L)</option><option value="5">Calor ou esforço (5 L)</option><option value="7">Calor extremo + esforço (7 L)</option></select>
   <div class="mid" id="wr"></div></details>
  <details class="card"><summary><b>🧴 Purificação com lixívia</b></summary>
   <div class="row"><div><label>Litros de água</label><input type="number" id="bl" value="1"></div><div><label>% hipoclorito</label><input type="number" id="bc" value="5" step="0.5"></div></div>
   <label class="row" style="gap:6px"><input type="checkbox" id="bt" style="width:20px;flex:none"> Água turva ou muito fria</label>
   <div class="mid" id="br"></div><p class="muted">Lixívia sem perfume nem aditivos. 1 gota ≈ 0,05 ml. Esperar 30 min (60 min se turva/fria). Deve cheirar ligeiramente a cloro.</p></details>
  <details class="card"><summary><b>🍞 Rações / calorias</b></summary>
   <div class="row"><div><label>Pessoas</label><input type="number" id="rp" value="${store.get('people', 1)}"></div><div><label>Dias</label><input type="number" id="rd" value="14"></div></div>
   <label>Atividade</label><select id="ra"><option value="1600">Mínimo de sobrevivência (1600)</option><option value="2000" selected>Normal (2000)</option><option value="3000">Esforço / frio (3000)</option><option value="4000">Esforço intenso + frio (4000)</option></select>
   <div id="rr"></div></details>
  <details class="card"><summary><b>⚡ Distância da trovoada</b></summary>
   <p class="muted">Toque em “Relâmpago!” ao ver o clarão e “Trovão!” ao ouvir.</p>
   <div class="row"><button class="btn primary" id="lf">⚡ Relâmpago!</button><button class="btn" id="th">🔊 Trovão!</button></div><div class="mid" id="lr"></div></details>
  <details class="card"><summary><b>🌬️ Sensação térmica (vento)</b></summary>
   <div class="row"><div><label>Temperatura °C</label><input type="number" id="ct" value="0"></div><div><label>Vento km/h</label><input type="number" id="cv" value="30"></div></div><div class="mid" id="cr"></div></details>
  <details class="card"><summary><b>☀️ Índice de calor</b></summary>
   <div class="row"><div><label>Temperatura °C</label><input type="number" id="ht" value="35"></div><div><label>Humidade %</label><input type="number" id="hh" value="50"></div></div><div class="mid" id="hr"></div></details>
  <details class="card"><summary><b>🥾 Tempo de caminhada (Naismith)</b></summary>
   <div class="row"><div><label>Distância km</label><input type="number" id="nd" value="10"></div><div><label>Subida acumulada m</label><input type="number" id="nu" value="500"></div></div>
   <label>Ritmo</label><select id="ns"><option value="4">Lento / com carga (4 km/h)</option><option value="5" selected>Normal (5 km/h)</option><option value="6">Rápido (6 km/h)</option></select><div class="mid" id="nr"></div></details>
  <details class="card"><summary><b>🌇 Luz restante (método da mão)</b></summary>
   <p>Estenda o braço, mão na horizontal, com o dedo mindinho sobre o horizonte. Cada dedo entre o horizonte e o Sol ≈ <b>15 minutos</b> de luz até ao pôr do sol (4 dedos ≈ 1 hora).</p>
   <div class="row"><div><label>Dedos</label><input type="number" id="fd" value="4"></div></div><div class="mid" id="fr"></div></details>
  <details class="card"><summary><b>🔁 Conversões</b></summary>
   <div class="row"><div><label>Valor</label><input type="number" id="uvv" value="1"></div><div><label>Conversão</label><select id="uc">
    <option value="km">km → milhas</option><option value="mi">milhas → km</option><option value="c">°C → °F</option><option value="f">°F → °C</option><option value="kg">kg → lb</option><option value="lb">lb → kg</option><option value="l">litros → galões (EUA)</option><option value="gal">galões → litros</option><option value="m">m → pés</option><option value="ft">pés → m</option><option value="nm">milhas náuticas → km</option></select></div></div><div class="mid" id="ur"></div></details>`;
  const v = id => +$('#' + id).value || 0;
  const calc = () => {
    const wl = v('wp') * v('wd') * v('wc'); $('#wr').textContent = `${wl} L  ≈ ${Math.ceil(wl / 5)} garrafões de 5 L`;
    let drops = v('bl') * 2 * (6 / Math.max(0.5, v('bc'))); if ($('#bt').checked) drops *= 2; $('#br').textContent = `${Math.ceil(drops)} gotas  (${(drops * 0.05).toFixed(2)} ml)`;
    const k = v('rp') * v('rd') * v('ra'); $('#rr').innerHTML = `<div class="mid">${k.toLocaleString('pt-PT')} kcal</div><table class="tbl"><tr><td>Arroz/massa seca (≈360 kcal/100 g)</td><td>${(k * 0.5 / 3600).toFixed(1)} kg (50%)</td></tr><tr><td>Leguminosas secas (≈340/100 g)</td><td>${(k * 0.2 / 3400).toFixed(1)} kg (20%)</td></tr><tr><td>Azeite (≈880/100 ml)</td><td>${(k * 0.15 / 8800).toFixed(1)} L (15%)</td></tr><tr><td>Enlatados/proteína (≈200/lata)</td><td>${Math.ceil(k * 0.15 / 200)} latas (15%)</td></tr></table>`;
    const T = v('ct'), V = v('cv'); $('#cr').textContent = (T <= 10 && V > 4.8) ? (13.12 + 0.6215 * T - 11.37 * V ** 0.16 + 0.3965 * T * V ** 0.16).toFixed(1) + ' °C' : 'Aplicável com T ≤ 10 °C e vento > 5 km/h';
    const F = v('ht') * 9 / 5 + 32, H = v('hh'); let hi = -42.379 + 2.04901523 * F + 10.14333127 * H - .22475541 * F * H - .00683783 * F * F - .05481717 * H * H + .00122874 * F * F * H + .00085282 * F * H * H - .00000199 * F * F * H * H; if (F < 80) hi = F; const hc = (hi - 32) * 5 / 9;
    $('#hr').textContent = hc.toFixed(1) + ' °C ' + (hc >= 54 ? '– PERIGO EXTREMO' : hc >= 41 ? '– PERIGO' : hc >= 32 ? '– precaução extrema' : hc >= 27 ? '– precaução' : '');
    const nt = v('nd') / v('ns') + v('nu') / 600; $('#nr').textContent = `${Math.floor(nt)} h ${Math.round((nt % 1) * 60)} min (sem pausas)`;
    $('#fr').textContent = `≈ ${v('fd') * 15} min de luz`;
    const x = v('uvv'), cv = { km: [x * 0.621371, 'mi'], mi: [x * 1.609344, 'km'], c: [x * 9 / 5 + 32, '°F'], f: [(x - 32) * 5 / 9, '°C'], kg: [x * 2.20462, 'lb'], lb: [x * 0.453592, 'kg'], l: [x * 0.264172, 'gal'], gal: [x * 3.78541, 'L'], m: [x * 3.28084, 'ft'], ft: [x * 0.3048, 'm'], nm: [x * 1.852, 'km'] }[$('#uc').value];
    $('#ur').textContent = cv[0].toFixed(2) + ' ' + cv[1];
  };
  view.querySelectorAll('input,select').forEach(e => { e.addEventListener('input', calc); e.addEventListener('change', calc); }); calc();
  let lt = 0, lint = 0;
  $('#lf').onclick = () => { lt = Date.now(); clearInterval(lint); lint = setInterval(() => $('#lr').textContent = ((Date.now() - lt) / 1000).toFixed(1) + ' s', 100); };
  $('#th').onclick = () => { if (!lt) return; clearInterval(lint); const s = (Date.now() - lt) / 1000; const km = s / 3; $('#lr').innerHTML = `${s.toFixed(1)} s → <b>${km.toFixed(1)} km</b>${km < 10 ? '<br><span style="color:var(--danger)">Procure abrigo já!</span>' : ''}`; lt = 0; };
  return () => clearInterval(lint);
};

/* ---------- Sol & Lua ---------- */
routes.sol = () => {
  setTitle('Sol & Lua');
  view.innerHTML = `<div id="sl"><p class="muted">A obter posição…</p></div>`;
  const draw = f => {
    const now = new Date(); const m = moon(now);
    let html = '';
    if (f) {
      const s = sunTimes(now, f.lat, f.lon), civ = sunTimes(now, f.lat, f.lon, 96);
      const left = s.set instanceof Date ? s.set - now : 0;
      html += `<div class="card"><div class="row"><div><div class="muted">🌅 Nascer</div><div class="mid">${hm(s.rise)}</div></div><div><div class="muted">🌇 Pôr</div><div class="mid">${hm(s.set)}</div></div></div>
      <div class="row" style="margin-top:8px"><div><div class="muted">Crepúsculo manhã</div><b>${hm(civ.rise)}</b></div><div><div class="muted">Crepúsculo tarde</div><b>${hm(civ.set)}</b></div></div>
      ${s.rise instanceof Date && s.set instanceof Date ? `<p class="muted">Duração do dia: ${Math.floor((s.set - s.rise) / 36e5)} h ${Math.round(((s.set - s.rise) % 36e5) / 6e4)} min</p>` : ''}
      ${left > 0 ? `<div class="${left < 2 * 36e5 ? 'warn' : 'tip'}">Luz solar restante: <b>${Math.floor(left / 36e5)} h ${Math.round((left % 36e5) / 6e4)} min</b>${left < 2 * 36e5 ? ' – prepare abrigo e fogo!' : ''}</div>` : '<div class="warn">O Sol já se pôs.</div>'}
      <p class="muted">Posição: ${f.lat.toFixed(4)}, ${f.lon.toFixed(4)}</p></div>`;
    } else html += '<div class="warn">Sem posição GPS – horas do Sol indisponíveis.</div>';
    html += `<div class="card"><h3>${m.name}</h3><p>Iluminação: <b>${m.illum}%</b> · Idade: ${m.age} dias</p><p class="muted">Próxima lua cheia: ${m.next.toLocaleDateString('pt-PT')} · Próxima lua nova: ${m.nextNew.toLocaleDateString('pt-PT')}</p>
    <p class="muted">Lua cheia = noites mais claras para deslocação; lua nova = melhor para ver estrelas e sinais luminosos.</p></div>`;
    $('#sl').innerHTML = html;
  };
  draw(lastFix);
  return subGps(f => { if (f) draw(f); });
};

/* ---------- Barómetro ---------- */
routes.barometro = () => {
  setTitle('Barómetro');
  view.innerHTML = `<div class="big" id="pp">—</div><div class="mid muted">hPa</div><div id="pa" class="muted" style="text-align:center"></div>
  <label>Pressão ao nível do mar de referência (hPa)</label><input type="number" id="ref" value="${store.get('pref', 1013.25)}" step="0.1">
  <div id="trend" class="card"></div><canvas id="ch" width="700" height="260" style="width:100%;background:var(--card);border-radius:12px"></canvas>
  <button class="btn block" id="clr">Limpar histórico</button>
  <div class="tip">A app regista uma leitura a cada 15 min enquanto estiver aberta. Queda &gt; 3 hPa em 3 h indica aproximação de mau tempo. Sem sensor de pressão no telefone, esta função fica indisponível.</div>`;
  $('#ref').oninput = e => store.set('pref', +e.target.value || 1013.25);
  const drawTrend = () => {
    const log = store.get('pres', []); const c = $('#ch'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    const cs = getComputedStyle(document.body);
    if (log.length < 2) { $('#trend').innerHTML = '<span class="muted">Histórico insuficiente para tendência.</span>'; return; }
    const now = Date.now(); const past = log.filter(l => now - l.t <= 3 * 36e5); const d = past.length > 1 ? past[past.length - 1].p - past[0].p : 0;
    $('#trend').innerHTML = `Tendência 3 h: <b>${d > 0 ? '+' : ''}${d.toFixed(1)} hPa</b> – ${d <= -3 ? '⚠️ queda rápida: mau tempo provável' : d <= -1 ? 'a descer: tempo a piorar' : d >= 3 ? 'subida rápida: vento, melhoria' : d >= 1 ? 'a subir: melhoria' : 'estável'}`;
    const ps = log.map(l => l.p), mn = Math.min(...ps) - 1, mx = Math.max(...ps) + 1, t0 = log[0].t, t1 = log[log.length - 1].t || t0 + 1;
    g.strokeStyle = cs.getPropertyValue('--accent'); g.lineWidth = 3; g.beginPath();
    log.forEach((l, i) => { const x = 20 + (l.t - t0) / Math.max(1, t1 - t0) * 660, y = 240 - (l.p - mn) / (mx - mn) * 220; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    g.fillStyle = cs.getPropertyValue('--muted'); g.font = '20px sans-serif'; g.fillText(mx.toFixed(0), 4, 22); g.fillText(mn.toFixed(0), 4, 254);
  };
  drawTrend();
  $('#clr').onclick = () => { if (confirm('Limpar histórico?')) { store.set('pres', []); drawTrend(); } };
  let got = false;
  const to = setTimeout(() => { if (!got) $('#pa').textContent = 'Sensor de pressão não detetado.'; }, 3000);
  const un = subSensors(s => { if (s.pres > 0) { got = true; $('#pp').textContent = s.pres.toFixed(1); const ref = +$('#ref').value || 1013.25; $('#pa').textContent = 'Altitude estimada: ' + Math.round(44330 * (1 - Math.pow(s.pres / ref, 0.1903))) + ' m'; } });
  const iv = setInterval(drawTrend, 60000);
  return () => { un(); clearTimeout(to); clearInterval(iv); };
};

/* ---------- Ficha médica ---------- */
const FICHA = [['nome', 'Nome completo'], ['nasc', 'Data de nascimento', 'date'], ['sangue', 'Grupo sanguíneo'], ['alergias', 'Alergias'], ['condicoes', 'Doenças / condições'], ['medicacao', 'Medicação habitual'], ['sns', 'Nº utente SNS / seguro'], ['ice1', 'Contacto de emergência 1 (nome e nº)'], ['ice2', 'Contacto de emergência 2'], ['notas', 'Outras notas (próteses, gravidez, dador…)', 'area']];
routes.ficha = () => {
  setTitle('Ficha Médica (ICE)');
  const f = store.get('ficha', {});
  view.innerHTML = `<p class="muted">Informação para socorristas. Guardada apenas neste telefone.</p>
  ${FICHA.map(([k, l, t]) => `<label>${l}</label>${t === 'area' ? `<textarea data-k="${k}">${esc(f[k] || '')}</textarea>` : `<input data-k="${k}" type="${t || 'text'}" value="${esc(f[k] || '')}">`}`).join('')}
  <button class="btn primary block" id="sv" style="margin-top:14px">Guardar</button><button class="btn block" id="show">👁 Mostrar em ecrã inteiro</button>
  <div class="card" id="pf" style="display:none"></div>`;
  $('#sv').onclick = () => { const o = {}; view.querySelectorAll('[data-k]').forEach(e => o[e.dataset.k] = e.value); store.set('ficha', o); toast('Guardado'); };
  $('#show').onclick = () => { const o = store.get('ficha', {}); const p = $('#pf'); p.style.display = ''; p.innerHTML = '<h2>🩺 INFORMAÇÃO MÉDICA</h2>' + FICHA.filter(([k]) => o[k]).map(([k, l]) => `<p><span class="muted">${l}</span><br><b style="font-size:19px">${esc(o[k])}</b></p>`).join(''); p.scrollIntoView(); };
};

/* ---------- Contactos ---------- */
routes.contactos = () => {
  setTitle('Contactos de emergência');
  const draw = () => {
    const my = store.get('contacts', []);
    view.innerHTML = `<h2>Números oficiais</h2><div class="list">${EMERGENCY_NUMBERS.map(([n, d]) => `<a class="item" href="tel:${n.replace(/\s/g, '')}"><span class="ic">📞</span><span class="t"><b>${n}</b><small>${d}</small></span></a>`).join('')}</div>
    <h2>Os meus contactos</h2><div class="list">${my.map((c, i) => `<div class="item"><span class="t">${esc(c.n)}<small>${esc(c.p)}${c.r ? ' · ' + esc(c.r) : ''}</small></span><a class="btn" href="tel:${esc(c.p)}">📞</a><a class="btn" href="sms:${esc(c.p)}">✉️</a><button class="btn" data-d="${i}">🗑</button></div>`).join('') || '<p class="muted">Adicione familiares, vizinhos, ponto de encontro…</p>'}</div>
    <div class="card"><label>Nome</label><input id="cn"><label>Telefone</label><input id="cp" type="tel"><label>Relação / nota</label><input id="cr"><button class="btn primary block" id="ca" style="margin-top:10px">Adicionar</button></div>
    <div class="card"><h3>Plano familiar</h3><label>Ponto de encontro perto de casa</label><input id="m1" value="${esc(store.get('meet1', ''))}"><label>Ponto de encontro fora do bairro</label><input id="m2" value="${esc(store.get('meet2', ''))}"><label>Contacto fora da região</label><input id="m3" value="${esc(store.get('meet3', ''))}"><button class="btn block" id="ms" style="margin-top:10px">Guardar plano</button></div>`;
    $('#ca').onclick = () => { const n = $('#cn').value.trim(), p = $('#cp').value.trim(); if (!n || !p) return toast('Nome e telefone'); const c = store.get('contacts', []); c.push({ n, p, r: $('#cr').value.trim() }); store.set('contacts', c); draw(); };
    view.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Apagar contacto?')) { const c = store.get('contacts', []); c.splice(+b.dataset.d, 1); store.set('contacts', c); draw(); } });
    $('#ms').onclick = () => { store.set('meet1', $('#m1').value); store.set('meet2', $('#m2').value); store.set('meet3', $('#m3').value); toast('Plano guardado'); };
  };
  draw();
};

/* ---------- Diário ---------- */
routes.diario = () => {
  setTitle('Diário de sobrevivência');
  const draw = () => {
    const d = store.get('diary', []);
    view.innerHTML = `<textarea id="dt" placeholder="O que aconteceu? Recursos, decisões, estado físico, ferimentos…"></textarea>
    <label class="row" style="gap:6px"><input type="checkbox" id="dg" style="width:20px;flex:none" ${lastFix ? 'checked' : ''}> Anexar posição GPS</label>
    <button class="btn primary block" id="da">Registar entrada</button>
    <div>${d.slice().reverse().map((e, ri) => { const i = d.length - 1 - ri; return `<div class="card"><div class="muted">${new Date(e.t).toLocaleString('pt-PT')}${e.lat ? ` · 📍 ${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}` : ''} <button class="x" style="float:right;background:none;border:none;color:var(--muted);font-size:18px" data-d="${i}">×</button></div><p style="white-space:pre-wrap">${esc(e.x)}</p></div>`; }).join('')}</div>`;
    $('#da').onclick = () => { const x = $('#dt').value.trim(); if (!x) return; const d2 = store.get('diary', []); const e = { t: Date.now(), x }; if ($('#dg').checked && lastFix) { e.lat = lastFix.lat; e.lon = lastFix.lon; } d2.push(e); store.set('diary', d2); draw(); };
    view.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Apagar entrada?')) { const d2 = store.get('diary', []); d2.splice(+b.dataset.d, 1); store.set('diary', d2); draw(); } });
  };
  draw();
};

/* ---------- Cópia de segurança ---------- */
routes.dados = () => {
  setTitle('Cópia de segurança');
  const dump = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('sv_')) o[k] = localStorage.getItem(k); } return JSON.stringify(o); };
  view.innerHTML = `<p class="muted">Copie este texto e guarde-o (email, nota, outro telefone). Para restaurar, cole e toque em “Importar”.</p>
  <textarea id="bk" style="min-height:200px;font-family:monospace;font-size:12px">${esc(dump())}</textarea>
  <div class="row"><button class="btn" id="cp">📋 Copiar</button><button class="btn primary" id="im">⬆ Importar</button></div>
  <button class="btn danger block" id="wipe" style="margin-top:20px">Apagar todos os dados</button>`;
  $('#cp').onclick = () => { const t = $('#bk'); t.select(); try { document.execCommand('copy'); toast('Copiado'); } catch (e) { toast('Selecione e copie manualmente'); } };
  $('#im').onclick = () => { try { const o = JSON.parse($('#bk').value); if (!confirm('Substituir os dados atuais?')) return; Object.keys(o).forEach(k => { if (k.startsWith('sv_')) localStorage.setItem(k, o[k]); }); toast('Importado'); setTimeout(() => location.reload(), 600); } catch (e) { toast('Texto inválido'); } };
  $('#wipe').onclick = () => { if (confirm('Apagar TODOS os dados (ficha, inventário, pontos, diário…)?') && confirm('Tem a certeza?')) { Object.keys(localStorage).filter(k => k.startsWith('sv_')).forEach(k => localStorage.removeItem(k)); toast('Dados apagados'); nav(''); } };
};

render();
})();
