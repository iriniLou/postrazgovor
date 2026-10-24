/* Общий каркас: помощники, звуки, таймер, игроки, навигация.
   Игры подключаются через Games.register({...}) в файлах js/games/*.js */
"use strict";

/* ---------- Мелкие помощники ---------- */
const U = {
  h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  },
  /* Очищает элемент. Возвращает объект с append(), который понимает и массивы, и пропуски (null) */
  clear(el) {
    while (el.firstChild) el.firstChild.remove();
    return { el, append(...kids) { el.append(...kids.flat(Infinity).filter(k => k != null && k !== false)); return this; } };
  },
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; },
  pick(a) { return a[Math.random() * a.length | 0]; },
  sample(a, n) { return U.shuffle(a).slice(0, n); },
  clamp(x, a, b) { return Math.max(a, Math.min(b, x)); },
  /* Пауза. Если за это время игрок ушёл на другую страницу, продолжение не выполняется */
  wait(ms) { const g = App.gen; return new Promise(r => setTimeout(() => { if (App.gen === g) r(); }, ms)); },
  norm(s) { return String(s).toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim(); },
  plural(n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many; if (b > 1 && b < 5) return few; if (b === 1) return one; return many;
  },
  store: {
    get(k, d) { try { const v = localStorage.getItem("rov-igry:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("rov-igry:" + k, JSON.stringify(v)); } catch (e) { /* без сохранения */ } },
  },
};
const h = U.h;

/* ---------- Звуки (синтез, без файлов) ---------- */
const Sfx = {
  ctx: null,
  on: U.store.get("sound", true),
  ac() {
    if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  tone(freq, dur = .12, type = "sine", vol = .18, when = 0) {
    if (!this.on) return;
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .02);
  },
  click() { this.tone(660, .05, "triangle", .08); },
  ok() { this.tone(660, .1, "triangle"); this.tone(990, .16, "triangle", .18, .09); },
  bad() { this.tone(220, .18, "sawtooth", .09); this.tone(160, .22, "sawtooth", .08, .12); },
  tick() { this.tone(1200, .03, "square", .04); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .22, "triangle", .16, i * .11)); },
  dice() { for (let i = 0; i < 6; i++) this.tone(300 + Math.random() * 500, .03, "square", .04, i * .05); },
  buzz() { this.tone(140, .35, "square", .1); },
  step() { this.tone(480 + Math.random() * 60, .04, "triangle", .06); },
};

/* ---------- Озвучка (если в системе есть русский голос) ---------- */
const Voice = {
  voice: null,
  init() {
    if (!("speechSynthesis" in window)) return;
    const choose = () => {
      const vs = speechSynthesis.getVoices();
      this.voice = vs.find(v => /ru/i.test(v.lang) && /irina|svetlana|milena|natalia|female/i.test(v.name)) || vs.find(v => /ru/i.test(v.lang)) || null;
    };
    choose(); speechSynthesis.onvoiceschanged = choose;
  },
  ok() { return !!this.voice; },
  say(text) {
    if (!this.voice) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, ""));
    u.voice = this.voice; u.lang = this.voice.lang; u.rate = .95;
    speechSynthesis.speak(u);
  },
  stop() { if ("speechSynthesis" in window) speechSynthesis.cancel(); },
  button(text) {
    return this.ok() ? h("button", { class: "icon-btn", title: "Прочитать вслух", onclick: () => this.say(typeof text === "function" ? text() : text) }, "🔊") : null;
  },
};

/* ---------- Конфетти ---------- */
function confetti(n = 140) {
  let cv = document.getElementById("confetti");
  if (!cv) { cv = h("canvas", { id: "confetti" }); document.body.append(cv); }
  const W = cv.width = innerWidth, H = cv.height = innerHeight, c = cv.getContext("2d");
  const cols = ["#2f4fa3", "#b8342a", "#9e2240", "#2e8b57", "#e07b39", "#7b4bb5", "#d6336c"];
  const ps = Array.from({ length: n }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4,
    s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: U.pick(cols),
  }));
  let f = 0;
  (function loop() {
    c.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    }
    if (++f < 160) requestAnimationFrame(loop); else c.clearRect(0, 0, W, H);
  })();
}

