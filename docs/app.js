(function () {
  "use strict";

  const RECIPES = window.RECIPES;
  const CATS = window.CATEGORIES;
  const catById = Object.fromEntries(CATS.map(c => [c.id, c]));
  const byId = Object.fromEntries(RECIPES.map(r => [r.id, r]));
  const app = document.getElementById("app");

  // ───────── Estado ─────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };
  let favs = new Set(store.get("favs", []));
  const state = {
    query: "",
    cat: store.get("cat", "all"),
    homeScroll: 0,
    servings: {},   // id -> doses escolhidas
    checked: {},    // id -> Set de índices de ingredientes
    stepsDone: {},  // id -> Set de índices de passos
    tab: {}         // id -> "ing" | "steps"
  };

  // ───────── Ícones ─────────
  const I = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.1 3.2 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.7 0 6 3.6 4.5 7.2C19.5 16.4 12 21 12 21z"/></svg>',
    heartO: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.3-9-8.7C1.6 8 3.7 4.8 7 4.8c1.9 0 3.4 1 5 2.9 1.6-1.9 3.1-2.9 5-2.9 3.3 0 5.4 3.2 4 6.5-2 4.4-9 8.7-9 8.7z"/></svg>',
    share: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
    drive: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 3h8l6 10-4 7H6l-4-7z"/><path d="M8 3l6 10H2M16 3 10 13M22 13H10l-4 7"/></svg>',
    list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  // ───────── Utilitários ─────────
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const isHead = s => s.startsWith("# ");

  const FRAC = { "½": .5, "¼": .25, "¾": .75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": .125 };
  const FRAC_OUT = [[0, ""], [.25, "¼"], [1 / 3, "⅓"], [.5, "½"], [2 / 3, "⅔"], [.75, "¾"], [1, ""]];

  // Unidades: [singular, plural, tipo]
  const UNITS = [
    ["kg", "kg", "m"], ["g", "g", "m"], ["mg", "mg", "m"], ["l", "l", "m"], ["dl", "dl", "m"], ["cl", "cl", "m"], ["ml", "ml", "m"],
    ["c. sopa", "c. sopa", "u"], ["c. chá", "c. chá", "u"], ["c. café", "c. café", "u"],
    ["chávena", "chávenas", "u"], ["copo", "copos", "u"], ["saqueta", "saquetas", "u"], ["lata", "latas", "w"],
    ["folha", "folhas", "w"], ["dente", "dentes", "w"], ["pitada", "pitadas", "w"], ["punhado", "punhados", "u"],
    ["posta", "postas", "w"], ["fatia", "fatias", "w"], ["ramo", "ramos", "u"], ["raminho", "raminhos", "u"],
    ["molho", "molhos", "u"], ["cubo", "cubos", "w"], ["pau", "paus", "w"], ["rolo", "rolos", "w"], ["base", "bases", "w"],
    ["cálice", "cálices", "u"], ["tampinha", "tampinhas", "u"], ["talo", "talos", "u"], ["cabeça", "cabeças", "w"], ["vagem", "vagens", "w"]
  ];
  const unitLookup = [];
  UNITS.forEach(u => { unitLookup.push([u[0], u]); if (u[1] !== u[0]) unitLookup.push([u[1], u]); });
  unitLookup.sort((a, b) => b[0].length - a[0].length);

  const QTY_RE = /^(\d+\s+\d+\/\d+|\d+\s*[½¼¾⅓⅔⅛]|\d+(?:[.,]\d+)?\/\d+|\d+[.,]\d+|\d+|[½¼¾⅓⅔⅛])(?=\s|$)\s*/;

  function parseQty(s) {
    s = s.trim();
    let m;
    if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
    if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛])$/))) return +m[1] + FRAC[m[2]];
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
    if (FRAC[s] != null) return FRAC[s];
    return parseFloat(s.replace(",", "."));
  }

  function parseIng(str) {
    const m = str.match(QTY_RE);
    if (!m) return { q: null, text: str };
    const q = parseQty(m[1]);
    let rest = str.slice(m[0].length);
    let unit = null;
    for (const [w, u] of unitLookup) {
      if (rest.startsWith(w) && (rest.length === w.length || /[\s,.)]/.test(rest[w.length]))) {
        unit = u; rest = rest.slice(w.length).replace(/^\s+/, ""); break;
      }
    }
    return { q, unit, rest, plainPlural: !/\(s\)|\{[^}]*\|[^}]*\}/.test(rest) };
  }

  const STOP = new Set(["de", "do", "da", "dos", "das", "com", "sem", "em", "para", "ou", "e", "a", "o", "à", "ao", "no", "na"]);
  function inflectWord(w, plural) {
    if (w.length < 3 || /^[A-Z0-9]/.test(w) && w.length < 3) return w;
    if (plural) {
      if (/[aeiouáéíóú]s$|[^aeiou]s$|ões$|ães$/.test(w)) return w;
      if (/ão$/.test(w)) return w.slice(0, -2) + "ões";
      if (/m$/.test(w)) return w.slice(0, -1) + "ns";
      if (/[rz]$/.test(w)) return w + "es";
      if (/l$/.test(w)) return w.slice(0, -1) + "is";
      if (/[aeiouáéíóú]$/.test(w)) return w + "s";
      return w;
    }
    if (/ões$|ães$/.test(w)) return w.slice(0, -3) + "ão";
    if (/ns$/.test(w)) return w.slice(0, -2) + "m";
    if (/[rz]es$/.test(w)) return w.slice(0, -2);
    if (/[aeiouáéíóú]s$/.test(w)) return w.slice(0, -1);
    return w;
  }
  // Ajusta plural das primeiras palavras (até "de", "com", "(" ...)
  function inflectPhrase(text, plural) {
    const parts = text.split(/(\s+)/);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (/^\s+$/.test(p)) continue;
      if (STOP.has(p.toLowerCase()) || /^[(\[,+]/.test(p) || /[,)]$/.test(p) || /\d/.test(p)) break;
      if (/^[A-Z]$/.test(p)) continue;
      parts[i] = inflectWord(p, plural);
    }
    return parts.join("");
  }
  function applyMarkup(text, plural) {
    return text.replace(/\(s\)/g, plural ? "s" : "").replace(/\{([^|}]*)\|([^}]*)\}/g, (_, a, b) => plural ? b : a);
  }

  function roundMetric(v) {
    if (v >= 100) return Math.round(v / 5) * 5;
    if (v >= 20) return Math.round(v);
    return Math.round(v * 10) / 10;
  }
  function fmtDec(v) { return String(v).replace(".", ","); }
  function fmtFrac(v) {
    if (v >= 10) return String(Math.round(v));
    if (v >= 5) { const r = Math.round(v * 2) / 2; return (Math.floor(r) || "") + (r % 1 ? "½" : ""); }
    let whole = Math.floor(v), f = v - whole, best = FRAC_OUT[0];
    for (const o of FRAC_OUT) if (Math.abs(o[0] - f) < Math.abs(best[0] - f)) best = o;
    if (best[0] === 1) { whole += 1; best = FRAC_OUT[0]; }
    if (whole === 0 && !best[1]) return "¼";
    return (whole ? String(whole) : "") + best[1];
  }
  function fmtQty(q, unit) {
    if (unit && unit[2] === "m") {
      let u = unit[0], v = q;
      if (u === "g" && v >= 1000) { u = "kg"; v /= 1000; }
      else if (u === "ml" && v >= 1000) { u = "l"; v /= 1000; }
      else if (u === "cl" && v >= 100) { u = "l"; v /= 100; }
      else if (u === "dl" && v >= 10) { u = "l"; v /= 10; }
      else if (u === "kg" && v < 1) { u = "g"; v *= 1000; }
      else if (u === "l" && v < 1) { u = "ml"; v *= 1000; }
      v = u === "kg" || u === "l" ? Math.round(v * 100) / 100 : roundMetric(v);
      return { n: fmtDec(v), u, plural: v > 1 };
    }
    if (unit && unit[2] === "w") q = Math.max(1, Math.round(q));
    const n = fmtFrac(q);
    const val = parseQty(n.replace(/(\d)([½¼¾⅓⅔])/, "$1 $2")) || q;
    return { n, u: unit ? (val > 1 ? unit[1] : unit[0]) : "", plural: val > 1 };
  }

  function renderIng(str, factor) {
    const p = parseIng(str);
    if (p.q == null) return { html: esc(str), changed: false };
    if (factor === 1) {
      const raw = str.slice(0, str.length - p.rest.length).trim();
      return { html: `<span class="q">${esc(raw)}</span> ${esc(applyMarkup(p.rest, p.q > 1))}`, changed: false };
    }
    const scaled = p.q * factor;
    const f = fmtQty(scaled, p.unit);
    let rest = p.rest;
    const origPlural = p.q > 1;
    if (!p.unit) {
      if (!p.plainPlural) rest = applyMarkup(rest, f.plural);
      else if (origPlural !== f.plural) rest = inflectPhrase(rest, f.plural);
    } else {
      rest = applyMarkup(rest, f.plural);
    }
    const qty = (f.n + (f.u ? " " + f.u : "")).trim();
    return { html: `<span class="q${factor !== 1 ? " changed" : ""}">${esc(qty)}</span> ${esc(rest)}`, changed: factor !== 1 };
  }

  // ───────── Doses ─────────
  const MULTS = [0.5, 1, 1.5, 2, 3, 4];
  function getServ(r) {
    if (state.servings[r.id] != null) return state.servings[r.id];
    return r.s ? r.s[0] : 1;
  }
  function factorOf(r) { return r.s ? getServ(r) / r.s[0] : getServ(r); }
  function stepOf(r) {
    const n = r.s[0];
    if (n >= 100) return n / 2;
    if (n >= 20) return 2;
    return 1;
  }
  function servLabel(r, v) {
    if (!r.s) return { val: "× " + fmtDec(v), unit: v === 1 ? "receita original" : "da receita" };
    const u = r.s[1];
    const one = v === 1;
    const map = { "pessoas": "pessoa", "unidades": "unidade", "porções": "porção", "fatias": "fatia", "doses": "dose", "baguetes": "baguete", "pães": "pão", "barras": "barra", "waffles": "waffle", "sablés": "sablé" };
    const inv = Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a]));
    let unit = u;
    if (one && map[u]) unit = map[u];
    if (!one && inv[u]) unit = inv[u];
    if (!one && !map[u] && !inv[u] && /^(bolo|cake|tarte|pizza|copo grande|forma de 24 cm|tabuleiro 20×30)$/.test(u)) {
      unit = { "bolo": "bolos", "cake": "cakes", "tarte": "tartes", "pizza": "pizzas", "copo grande": "copos grandes", "forma de 24 cm": "formas de 24 cm", "tabuleiro 20×30": "tabuleiros 20×30" }[u];
    }
    return { val: fmtDec(v), unit };
  }

  // ───────── Favoritos ─────────
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    store.set("favs", [...favs]);
  }

  // ───────── Links ─────────
  function driveUrl(f) {
    if (!f) return null;
    return f.startsWith("doc:") ? "https://docs.google.com/document/d/" + f.slice(4) + "/edit" : "https://drive.google.com/file/d/" + f + "/view";
  }

  // ───────── Página inicial ─────────
  function filtered() {
    const q = norm(state.query.trim());
    return RECIPES.filter(r => {
      if (state.cat === "fav" && !favs.has(r.id)) return false;
      if (state.cat !== "all" && state.cat !== "fav" && r.c !== state.cat) return false;
      if (!q) return true;
      const hay = norm([r.t, r.o || "", catById[r.c].name, ...(r.i || [])].join(" "));
      return q.split(/\s+/).every(w => hay.includes(w));
    }).sort((a, b) => a.t.localeCompare(b.t, "pt"));
  }

  function cardHtml(r) {
    const fav = favs.has(r.id);
    return `<a class="card" href="#/receita/${r.id}" style="--thumb: var(--c-${r.c})">
      <div class="thumb"><span aria-hidden="true">${r.e}</span></div>
      <div class="body"><h3>${esc(r.t)}</h3><div class="meta">${esc(r.tm)} · ${esc(r.d)}</div></div>
      <button class="fav-btn" data-fav="${r.id}" aria-pressed="${fav}" aria-label="${fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}">${fav ? I.heart : I.heartO}</button>
    </a>`;
  }

  function renderHome() {
    document.title = "Receitas";
    const counts = {};
    RECIPES.forEach(r => counts[r.c] = (counts[r.c] || 0) + 1);
    const chips = [
      { id: "all", label: "Todas", n: RECIPES.length },
      { id: "fav", label: "❤️ Favoritas", n: favs.size },
      ...CATS.map(c => ({ id: c.id, label: c.emoji + " " + c.name, n: counts[c.id] || 0 }))
    ];
    app.innerHTML = `
      <div class="wrap fade-in">
        <header class="home-head">
          <h1>Receitas</h1>
          <p>${RECIPES.length} receitas da família — ajuste as doses e cozinhe passo a passo.</p>
        </header>
        <div class="search-bar">
          <label class="search">
            ${I.search}
            <span class="visually-hidden">Procurar</span>
            <input id="q" type="search" placeholder="Procurar receita ou ingrediente" value="${esc(state.query)}" autocomplete="off" enterkeyhint="search">
            <button class="clear" id="clear" aria-label="Limpar" ${state.query ? "" : "hidden"}>${I.x}</button>
          </label>
          <div class="chips" role="toolbar" aria-label="Categorias">
            ${chips.map(c => `<button class="chip" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">${esc(c.label)} <span class="n">${c.n}</span></button>`).join("")}
          </div>
        </div>
        <div id="results"></div>
      </div>`;

    const input = app.querySelector("#q");
    const clear = app.querySelector("#clear");
    input.addEventListener("input", () => { state.query = input.value; clear.hidden = !input.value; renderResults(); });
    clear.addEventListener("click", e => { e.preventDefault(); state.query = ""; input.value = ""; clear.hidden = true; renderResults(); input.focus(); });
    app.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
      state.cat = b.dataset.cat; store.set("cat", state.cat);
      app.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
      renderResults();
      window.scrollTo({ top: 0 });
    }));
    const active = app.querySelector('.chip[aria-pressed="true"]');
    if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
    renderResults();
    requestAnimationFrame(() => window.scrollTo(0, state.homeScroll));
  }

  function renderResults() {
    const box = document.getElementById("results");
    if (!box) return;
    const list = filtered();
    if (!list.length) {
      box.innerHTML = state.cat === "fav" && !state.query
        ? `<div class="empty"><div class="big">🤍</div>Ainda não tem favoritas.<br>Toque no coração de uma receita para a guardar aqui.</div>`
        : `<div class="empty"><div class="big">🔍</div>Nenhuma receita encontrada.</div>`;
      return;
    }
    let html = "";
    if (state.cat === "all" && !state.query) {
      CATS.forEach(c => {
        const items = list.filter(r => r.c === c.id);
        if (items.length) html += `<h2 class="section-title">${c.emoji} ${esc(c.name)}</h2><div class="grid">${items.map(cardHtml).join("")}</div>`;
      });
    } else {
      html = `<div class="grid" style="margin-top:14px">${list.map(cardHtml).join("")}</div>`;
    }
    box.innerHTML = html;
    box.querySelectorAll("[data-fav]").forEach(b => b.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation();
      toggleFav(b.dataset.fav);
      const on = favs.has(b.dataset.fav);
      b.setAttribute("aria-pressed", on); b.innerHTML = on ? I.heart : I.heartO;
      const favChip = app.querySelector('.chip[data-cat="fav"] .n'); if (favChip) favChip.textContent = favs.size;
      if (state.cat === "fav") renderResults();
    }));
  }

  // ───────── Receita ─────────
  function renderRecipe(id) {
    const r = byId[id];
    if (!r) { location.hash = "#/"; return; }
    document.title = r.t + " · Receitas";
    const tab = state.tab[id] || "ing";
    const fav = favs.has(id);
    const drive = driveUrl(r.f);

    app.innerHTML = `
      <div class="topbar" id="topbar">
        <button class="icon-btn" id="back" aria-label="Voltar">${I.back}</button>
        <div class="title">${esc(r.t)}</div>
        <div class="actions">
          ${navigator.share ? `<button class="icon-btn" id="share" aria-label="Partilhar">${I.share}</button>` : ""}
          <button class="icon-btn" id="fav" aria-pressed="${fav}" aria-label="Favorita">${fav ? I.heart : I.heartO}</button>
        </div>
      </div>
      <div class="hero" style="--thumb: var(--c-${r.c})"><span aria-hidden="true">${r.e}</span></div>
      <div class="sheet">
        <div class="wrap">
          <h1 class="recipe-title">${esc(r.t)}</h1>
          ${r.o ? `<p class="recipe-orig">${esc(r.o)}</p>` : ""}
          <ul class="facts">
            <li>${I.clock} ${esc(r.tm)}</li>
            <li>${esc(r.d)}</li>
            <li>${catById[r.c].emoji} ${esc(catById[r.c].name)}</li>
          </ul>
          ${r.n ? `<div class="note"><b>💡</b><span>${esc(r.n)}</span></div>` : ""}
          <div class="servings" id="servings"></div>
          <div class="tabs" role="tablist">
            <button role="tab" data-tab="ing" aria-selected="${tab === "ing"}">Ingredientes</button>
            <button role="tab" data-tab="steps" aria-selected="${tab === "steps"}">Preparação · ${r.p.filter(s => !isHead(s)).length}</button>
          </div>
          <div id="panel"></div>
          <div class="source">
            ${r.src ? `<span>Fonte: ${esc(r.src)}</span>` : ""}
            ${drive ? `<a class="drive-link" href="${drive}" target="_blank" rel="noopener">${I.drive} Ver original no Google Drive</a>` : ""}
          </div>
        </div>
      </div>
      <div class="cook-cta"><button id="cook">${I.play} Começar a cozinhar</button></div>`;

    window.scrollTo(0, 0);
    const topbar = document.getElementById("topbar");
    const onScroll = () => topbar.classList.toggle("solid", window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanup = () => window.removeEventListener("scroll", onScroll);

    document.getElementById("back").onclick = goHome;
    document.getElementById("fav").onclick = e => {
      toggleFav(id); const on = favs.has(id);
      e.currentTarget.setAttribute("aria-pressed", on); e.currentTarget.innerHTML = on ? I.heart : I.heartO;
    };
    const share = document.getElementById("share");
    if (share) share.onclick = () => navigator.share({ title: r.t, url: location.href }).catch(() => {});
    document.getElementById("cook").onclick = () => openCook(r, 0);
    app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
      state.tab[id] = b.dataset.tab;
      app.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", x === b));
      renderPanel(r);
      const tabs = app.querySelector(".tabs");
      const top = tabs.getBoundingClientRect().top + window.scrollY - 70;
      if (window.scrollY > top) window.scrollTo({ top });
    });
    renderServings(r);
    renderPanel(r);
  }

  function renderServings(r) {
    const box = document.getElementById("servings");
    const v = getServ(r);
    const lab = servLabel(r, v);
    const base = r.s ? r.s[0] : 1;
    const changed = v !== base;
    let canDown;
    if (r.s) canDown = v - stepOf(r) >= Math.min(1, base);
    else canDown = MULTS.indexOf(v) > 0;
    const canUp = r.s ? true : MULTS.indexOf(v) < MULTS.length - 1;
    box.innerHTML = `
      <div>
        <div class="lbl">${r.s ? "Quantidade para" : "Quantidade"}</div>
        <div class="val">${lab.val}<small>${esc(lab.unit)}</small></div>
        ${changed ? `<button class="reset" id="reset">Repor ${r.s ? base + " " + esc(servLabel(r, base).unit) : "receita original"}</button>` : ""}
      </div>
      <div class="stepper">
        <button id="minus" aria-label="Menos" ${canDown ? "" : "disabled"}>−</button>
        <button id="plus" aria-label="Mais" ${canUp ? "" : "disabled"}>+</button>
      </div>`;
    const set = nv => { state.servings[r.id] = nv; renderServings(r); renderPanel(r); };
    box.querySelector("#minus").onclick = () => {
      if (r.s) set(Math.max(Math.min(1, base), v - stepOf(r)));
      else set(MULTS[Math.max(0, MULTS.indexOf(v) - 1)]);
    };
    box.querySelector("#plus").onclick = () => {
      if (r.s) set(v + stepOf(r));
      else set(MULTS[Math.min(MULTS.length - 1, MULTS.indexOf(v) + 1)]);
    };
    const reset = box.querySelector("#reset");
    if (reset) reset.onclick = () => set(base);
  }

  function ingListHtml(r, interactive) {
    const factor = factorOf(r);
    const checked = state.checked[r.id] || new Set();
    let out = '<ul class="ing-list">';
    r.i.forEach((s, idx) => {
      if (isHead(s)) { out += `<li class="ing-head">${esc(s.slice(2))}</li>`; return; }
      const x = renderIng(s, factor);
      const done = interactive && checked.has(idx);
      out += `<li class="ing${done ? " done" : ""}" data-i="${idx}" ${interactive ? 'role="checkbox" aria-checked="' + done + '" tabindex="0"' : ""}>
        ${interactive ? `<span class="box">${I.check}</span>` : ""}<span class="txt">${x.html}</span></li>`;
    });
    return out + "</ul>";
  }

  function renderPanel(r) {
    const panel = document.getElementById("panel");
    const tab = state.tab[r.id] || "ing";
    if (tab === "ing") {
      panel.innerHTML = ingListHtml(r, true);
      panel.querySelectorAll(".ing").forEach(li => {
        const toggle = () => {
          const set = state.checked[r.id] || (state.checked[r.id] = new Set());
          const i = +li.dataset.i;
          set.has(i) ? set.delete(i) : set.add(i);
          li.classList.toggle("done", set.has(i)); li.setAttribute("aria-checked", set.has(i));
        };
        li.onclick = toggle;
        li.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } };
      });
    } else {
      const done = state.stepsDone[r.id] || new Set();
      let n = 0, html = '<ol class="step-list">';
      r.p.forEach((s, idx) => {
        if (isHead(s)) { html += `<li class="step-head">${esc(s.slice(2))}</li>`; return; }
        n++;
        html += `<li class="step${done.has(idx) ? " done" : ""}" data-s="${idx}"><span class="num">${done.has(idx) ? I.check : n}</span><p>${esc(s)}</p></li>`;
      });
      panel.innerHTML = html + "</ol>";
      panel.querySelectorAll(".step").forEach(li => li.onclick = () => {
        const set = state.stepsDone[r.id] || (state.stepsDone[r.id] = new Set());
        const i = +li.dataset.s;
        set.has(i) ? set.delete(i) : set.add(i);
        renderPanel(r);
      });
    }
  }

  // ───────── Modo cozinha ─────────
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* sem suporte */ }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && document.querySelector(".cook")) keepAwake(true);
  });

  function stepsOf(r) {
    const out = []; let section = "";
    r.p.forEach((s, idx) => { if (isHead(s)) section = s.slice(2); else out.push({ text: s, section, idx }); });
    return out;
  }

  function findTimers(text) {
    const found = [];
    const re = /(\d+(?:[.,]\d+)?)\s*(?:a\s*\d+(?:[.,]\d+)?\s*)?(horas?|h(?![a-zà-ú])|minutos?|min(?![a-z]))(?:\s*(\d{1,2})(?!\s*°))?/gi;
    let m;
    while ((m = re.exec(text))) {
      let secs = parseFloat(m[1].replace(",", ".")) * (/^h/i.test(m[2]) ? 3600 : 60);
      if (/^h/i.test(m[2]) && m[3]) secs += +m[3] * 60;
      if (secs >= 60 && secs <= 12 * 3600 && !found.some(f => f.secs === secs)) found.push({ secs, label: m[0].trim() });
    }
    return found;
  }

  let cookEl = null;
  function openCook(r, start) {
    const steps = stepsOf(r);
    let i = start;
    keepAwake(true);
    cookEl = document.createElement("div");
    cookEl.className = "cook";
    cookEl.setAttribute("role", "dialog");
    cookEl.setAttribute("aria-label", "Modo cozinha");
    document.body.appendChild(cookEl);
    document.body.style.overflow = "hidden";
    history.pushState({ cook: true }, "", location.hash);

    const draw = () => {
      const last = i >= steps.length;
      const pct = Math.round((Math.min(i + 1, steps.length) / steps.length) * 100);
      let body;
      if (last) {
        body = `<div class="cook-done"><div class="big">🎉</div><p class="cook-text">Bom apetite!</p><p style="color:var(--ink-2)">Terminou todos os passos de ${esc(r.t)}.</p></div>`;
      } else {
        const s = steps[i];
        const timers = findTimers(s.text);
        body = `<div class="cook-count">Passo ${i + 1} de ${steps.length}</div>
          ${s.section ? `<div class="cook-section">${esc(s.section)}</div>` : ""}
          <p class="cook-text">${esc(s.text)}</p>
          ${timers.length ? `<div class="cook-timers">${timers.map(t => `<button class="timer-btn" data-secs="${t.secs}" data-label="${esc(t.label)}">${I.clock} Temporizador ${esc(t.label)}</button>`).join("")}</div>` : ""}`;
      }
      cookEl.innerHTML = `
        <div class="cook-top">
          <button class="icon-btn" id="cclose" aria-label="Fechar">${I.x}</button>
          <div class="name">${esc(r.t)}</div>
        </div>
        <div class="progress"><i style="width:${last ? 100 : pct}%"></i></div>
        <div class="cook-body">${body}</div>
        <button class="cook-ing-btn" id="cing">${I.list} Ver ingredientes</button>
        <div class="cook-nav">
          <button class="prev" id="cprev" ${i === 0 ? "disabled" : ""}>${I.prev} Anterior</button>
          ${last ? `<button class="next" id="cfinish">Fechar</button>` : `<button class="next" id="cnext">${i === steps.length - 1 ? "Concluir" : "Seguinte"} ${I.next}</button>`}
        </div>`;
      cookEl.querySelector("#cclose").onclick = () => history.back();
      cookEl.querySelector("#cprev").onclick = () => { if (i > 0) { i--; draw(); } };
      const nx = cookEl.querySelector("#cnext");
      if (nx) nx.onclick = () => {
        const set = state.stepsDone[r.id] || (state.stepsDone[r.id] = new Set());
        set.add(steps[i].idx); i++; draw();
      };
      const fin = cookEl.querySelector("#cfinish");
      if (fin) fin.onclick = () => history.back();
      cookEl.querySelector("#cing").onclick = () => openIngDrawer(r);
      cookEl.querySelectorAll(".timer-btn").forEach(b => b.onclick = () => startTimer(+b.dataset.secs, r.t + " · " + b.dataset.label));
    };
    draw();

    // Deslizar para mudar de passo
    let x0 = null, y0 = null;
    cookEl.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    cookEl.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && i < steps.length) { const b = cookEl.querySelector("#cnext"); if (b) b.click(); }
        if (dx > 0 && i > 0) { i--; draw(); }
      }
      x0 = null;
    });
  }

  function closeCook() {
    if (!cookEl) return;
    cookEl.remove(); cookEl = null;
    closeDrawer();
    document.body.style.overflow = "";
    keepAwake(false);
    const panel = document.getElementById("panel");
    const r = currentRecipe && byId[currentRecipe];
    if (panel && r) renderPanel(r);
  }

  let drawerEls = null;
  function openIngDrawer(r) {
    const bg = document.createElement("div"); bg.className = "drawer-bg";
    const d = document.createElement("div"); d.className = "drawer";
    const v = getServ(r); const lab = servLabel(r, v);
    d.innerHTML = `<div class="grab"></div><h2>Ingredientes</h2><div style="color:var(--ink-2);font-size:14px">${lab.val} ${esc(lab.unit)}</div>${ingListHtml(r, false)}`;
    document.body.append(bg, d);
    drawerEls = [bg, d];
    bg.onclick = closeDrawer;
  }
  function closeDrawer() { if (drawerEls) { drawerEls.forEach(e => e.remove()); drawerEls = null; } }

  // ───────── Temporizadores ─────────
  const timersBox = document.getElementById("timers");
  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, .35, .7].forEach(t => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
        g.gain.setValueAtTime(.001, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(.4, audioCtx.currentTime + t + .02);
        g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + t + .3);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + .32);
      });
    } catch (e) { /* sem áudio */ }
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  }
  function startTimer(secs, label) {
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch (e) { /* */ }
    const end = Date.now() + secs * 1000;
    const el = document.createElement("div");
    el.className = "timer";
    el.innerHTML = `<span class="t"></span><small>${esc(label)}</small><button aria-label="Parar">${I.x}</button>`;
    timersBox.appendChild(el);
    let rang = false, iv;
    const tick = () => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      const h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
      el.querySelector(".t").textContent = (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
      if (!left && !rang) { rang = true; el.classList.add("ring"); el.querySelector(".t").textContent = "Pronto!"; beep(); clearInterval(iv); iv = setInterval(beep, 4000); }
    };
    tick(); iv = setInterval(tick, 500);
    el.querySelector("button").onclick = () => { clearInterval(iv); el.remove(); };
  }

  // ───────── Navegação ─────────
  let cleanup = null;
  let currentRecipe = null;
  function goHome() {
    if (history.state && history.state.fromHome) history.back();
    else location.hash = "#/";
  }
  function route() {
    if (cookEl) { closeCook(); return; }
    if (cleanup) { cleanup(); cleanup = null; }
    const m = location.hash.match(/^#\/receita\/([\w-]+)/);
    if (m) {
      currentRecipe = m[1];
      renderRecipe(m[1]);
    } else {
      currentRecipe = null;
      renderHome();
    }
  }
  document.addEventListener("click", e => {
    const a = e.target.closest('a.card');
    if (a && !e.defaultPrevented) {
      e.preventDefault();
      state.homeScroll = window.scrollY;
      history.pushState({ fromHome: true }, "", a.getAttribute("href"));
      route();
    }
  });
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);
  route();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
