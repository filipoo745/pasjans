/* Pasjans (Klondike) – logika gry */
(() => {
  'use strict';

  const { themes: THEMES, patterns: PATTERNS, fonts: FONTS } = window.SolitaireThemes;

  const SUITS = ['S', 'H', 'D', 'C'];
  const SYM = { S: '♠︎', H: '♥︎', D: '♦︎', C: '♣︎' };
  const LABEL = [null, 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const PIPS = {
    2: [[50, 0], [50, 100]],
    3: [[50, 0], [50, 50], [50, 100]],
    4: [[25, 0], [75, 0], [25, 100], [75, 100]],
    5: [[25, 0], [75, 0], [50, 50], [25, 100], [75, 100]],
    6: [[25, 0], [75, 0], [25, 50], [75, 50], [25, 100], [75, 100]],
    7: [[25, 0], [75, 0], [50, 25], [25, 50], [75, 50], [25, 100], [75, 100]],
    8: [[25, 0], [75, 0], [50, 25], [25, 50], [75, 50], [50, 75], [25, 100], [75, 100]],
    9: [[25, 0], [75, 0], [25, 33.3], [75, 33.3], [50, 50], [25, 66.7], [75, 66.7], [25, 100], [75, 100]],
    10: [[25, 0], [75, 0], [50, 16.7], [25, 33.3], [75, 33.3], [25, 66.7], [75, 66.7], [50, 83.3], [25, 100], [75, 100]],
  };
  const COLOR_FIELDS = [
    ['--bg-1', 'Stół – środek'], ['--bg-2', 'Stół – brzegi'],
    ['--card-face', 'Karta'], ['--card-border', 'Ramka karty'],
    ['--red', 'Kier / karo'], ['--black', 'Pik / trefl'],
    ['--back-1', 'Rewers – tło'], ['--back-2', 'Rewers – wzór'],
    ['--back-border', 'Rewers – ramka'], ['--accent', 'Akcent'],
    ['--blue', 'Karo (4 kolory)'], ['--green', 'Trefl (4 kolory)'],
  ];
  const ANIM_MS = 260;
  const LS = { game: 'pasjans.game.v1', settings: 'pasjans.settings.v1', stats: 'pasjans.stats.v1' };

  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const board = $('#board');
  const autoBtn = $('#btn-auto');

  const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* brak dostępu */ } };

  let settings = Object.assign(
    { theme: 'classic', overrides: {}, backPattern: null, fourColor: false, draw: 1, anim: true },
    load(LS.settings, {}));
  let stats = Object.assign({ played: 0, won: 0, best: null }, load(LS.stats, {}));
  const saveSettings = () => store(LS.settings, settings);

  let S = null;          // stan gry
  let history = [];      // migawki do cofania
  let L = null;          // układ (rozmiary, pozycje)
  let drag = null;
  let busy = false;
  const els = {};        // id karty -> element DOM
  const slots = {};

  /* ================= losowanie ================= */
  function randInt(n) {
    if (window.crypto && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      const lim = Math.floor(4294967296 / n) * n; // bez przekłamań modulo
      let x;
      do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= lim);
      return x % n;
    }
    return Math.floor(Math.random() * n);
  }
  function shuffle(a) { // Fisher–Yates
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ================= motywy ================= */
  const currentTheme = () => THEMES.find((t) => t.id === settings.theme) || THEMES[0];
  const themeVars = () => ({ ...currentTheme().vars, ...settings.overrides });
  const patternId = () => settings.backPattern || currentTheme().backPattern;

  function applyVars(el, vars, pid) {
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    const p = (PATTERNS[pid] || PATTERNS.solid).css(vars['--back-1'], vars['--back-2']);
    el.style.setProperty('--back-image', p.image);
    el.style.setProperty('--back-size', p.size || 'auto');
  }
  function applyTheme() {
    root.removeAttribute('style');
    applyVars(root, themeVars(), patternId());
    root.classList.toggle('four-color', !!settings.fourColor);
    board.classList.toggle('anim-off', !settings.anim);
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = themeVars()['--bg-2'];
    markActiveTheme();
  }

  /* ================= DOM ================= */
  function buildCards() {
    for (const s of SUITS) {
      for (let r = 1; r <= 13; r++) {
        const sym = SYM[s], lab = LABEL[r];
        let center;
        if (r === 1) center = `<div class="ace">${sym}</div>`;
        else if (r > 10) center = `<div class="court"><span class="big">${lab}</span><span class="s">${sym}</span></div>`;
        else center = `<div class="pips">${PIPS[r].map(([x, y]) =>
          `<span class="pip${y > 50 ? ' flip' : ''}" style="left:${x}%;top:${y}%">${sym}</span>`).join('')}</div>`;
        const corner = (cls) => `<div class="corner${cls}"><span class="r">${lab}</span><span class="s">${sym}</span></div>`;
        const el = document.createElement('div');
        el.className = 'card down';
        el.dataset.id = s + r;
        el.dataset.suit = s;
        el.innerHTML = `<div class="card-inner"><div class="face">${corner('')}${center}<div class="mid">${sym}</div>${corner(' br')}</div><div class="back"></div></div>`;
        board.appendChild(el);
        els[s + r] = el;
      }
    }
  }
  function mkSlot(cls, label) {
    const el = document.createElement('div');
    el.className = 'slot ' + cls;
    el.innerHTML = label ? `<span>${label}</span>` : '';
    board.appendChild(el);
    return el;
  }
  function buildSlots() {
    slots.stock = mkSlot('slot-stock', '↻');
    slots.waste = mkSlot('slot-waste', '');
    slots.found = [0, 1, 2, 3].map(() => mkSlot('slot-found', 'A'));
    slots.tab = [0, 1, 2, 3, 4, 5, 6].map(() => mkSlot('slot-tab', 'K'));
  }

  /* ================= układ ================= */
  function computeLayout() {
    const W = board.clientWidth, H = board.clientHeight;
    let cw = Math.min(112, (W - 8) / 7.8, H / 4.1);
    cw = Math.max(30, Math.floor(cw));
    const ch = Math.round(cw * 1.4);
    const g = Math.max(4, Math.round(cw * 0.1));
    const x0 = Math.round((W - (7 * cw + 6 * g)) / 2);
    L = { W, H, cw, ch, g, top: Math.max(6, g), colX: Array.from({ length: 7 }, (_, i) => x0 + i * (cw + g)) };
    L.tabY = L.top + ch + Math.round(g * 1.8);
    board.style.setProperty('--cw', cw + 'px');
    board.style.setProperty('--ch', ch + 'px');
    document.body.classList.toggle('compact', cw < 66);
  }
  function tabYs(i) {
    const col = S.tab[i], ys = [];
    if (!col.length) return ys;
    const down = L.ch * 0.12;
    const up = L.ch * (L.cw < 66 ? 0.3 : 0.27);
    let total = 0;
    for (let k = 0; k < col.length - 1; k++) total += col[k].up ? up : down;
    const avail = L.H - L.tabY - L.ch - L.g;
    const f = total > avail && total > 0 ? Math.max(0.15, avail / total) : 1;
    let y = L.tabY;
    for (let k = 0; k < col.length; k++) { ys.push(y); y += (col[k].up ? up : down) * f; }
    return ys;
  }

  /* ================= rysowanie ================= */
  function posSlot(el, x, y) { el.style.transform = `translate3d(${x}px,${y}px,0)`; }

  function place(c, x, y, z, opt) {
    const el = els[c.id];
    el.classList.toggle('down', !c.up);
    x = Math.round(x); y = Math.round(y);
    if (opt.delay) {
      const d = opt.delay(c) + 'ms';
      el.style.transitionDelay = d;
      el.firstChild.style.transitionDelay = d;
    }
    const pos = x + ',' + y;
    if (el._pos !== pos) {
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      el._x = x; el._y = y;
      clearTimeout(el._zt); el._zt = null;
      if (el._pos != null && !opt.instant && settings.anim) {
        // w locie karta jest nad wszystkim
        el.style.zIndex = 1000 + z;
        el._zt = setTimeout(() => { el.style.zIndex = z; el._zt = null; }, ANIM_MS + 60);
      } else {
        el.style.zIndex = z;
      }
      el._pos = pos;
    } else if (!el._zt) {
      el.style.zIndex = z;
    }
  }

  function render(opt = {}) {
    if (!S || !L) return;
    if (opt.instant) board.classList.add('no-anim');

    posSlot(slots.stock, L.colX[0], L.top);
    posSlot(slots.waste, L.colX[1], L.top);
    slots.found.forEach((s, i) => posSlot(s, L.colX[3 + i], L.top));
    slots.tab.forEach((s, i) => posSlot(s, L.colX[i], L.tabY));

    S.stock.forEach((c, k) => place(c, L.colX[0], L.top, 10 + k, opt));
    const n = S.waste.length, fan = S.draw === 3 ? 3 : 1, step = Math.round(L.cw * 0.26);
    const hidden = Math.max(0, n - fan);
    S.waste.forEach((c, k) => place(c, L.colX[1] + Math.max(0, k - hidden) * step, L.top, 100 + k, opt));
    S.found.forEach((f, i) => f.forEach((c, k) => place(c, L.colX[3 + i], L.top, 200 + k, opt)));
    S.tab.forEach((col, i) => {
      const ys = tabYs(i);
      col.forEach((c, k) => place(c, L.colX[i], ys[k], 300 + k, opt));
    });

    if (opt.instant) {
      void board.offsetWidth;
      requestAnimationFrame(() => board.classList.remove('no-anim'));
    }
    updateHUD();
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function updateHUD() {
    $('#time').textContent = fmt(S.elapsed);
    $('#moves').textContent = S.moves;
    $('#score').textContent = S.score;
    $('#btn-undo').disabled = !history.length || busy;
    autoBtn.hidden = busy || !canAuto();
  }

  /* ================= zasady ================= */
  const isRed = (c) => c.suit === 'H' || c.suit === 'D';

  function pile(type, i) {
    if (type === 'stock') return S.stock;
    if (type === 'waste') return S.waste;
    if (type === 'found') return S.found[i];
    return S.tab[i];
  }
  function findCard(id) {
    let k = S.stock.findIndex((c) => c.id === id);
    if (k >= 0) return { type: 'stock', i: 0, index: k };
    k = S.waste.findIndex((c) => c.id === id);
    if (k >= 0) return { type: 'waste', i: 0, index: k };
    for (let i = 0; i < 4; i++) {
      k = S.found[i].findIndex((c) => c.id === id);
      if (k >= 0) return { type: 'found', i, index: k };
    }
    for (let i = 0; i < 7; i++) {
      k = S.tab[i].findIndex((c) => c.id === id);
      if (k >= 0) return { type: 'tab', i, index: k };
    }
    return null;
  }
  function canDrop(cards, dst) {
    const first = cards[0];
    const p = pile(dst.type, dst.i);
    const top = p[p.length - 1];
    if (dst.type === 'found') {
      if (cards.length !== 1) return false;
      return top ? top.suit === first.suit && top.rank + 1 === first.rank : first.rank === 1;
    }
    if (dst.type === 'tab') {
      if (!top) return first.rank === 13;
      return top.up && isRed(top) !== isRed(first) && top.rank === first.rank + 1;
    }
    return false;
  }

  /* ================= ruchy ================= */
  function pushHistory() {
    history.push(JSON.stringify(S));
    if (history.length > 400) history.shift();
  }
  function save() { store(LS.game, S); }

  function drawStock() {
    if (busy || S.won) return;
    if (!S.stock.length && !S.waste.length) return;
    pushHistory();
    S.started = true;
    if (S.stock.length) {
      const n = Math.min(S.draw, S.stock.length);
      for (let k = 0; k < n; k++) { const c = S.stock.pop(); c.up = true; S.waste.push(c); }
    } else {
      while (S.waste.length) { const c = S.waste.pop(); c.up = false; S.stock.push(c); }
      if (S.draw === 1) S.score = Math.max(0, S.score - 100);
    }
    S.moves++;
    afterMove();
  }

  function doMove(src, dst) {
    pushHistory();
    S.started = true;
    const from = pile(src.type, src.i);
    const moving = from.splice(src.index);
    pile(dst.type, dst.i).push(...moving);

    if (dst.type === 'found' && src.type !== 'found') S.score += 10;
    if (dst.type === 'tab' && src.type === 'waste') S.score += 5;
    if (dst.type === 'tab' && src.type === 'found') S.score = Math.max(0, S.score - 15);
    if (src.type === 'tab') {
      const t = from[from.length - 1];
      if (t && !t.up) { t.up = true; S.score += 5; }
    }
    S.moves++;
    afterMove();
  }

  function afterMove() {
    save();
    render();
    checkWin();
  }

  // Kliknięcie: najlepszy sensowny ruch dla karty / stosu
  function autoMove(src) {
    const cards = pile(src.type, src.i).slice(src.index);
    if (cards.length === 1 && src.type !== 'found') {
      for (let f = 0; f < 4; f++) {
        if (canDrop(cards, { type: 'found', i: f })) { doMove(src, { type: 'found', i: f }); return true; }
      }
    }
    const cols = [0, 1, 2, 3, 4, 5, 6].filter((i) => !(src.type === 'tab' && i === src.i));
    const nonEmpty = cols.filter((i) => S.tab[i].length);
    const empty = cols.filter((i) => !S.tab[i].length);
    // król na dnie kolumny nie musi się przenosić na inną pustą
    const targets = src.type === 'tab' && src.index === 0 ? nonEmpty : nonEmpty.concat(empty);
    for (const i of targets) {
      if (canDrop(cards, { type: 'tab', i })) { doMove(src, { type: 'tab', i }); return true; }
    }
    return false;
  }

  function undo() {
    if (busy || !history.length) return;
    const elapsed = S.elapsed;
    S = JSON.parse(history.pop());
    S.elapsed = elapsed;
    S.started = true;
    $('#win').hidden = true;
    save();
    render();
  }

  const canAuto = () => !S.won && !S.stock.length && !S.waste.length && S.tab.every((col) => col.every((c) => c.up)) &&
    S.tab.some((col) => col.length);

  function autoComplete() {
    if (busy) return;
    busy = true;
    const step = () => {
      let best = null;
      for (let i = 0; i < 7; i++) {
        const col = S.tab[i];
        if (!col.length) continue;
        const c = col[col.length - 1];
        for (let f = 0; f < 4; f++) {
          if (canDrop([c], { type: 'found', i: f })) {
            if (!best || c.rank < best.rank) best = { rank: c.rank, src: { type: 'tab', i, index: col.length - 1 }, dst: { type: 'found', i: f } };
            break;
          }
        }
      }
      if (!best) { busy = false; updateHUD(); return; }
      doMove(best.src, best.dst);
      if (S.won) { busy = false; updateHUD(); return; }
      setTimeout(step, settings.anim ? 90 : 5);
    };
    step();
  }

  /* ================= podpowiedź ================= */
  function findHint() {
    const tops = [];
    if (S.waste.length) tops.push({ type: 'waste', i: 0, index: S.waste.length - 1 });
    S.tab.forEach((col, i) => { if (col.length) tops.push({ type: 'tab', i, index: col.length - 1 }); });
    for (const src of tops) {
      const c = pile(src.type, src.i)[src.index];
      for (let f = 0; f < 4; f++) if (canDrop([c], { type: 'found', i: f })) return { src, dst: { type: 'found', i: f } };
    }
    for (let i = 0; i < 7; i++) {
      const col = S.tab[i];
      const idx = col.findIndex((c) => c.up);
      if (idx < 0) continue;
      const cards = col.slice(idx);
      for (let j = 0; j < 7; j++) {
        if (j === i || (!S.tab[j].length && idx === 0)) continue;
        if (canDrop(cards, { type: 'tab', i: j })) return { src: { type: 'tab', i, index: idx }, dst: { type: 'tab', i: j } };
      }
    }
    if (S.waste.length) {
      const c = S.waste[S.waste.length - 1];
      for (let j = 0; j < 7; j++) {
        if (canDrop([c], { type: 'tab', i: j })) return { src: { type: 'waste', i: 0, index: S.waste.length - 1 }, dst: { type: 'tab', i: j } };
      }
    }
    if (S.stock.length || S.waste.length) return { stock: true };
    return null;
  }
  function flash(el) {
    el.classList.remove('hint');
    void el.offsetWidth;
    el.classList.add('hint');
    setTimeout(() => el.classList.remove('hint'), 1300);
  }
  function hint() {
    if (busy || S.won) return;
    const h = findHint();
    if (!h) { toast('Brak dostępnych ruchów – spróbuj nowej gry'); return; }
    if (h.stock) {
      flash(S.stock.length ? els[S.stock[S.stock.length - 1].id] : slots.stock);
      toast(S.stock.length ? 'Dobierz kartę ze stosu' : 'Przełóż stos i dobieraj dalej');
      return;
    }
    pile(h.src.type, h.src.i).slice(h.src.index).forEach((c) => flash(els[c.id]));
    const d = pile(h.dst.type, h.dst.i);
    flash(d.length ? els[d[d.length - 1].id] : (h.dst.type === 'found' ? slots.found[h.dst.i] : slots.tab[h.dst.i]));
  }

  /* ================= nowa gra ================= */
  function newGame() {
    const deck = [];
    for (const s of SUITS) for (let r = 1; r <= 13; r++) deck.push({ id: s + r, suit: s, rank: r, up: false });
    shuffle(deck);

    S = { stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []],
      score: 0, moves: 0, elapsed: 0, started: false, won: false, draw: settings.draw };
    const order = {};
    let n = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const c = deck.pop();
        if (j === i) c.up = true;
        S.tab[j].push(c);
        order[c.id] = n++;
      }
    }
    while (deck.length) S.stock.push(deck.pop());
    history = [];
    stats.played++;
    store(LS.stats, stats);
    $('#win').hidden = true;

    // wszystkie karty na stos, potem rozdanie
    board.classList.add('no-anim');
    const sx = L.colX[0], sy = L.top;
    Object.values(els).forEach((el, k) => {
      el.classList.add('down');
      el.style.transform = `translate3d(${sx}px,${sy}px,0)`;
      el._x = sx; el._y = sy; el._pos = sx + ',' + sy;
      clearTimeout(el._zt); el._zt = null;
      el.style.zIndex = 10 + k;
    });
    void board.offsetWidth;
    board.classList.remove('no-anim');

    if (settings.anim) {
      busy = true;
      render({ delay: (c) => (order[c.id] != null ? order[c.id] * 28 : 0) });
      setTimeout(() => {
        Object.values(els).forEach((el) => { el.style.transitionDelay = ''; el.firstChild.style.transitionDelay = ''; });
        busy = false;
        updateHUD();
      }, 28 * 28 + ANIM_MS + 80);
    } else {
      render({ instant: true });
    }
    save();
  }

  function validSave(s) {
    try {
      const all = [...s.stock, ...s.waste, ...s.found.flat(), ...s.tab.flat()];
      return all.length === 52 && new Set(all.map((c) => c.id)).size === 52 && s.tab.length === 7;
    } catch { return false; }
  }

  /* ================= wygrana ================= */
  function checkWin() {
    if (S.won || !S.found.every((f) => f.length === 13)) return;
    S.won = true;
    stats.won++;
    if (!stats.best || S.elapsed < stats.best) stats.best = S.elapsed;
    store(LS.stats, stats);
    save();
    updateHUD();
    setTimeout(() => {
      $('#win-stats').innerHTML =
        `Czas: <b>${fmt(S.elapsed)}</b> · Ruchy: <b>${S.moves}</b> · Punkty: <b>${S.score}</b><br>` +
        `Wygrane: ${stats.won} z ${stats.played}` + (stats.best ? ` · Rekord: ${fmt(stats.best)}` : '');
      $('#win').hidden = false;
      confetti();
    }, ANIM_MS + 200);
  }

  function confetti() {
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = innerWidth, h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr; cv.hidden = false;
    const v = themeVars();
    const cols = [v['--accent'], v['--red'], v['--black'], v['--back-2'], v['--back-1'], v['--card-face']];
    const ps = Array.from({ length: 180 }, () => ({
      x: Math.random() * w, y: -20 - Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: cols[(Math.random() * cols.length) | 0],
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t - t0 < 4500) requestAnimationFrame(frame); else cv.hidden = true;
    })(t0);
  }

  /* ================= przeciąganie ================= */
  function onDown(e) {
    if (busy || drag || S.won) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const cardEl = e.target.closest('.card');
    if (!cardEl) {
      if (e.target.closest('.slot-stock')) drawStock();
      return;
    }
    const loc = findCard(cardEl.dataset.id);
    if (!loc) return;
    if (loc.type === 'stock') { drawStock(); return; }
    const p = pile(loc.type, loc.i);
    if (!p[loc.index].up) return;
    if (loc.type !== 'tab' && loc.index !== p.length - 1) return;
    const cards = p.slice(loc.index);
    drag = { loc, cards, els: cards.map((c) => els[c.id]), sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false, id: e.pointerId };
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      drag.els.forEach((el, k) => {
        el.classList.add('dragging');
        clearTimeout(el._zt); el._zt = null;
        el.style.zIndex = 5000 + k;
      });
    }
    drag.dx = dx; drag.dy = dy;
    drag.els.forEach((el) => { el.style.transform = `translate3d(${el._x + dx}px,${el._y + dy}px,0)`; });
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.moved) {
      if (!autoMove(d.loc)) shake(d.els[0]);
      return;
    }
    d.els.forEach((el) => { el.classList.remove('dragging'); el._pos = 'drag'; });
    const dst = findDrop(d);
    if (dst) doMove(d.loc, dst); else render();
  }
  function onCancel(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    d.els.forEach((el) => { el.classList.remove('dragging'); el._pos = 'drag'; });
    render();
  }
  function findDrop(d) {
    const x = d.els[0]._x + d.dx, y = d.els[0]._y + d.dy, w = L.cw, h = L.ch;
    let best = null, bestA = 0;
    const test = (dst, rx, ry, rw, rh) => {
      if (dst.type === d.loc.type && dst.i === d.loc.i) return;
      const ox = Math.min(x + w, rx + rw) - Math.max(x, rx);
      const oy = Math.min(y + h, ry + rh) - Math.max(y, ry);
      if (ox <= 0 || oy <= 0) return;
      const a = ox * oy;
      if (a > bestA && canDrop(d.cards, dst)) { bestA = a; best = dst; }
    };
    for (let f = 0; f < 4; f++) test({ type: 'found', i: f }, L.colX[3 + f], L.top, w, h);
    for (let t = 0; t < 7; t++) {
      const ys = tabYs(t);
      const bottom = ys.length ? ys[ys.length - 1] + h : L.tabY + h;
      test({ type: 'tab', i: t }, L.colX[t], L.tabY, w, bottom - L.tabY);
    }
    return best;
  }
  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 520);
  }

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ================= panel ustawień ================= */
  const toHex = (v) => {
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map((ch) => ch + ch).join('');
    return '#000000';
  };

  function buildSettings() {
    const list = $('#theme-list');
    THEMES.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'theme-tile';
      b.dataset.id = t.id;
      applyVars(b, t.vars, t.backPattern);
      b.innerHTML = `<div class="tile-preview">
          <div class="mini mini-back"></div>
          <div class="mini mini-face" style="color:var(--red)">A<br>${SYM.H}</div>
          <div class="mini mini-face" style="color:var(--black)">K<br>${SYM.S}</div>
        </div><div class="name"><span>${t.name}</span><span class="mod"></span></div>`;
      b.onclick = () => {
        settings.theme = t.id;
        settings.overrides = {};
        settings.backPattern = null;
        saveSettings(); applyTheme(); syncSettings();
      };
      list.appendChild(b);
    });

    const cc = $('#custom-colors');
    cc.innerHTML = COLOR_FIELDS.map(([k, label]) =>
      `<label class="color"><input type="color" data-var="${k}"><span>${label}</span></label>`).join('');
    cc.addEventListener('input', (e) => {
      const k = e.target.dataset.var;
      if (!k) return;
      settings.overrides[k] = e.target.value;
      saveSettings(); applyTheme();
    });

    const ps = $('#opt-pattern');
    ps.innerHTML = Object.entries(PATTERNS).map(([id, p]) => `<option value="${id}">${p.name}</option>`).join('');
    ps.onchange = () => { settings.backPattern = ps.value; saveSettings(); applyTheme(); };

    const fs = $('#opt-font');
    fs.innerHTML = FONTS.map((f, i) => `<option value="${i}">${f.name}</option>`).join('');
    fs.onchange = () => { settings.overrides['--font-card'] = FONTS[fs.value].value; saveSettings(); applyTheme(); };

    const rad = $('#opt-radius');
    rad.oninput = () => { settings.overrides['--card-radius'] = rad.value + 'em'; saveSettings(); applyTheme(); };

    $('#opt-four').onchange = (e) => { settings.fourColor = e.target.checked; saveSettings(); applyTheme(); };
    $('#opt-anim').onchange = (e) => { settings.anim = e.target.checked; saveSettings(); applyTheme(); };

    $('#draw-seg').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const n = +b.dataset.draw;
      if (n === settings.draw) return;
      if (S.moves > 0 && !S.won && !confirm('Zmiana trybu zacznie nową grę. Kontynuować?')) return;
      settings.draw = n;
      saveSettings(); syncSettings();
      newGame();
    });

    $('#btn-reset-custom').onclick = () => {
      settings.overrides = {}; settings.backPattern = null; settings.fourColor = false;
      saveSettings(); applyTheme(); syncSettings();
    };
    $('#btn-export').onclick = () => {
      const t = currentTheme();
      const obj = { id: 'moj-motyw', name: 'Mój motyw', backPattern: patternId(), vars: themeVars() };
      const txt = JSON.stringify(obj, null, 2) + ',';
      const box = $('#export-box');
      box.value = txt;
      box.hidden = false;
      box.select();
      const done = () => toast('Skopiowano! Wklej do js/themes.js (lista themes)');
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => toast('Zaznaczone – skopiuj Ctrl/⌘+C'));
      else toast('Zaznaczone – skopiuj Ctrl/⌘+C');
      void t;
    };

    $('#btn-settings').onclick = openSettings;
    $('#close-settings').onclick = closeSettings;
    $('#overlay').onclick = closeSettings;
  }

  function syncSettings() {
    const v = themeVars();
    document.querySelectorAll('#custom-colors input').forEach((inp) => { inp.value = toHex(v[inp.dataset.var] || ''); });
    $('#opt-pattern').value = patternId();
    $('#opt-font').selectedIndex = FONTS.findIndex((f) => f.value === v['--font-card']);
    $('#opt-radius').value = parseFloat(v['--card-radius']) || 0;
    $('#opt-four').checked = !!settings.fourColor;
    $('#opt-anim').checked = !!settings.anim;
    document.querySelectorAll('#draw-seg button').forEach((b) => b.classList.toggle('active', +b.dataset.draw === settings.draw));
    $('#stats-line').textContent = `Wygrane: ${stats.won} z ${stats.played}` + (stats.best ? ` · Rekord: ${fmt(stats.best)}` : '');
    markActiveTheme();
  }
  function markActiveTheme() {
    const modified = Object.keys(settings.overrides).length || settings.backPattern;
    document.querySelectorAll('.theme-tile').forEach((b) => {
      const on = b.dataset.id === settings.theme;
      b.classList.toggle('active', on);
      b.querySelector('.mod').textContent = on && modified ? 'zmieniony' : '';
    });
  }
  function openSettings() {
    syncSettings();
    $('#export-box').hidden = true;
    $('#overlay').hidden = false;
    $('#settings').classList.add('open');
  }
  function closeSettings() {
    $('#overlay').hidden = true;
    $('#settings').classList.remove('open');
  }

  /* ================= start ================= */
  buildSlots();
  buildCards();
  buildSettings();
  applyTheme();
  computeLayout();

  const saved = load(LS.game, null);
  if (saved && !saved.won && validSave(saved)) {
    S = saved;
    S.draw = S.draw === 3 ? 3 : 1;
    render({ instant: true });
  } else {
    newGame();
  }

  board.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);

  $('#btn-new').onclick = () => { if (!busy) newGame(); };
  $('#btn-undo').onclick = undo;
  $('#btn-hint').onclick = hint;
  $('#btn-again').onclick = newGame;
  autoBtn.onclick = autoComplete;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSettings(); return; }
    if (e.target.closest && e.target.closest('input, select, textarea')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    else if (e.key === 'h' || e.key === 'H') hint();
    else if (e.key === ' ') { e.preventDefault(); drawStock(); }
  });

  new ResizeObserver(() => {
    if (drag) return;
    computeLayout();
    render({ instant: true });
  }).observe(board);

  setInterval(() => {
    if (S && S.started && !S.won && !document.hidden) {
      S.elapsed++;
      $('#time').textContent = fmt(S.elapsed);
      if (S.elapsed % 5 === 0) save();
    }
  }, 1000);

  // do testów w konsoli
  window.__pasjans = { get state() { return S; }, newGame, autoComplete };
})();