/* ---------- Окна и подсказки ---------- */
function modal(content, { buttons = [{ text: "Понятно" }], onClose } = {}) {
  return new Promise(res => {
    const close = v => { back.remove(); onClose && onClose(v); res(v); };
    const back = h("div", { class: "modal-back", onclick: e => { if (e.target === back && buttons.length <= 1) close(); } },
      h("div", { class: "modal" }, content,
        h("div", { class: "row c", style: { marginTop: "18px" } },
          buttons.map(b => h("button", { class: "btn " + (b.cls || ""), onclick: () => { Sfx.click(); close(b.value); } }, b.text)))));
    document.body.append(back);
  });
}
function toast(text, ms = 1800) {
  const t = h("div", { class: "toast" }, text); document.body.append(t); setTimeout(() => t.remove(), ms);
}

/* ---------- Таймер ---------- */
class Timer {
  constructor(sec, { onTick, onEnd, warn = 5 } = {}) {
    this.total = sec; this.left = sec; this.onTick = onTick; this.onEnd = onEnd; this.warn = warn;
    const R = 36, L = 2 * Math.PI * R;
    this.L = L;
    this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    Object.entries({ cx: 42, cy: 42, r: R, fill: "none", stroke: "var(--accent)", "stroke-width": 8, "stroke-linecap": "round", "stroke-dasharray": L }).forEach(([k, v]) => this.circle.setAttribute(k, v));
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    Object.entries({ cx: 42, cy: 42, r: R, fill: "none", stroke: "var(--line)", "stroke-width": 8 }).forEach(([k, v]) => bg.setAttribute(k, v));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 84); svg.setAttribute("height", 84); svg.append(bg, this.circle);
    this.label = h("div", { class: "t" }, sec);
    this.el = h("div", { class: "timer" }, svg, this.label);
    this.draw();
  }
  draw() {
    this.circle.setAttribute("stroke-dashoffset", this.L * (1 - this.left / this.total));
    this.label.textContent = Math.ceil(this.left);
    this.el.classList.toggle("warn", this.left <= this.warn);
  }
  start() {
    this.stop(); let last = performance.now();
    this.iv = setInterval(() => {
      const now = performance.now(); const prev = Math.ceil(this.left);
      this.left = Math.max(0, this.left - (now - last) / 1000); last = now;
      if (Math.ceil(this.left) !== prev && this.left <= this.warn && this.left > 0) Sfx.tick();
      this.draw(); this.onTick && this.onTick(this.left);
      if (this.left <= 0) { this.stop(); Sfx.buzz(); this.onEnd && this.onEnd(); }
    }, 100);
    return this;
  }
  stop() { clearInterval(this.iv); this.iv = null; }
  add(sec) { this.left = U.clamp(this.left + sec, 0, this.total); this.draw(); }
}

/* ---------- Игроки и команды ---------- */
const COLORS = ["#2f4fa3", "#b8342a", "#2e8b57", "#7b4bb5", "#d9822b", "#0e8a8a", "#c2367a", "#5a6270", "#8a6d1f", "#3b7dd8"];
const AVATARS = ["🦊", "🐻", "🦉", "🐺", "🦌", "🐿️", "🦭", "🐟", "🦬", "🐧"];

function setupPlayers(stage, { min = 2, max = 6, def = 2, label = "Игроки", noun = "Игрок", defaults = [], note, extra } = {}) {
  return new Promise(res => {
    const saved = U.store.get("names:" + noun, []);
    let n = U.clamp(def, min, max);
    const names = Array.from({ length: max }, (_, i) => defaults[i] || saved[i] || `${noun} ${i + 1}`);
    const box = h("div", { class: "players-setup stack" });
    const draw = () => {
      U.clear(box);
      box.append(h("h2", { class: "center" }, label), note ? h("p", { class: "center muted" }, note) : null);
      for (let i = 0; i < n; i++) {
        const inp = h("input", { value: names[i], maxlength: 24, "aria-label": `${noun} ${i + 1}`, oninput: e => names[i] = e.target.value });
        box.append(h("div", { class: "pl-row" }, h("span", { class: "em", style: { fontSize: "24px" } }, AVATARS[i]),
          h("span", { class: "swatch", style: { background: COLORS[i] } }), inp,
          n > min ? h("button", { class: "icon-btn", title: "Убрать", onclick: () => { names.splice(i, 1); names.push(`${noun} ${max}`); n--; draw(); } }, "✕") : null));
      }
      if (n < max) box.append(h("button", { class: "btn ghost small", onclick: () => { n++; draw(); } }, `＋ Добавить (${noun.toLowerCase()})`));
      if (extra) box.append(extra);
      box.append(h("div", { class: "row c" }, h("button", {
        class: "btn big", onclick: () => {
          const list = names.slice(0, n).map((s, i) => ({ name: (s || "").trim() || `${noun} ${i + 1}`, color: COLORS[i], avatar: AVATARS[i], score: 0, i }));
          U.store.set("names:" + noun, names.slice(0, n)); Sfx.click(); res(list);
        },
      }, "Начать ▶")));
    };
    draw(); U.clear(stage).append(box);
  });
}

function scoreBar(players, active = -1, { suffix = "" } = {}) {
  return h("div", { class: "score-bar" }, players.map((p, i) =>
    h("div", { class: "score-chip" + (i === active ? " active" : ""), style: { borderColor: i === active ? p.color : null } },
      h("span", { class: "em", style: { fontSize: "22px" } }, p.avatar), h("span", null, p.name), h("b", { style: { color: p.color } }, p.score + suffix))));
}

function passScreen(stage, who, text = "Передай устройство", btn = "Я готов(а) — показать") {
  return new Promise(res => {
    U.clear(stage).append(h("div", { class: "pass stack" },
      h("div", { class: "big-emoji" }, "🤲"), h("p", { class: "muted" }, text),
      h("div", { class: "who", style: { color: who.color } }, who.avatar + " " + who.name),
      h("p", { class: "small muted" }, "Остальные не подглядывают 🙈"),
      h("button", { class: "btn big", onclick: () => { Sfx.click(); res(); } }, btn)));
  });
}

function winners(players) {
  const best = Math.max(...players.map(p => p.score));
  return players.filter(p => p.score === best);
}

function finale(stage, { title, text, stars, facts = [], players, onAgain, hashtag, extra }) {
  Sfx.win(); confetti();
  const w = players ? winners(players) : null;
  U.clear(stage).append(h("div", { class: "finale stack" },
    stars != null ? h("div", { class: "stars" }, "★★★".slice(0, stars) + "☆☆☆".slice(0, 3 - stars)) : h("div", { class: "big-emoji bounce" }, "🏆"),
    h("h2", null, title || (w ? (w.length > 1 ? "Ничья! Победили: " + w.map(p => p.name).join(", ") : "Победа: " + w[0].avatar + " " + w[0].name) : "Готово!")),
    text ? h("p", null, text) : null,
    players ? scoreBar(players.slice().sort((a, b) => b.score - a.score)) : null,
    extra || null,
    facts.length ? h("div", { class: "stack", style: { maxWidth: "640px", margin: "16px auto 0" } }, facts.map(f => h("div", { class: "fact", html: f }))) : null,
    hashtag ? h("p", { class: "small muted", style: { marginTop: "16px" } }, "Поделитесь результатом: ", h("span", { class: "hashtags" }, hashtag)) : null,
    h("div", { class: "row c", style: { marginTop: "18px" } },
      onAgain ? h("button", { class: "btn big", onclick: onAgain }, "↻ Сыграть ещё") : null,
      h("a", { class: "btn ghost big", href: "#/" + App.group().id }, "Другие игры"))));
}

/* Вопрос с вариантами. Возвращает Promise<boolean> */
function askOptions(container, options, correct, { onPick, keys = true } = {}) {
  return new Promise(res => {
    const letters = "АБВГДЕ";
    let done = false;
    const btns = options.map((o, i) => h("button", {
      class: "opt", onclick: () => choose(i),
    }, h("span", { class: "k" }, letters[i]), o));
    const choose = i => {
      if (done) return; done = true;
      btns.forEach((b, j) => { b.disabled = true; if (j === correct) b.classList.add("right"); });
      if (i !== correct) { btns[i].classList.add("wrong"); Sfx.bad(); } else Sfx.ok();
      onPick && onPick(i);
      res(i === correct);
    };
    container.append(h("div", { class: "options" }, btns));
  });
}

/* ---------- Песни: проигрывание фрагментов ---------- */
const Music = {
  el: null, stopT: null, cur: null,
  get(id) { return SONGS.find(s => s.id === id); },
  audio() {
    if (!this.el) { this.el = new Audio(); this.el.preload = "auto"; }
    return this.el;
  },
  play(id, { from = 0, dur = null, onEnd, vol = 1 } = {}) {
    const s = this.get(id); if (!s || !s.src) return null;
    const a = this.audio();
    clearTimeout(this.stopT);
    if (this.cur !== id) { a.src = s.src; this.cur = id; }
    a.volume = vol;
    const go = () => {
      try { a.currentTime = from; } catch (e) { /* ещё не загрузилось */ }
      a.play().catch(() => toast("Нажмите ещё раз, чтобы включить звук"));
      if (dur) this.stopT = setTimeout(() => { a.pause(); onEnd && onEnd(); }, dur * 1000);
    };
    if (a.readyState >= 1) go(); else a.addEventListener("loadedmetadata", go, { once: true });
    a.onended = () => onEnd && onEnd();
    return a;
  },
  stop() { clearTimeout(this.stopT); if (this.el) { this.el.pause(); this.el.onended = null; } },
  button(id, label = "▶ Послушать", opts = {}) {
    const s = this.get(id); if (!s || !s.src) return null;
    let playing = false;
    const b = h("button", {
      class: "btn dark small", onclick: () => {
        if (playing) { Music.stop(); playing = false; b.textContent = label; return; }
        Music.play(id, { ...opts, onEnd: () => { playing = false; b.textContent = label; } });
        playing = true; b.textContent = "⏸ Стоп";
      },
    }, label);
    return b;
  },
};

/* ---------- Реестр игр и навигация ---------- */
const Games = {
  list: [],
  register(g) { this.list.push(g); },
  byGroup(gid) { return this.list.filter(g => g.group === gid).sort((a, b) => MODES[a.mode].order - MODES[b.mode].order); },
  get(id) { return this.list.find(g => g.id === id); },
};

const MODES = {
  solo: { title: "Я – сам", order: 1, tag: "#ЯСамРоВ", em: "🧭" },
  friends: { title: "Я с командой", order: 2, tag: "#ЯСКомандойРоВ", em: "🎉" },
  family: { title: "Я с семьёй", order: 3, tag: "#ЯССемьейРоВ", em: "🏡" },
};

const App = {
  root: null, cleanup: null, _group: null, gen: 0,
  group() { return this._group || GROUPS[0]; },
  start() {
    this.root = document.getElementById("app");
    Voice.init();
    const sb = document.getElementById("sound");
    const drawSb = () => sb.textContent = Sfx.on ? "🔔" : "🔕";
    sb.onclick = () => { Sfx.on = !Sfx.on; U.store.set("sound", Sfx.on); drawSb(); if (Sfx.on) Sfx.click(); };
    drawSb();
    addEventListener("hashchange", () => this.route());
    this.route();
  },
  route() {
    this.gen++;
    if (this.cleanup) { try { this.cleanup(); } catch (e) { console.error(e); } this.cleanup = null; }
    Music.stop(); Voice.stop();
    document.querySelectorAll(".modal-back").forEach(m => m.remove());
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const g = GROUPS.find(x => x.id === parts[0]);
    document.body.className = g ? "theme-" + g.theme + (g.small ? " age-small" : "") : "";
    this._group = g || null;
    scrollTo(0, 0);
    if (!g) return this.home();
    if (parts[1]) { const game = Games.get(parts[1]); if (game) return this.play(g, game); }
    this.groupPage(g);
  },
  home() {
    const r = U.clear(this.root);
    r.append(h("section", { class: "hero" },
      h("h1", null, "Постразговор"),
      h("p", null, "Игры к занятию «Разговоры о важном» 9 ноября 2026 года. Для каждой возрастной группы — три игры: «Я – сам», «Я с командой» (с друзьями, одноклассниками или однокурсниками) и «Я с семьёй»."),
      h("div", { class: "tags" }, h("span", { class: "tag" }, "Работает без интернета"), h("span", { class: "tag" }, "24 игры"), h("span", { class: "tag" }, "Компьютер, планшет или телефон"))));
    for (const topic of TOPICS) {
      r.append(h("div", { class: "topic theme-" + topic.theme }, h("span", { class: "dot" }), h("h2", null, topic.title), h("span", { class: "muted" }, topic.sub)));
      r.append(h("div", { class: "groups theme-" + topic.theme }, GROUPS.filter(g => g.topic === topic.id).map(g =>
        h("a", { class: "group-tile", href: "#/" + g.id },
          h("div", { class: "age" }, g.title), h("div", { class: "sub" }, g.sub),
          h("div", { class: "em3 em" }, Games.byGroup(g.id).map(x => x.emoji).join(" "))))));
    }
  },
  groupPage(g) {
    const topic = TOPICS.find(t => t.id === g.topic);
    const r = U.clear(this.root);
    r.append(h("div", { class: "crumbs" }, h("a", { href: "#/" }, "Все группы"), " · ", topic.title));
    r.append(h("h1", null, g.title, h("span", { class: "muted", style: { fontWeight: 400 } }, " · " + topic.short)));
    r.append(h("p", { class: "muted" }, g.intro));
    r.append(h("div", { class: "games3" }, Games.byGroup(g.id).map(x =>
      h("article", { class: "game-card" },
        h("div", { class: "cover em" }, h("span", { class: "mode" }, MODES[x.mode].title), x.emoji),
        h("div", { class: "body" },
          h("h3", null, x.title), h("p", null, x.short),
          h("div", { class: "meta" }, h("span", null, "👥 " + x.players), h("span", null, "⏱ " + x.time), x.needs ? h("span", null, x.needs) : null),
          h("a", { class: "btn", href: `#/${g.id}/${x.id}` }, "Играть ▶"))))));
    r.append(h("div", { class: "note" },
      h("b", null, "Покажи свой «Постразговор» всей России. "), "Сфотографируйте экран с результатом и выложите во ВКонтакте с хэштегами ",
      h("span", { class: "hashtags" }, "#ЯСамРоВ, #ЯСКомандойРоВ или #ЯССемьейРоВ"), " и ", h("span", { class: "hashtags" }, topic.hashtag), "."));
  },
  play(g, game) {
    const r = U.clear(this.root);
    const stage = h("div", { class: "stage" });
    const rules = h("div", { class: "rules hidden" }, h("b", null, "Как играть"), h("ol", null, game.rules.map(x => h("li", null, x))));
    r.append(h("div", { class: "crumbs" }, h("a", { href: "#/" }, "Все группы"), " · ", h("a", { href: "#/" + g.id }, g.title), " · ", MODES[game.mode].title));
    r.append(h("div", { class: "game-head" },
      h("span", { class: "big-emoji", style: { fontSize: "44px" } }, game.emoji), h("h1", null, game.title), h("span", { class: "sp" }),
      h("button", { class: "btn ghost small", onclick: () => rules.classList.toggle("hidden") }, "Правила"),
      h("button", { class: "btn ghost small", onclick: () => this.route() }, "↻ Заново")));
    r.append(rules, stage);
    const ctx = {
      group: g, topic: TOPICS.find(t => t.id === g.topic), game,
      hashtag: MODES[game.mode].tag + " " + TOPICS.find(t => t.id === g.topic).hashtag,
      restart: () => this.route(),
      onCleanup: fn => { const prev = this.cleanup; this.cleanup = () => { prev && prev(); fn(); }; },
    };
    try { game.start(stage, ctx); } catch (e) { console.error(e); stage.append(h("p", null, "Ошибка: " + e.message)); }
  },
};

/* Стартовый экран игры: описание + кнопка */
function intro(stage, { emoji, title, text, btn = "Начать ▶", extra }) {
  return new Promise(res => {
    U.clear(stage).append(h("div", { class: "center stack", style: { maxWidth: "640px", margin: "0 auto", padding: "10px 0" } },
      h("div", { class: "big-emoji bounce" }, emoji), h("h2", null, title),
      ...(Array.isArray(text) ? text : [text]).map(t => h("p", null, t)),
      extra || null,
      h("button", { class: "btn big", onclick: () => { Sfx.click(); res(); } }, btn)));
  });
}
