/* 1–2 классы · Я – сам · «Дорога в Москву» — снежный лабиринт */
"use strict";
(() => {
  const LEVELS = [
    {
      w: 6, h: 5, name: "Деревня у Белого моря", exit: "🐴", exitName: "обоз",
      items: [["📕", "«Грамматика»", "По «Грамматике» Миша учился русскому языку."], ["📗", "«Арифметика»", "По «Арифметике» Миша учился считать."]],
      story: "Миша Ломоносов живёт в деревне у Белого моря. Он очень хочет учиться! Найди две его любимые книги и догони обоз, который едет в Москву.",
      done: "Ура! Миша догнал обоз. Зимой 1730 года он отправился в Москву вместе с людьми, которые везли рыбу на продажу.",
    },
    {
      w: 8, h: 6, name: "Зимний лес", exit: "🏘️", exitName: "Москва",
      items: [["🧥", "тулуп", "В тёплом тулупе не страшен мороз!"], ["🍞", "хлеб", "Дорога долгая — без хлеба никак."]],
      story: "Дорога идёт через зимний лес. Чтобы не замёрзнуть и не проголодаться, найди тулуп и хлеб. Впереди — Москва!",
      done: "Вот и Москва! Путь занял около трёх недель.",
    },
    {
      w: 10, h: 7, name: "Москва", exit: "🏛️", exitName: "академия",
      items: [["🪶", "перо", "Гусиным пером в те времена писали все — и ученики, и учёные."], ["📜", "бумага", "Миша берёг каждый листок бумаги."]],
      story: "В Москве нужно найти дорогу к академии, где учатся. Для учёбы понадобятся перо и бумага.",
      done: "В 1731 году Михаил Ломоносов поступил в академию. С этого начался его путь к открытиям!",
    },
  ];

  function makeMaze(w, h) {
    const W = 2 * w + 1, H = 2 * h + 1;
    const g = Array.from({ length: H }, () => Array(W).fill(1));
    const seen = Array.from({ length: h }, () => Array(w).fill(false));
    const stack = [[0, 0]]; seen[0][0] = true; g[1][1] = 0;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy, dx, dy])
        .filter(([a, b]) => a >= 0 && b >= 0 && a < w && b < h && !seen[b][a]);
      if (!nb.length) { stack.pop(); continue; }
      const [a, b, dx, dy] = U.pick(nb);
      seen[b][a] = true; g[2 * y + 1 + dy][2 * x + 1 + dx] = 0; g[2 * b + 1][2 * a + 1] = 0; stack.push([a, b]);
    }
    return g;
  }

  function dist(g, sx, sy) {
    const H = g.length, W = g[0].length, d = Array.from({ length: H }, () => Array(W).fill(-1));
    const q = [[sx, sy]]; d[sy][sx] = 0;
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = x + dx, b = y + dy;
        if (g[b] && g[b][a] === 0 && d[b][a] < 0) { d[b][a] = d[y][x] + 1; q.push([a, b]); }
      }
    }
    return d;
  }

  Games.register({
    id: "maze", group: "1-2", mode: "solo", emoji: "🛷", title: "Дорога в Москву",
    short: "Снежный лабиринт: помоги Мише собрать всё нужное в дорогу и добраться до академии.",
    players: "1 игрок", time: "10 минут",
    rules: [
      "Веди сани стрелками на клавиатуре, кнопками под лабиринтом или проведи пальцем по экрану.",
      "На каждом уровне найди два нужных предмета — без них дальше не пройти.",
      "Рыбки 🐟 — бонус: чем больше соберёшь, тем больше звёзд.",
      "Три уровня: деревня, зимний лес и Москва.",
    ],
    start(stage, ctx) {
      let level = 0, fishTotal = 0, steps = 0;
      let g, W, H, px, py, items, fish, got, keyHandler;

      const runLevel = async () => {
        const L = LEVELS[level];
        await intro(stage, {
          emoji: ["🌊", "🌲", "🏛️"][level], title: `Уровень ${level + 1}. ${L.name}`, text: L.story,
          extra: h("div", { class: "row c" }, Voice.button(L.story), h("span", { class: "big-emoji", style: { fontSize: "44px" } }, L.items.map(i => i[0]).join(" "))),
          btn: "В путь! ▶",
        });
        g = makeMaze(L.w, L.h); H = g.length; W = g[0].length;
        px = 1; py = 1;
        const d = dist(g, 1, 1);
        const ex = W - 2, ey = H - 2;
        const cells = [];
        for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) if (g[y][x] === 0 && !(x === 1 && y === 1) && !(x === ex && y === ey)) cells.push([x, y]);
        const ends = cells.filter(([x, y]) => (x % 2 && y % 2) && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => g[y + dy][x + dx] === 0).length === 1)
          .sort((a, b) => d[b[1]][b[0]] - d[a[1]][a[0]]);
        const pool = ends.length >= 2 ? ends : cells.slice().sort((a, b) => d[b[1]][b[0]] - d[a[1]][a[0]]);
        items = [pool[0], pool[Math.min(1 + (pool.length > 3 ? 1 : 0), pool.length - 1)]].map((c, i) => ({ x: c[0], y: c[1], it: L.items[i], taken: false }));
        if (items[0].x === items[1].x && items[0].y === items[1].y) { const c = cells.find(c => c[0] !== items[0].x || c[1] !== items[0].y); items[1].x = c[0]; items[1].y = c[1]; }
        const free = U.shuffle(cells.filter(([x, y]) => (x % 2 && y % 2) && !items.some(i => i.x === x && i.y === y)));
        fish = free.slice(0, 3).map(([x, y]) => ({ x, y, taken: false }));
        got = 0;
        draw();
      };

      const tileSize = () => U.clamp(Math.floor((stage.clientWidth - 40) / W), 22, 46);

      let board, hud;
      const draw = () => {
        const L = LEVELS[level], ts = tileSize();
        U.clear(stage);
        hud = h("div", { class: "row c", style: { marginBottom: "10px", fontSize: "20px" } });
        board = h("div", {
          style: {
            display: "grid", gridTemplateColumns: `repeat(${W}, ${ts}px)`, gridAutoRows: ts + "px", justifyContent: "center",
            background: "#eef4ff", borderRadius: "16px", padding: "8px", margin: "0 auto", width: "fit-content", touchAction: "none", userSelect: "none",
          },
        });
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          board.append(h("div", { "data-x": x, "data-y": y, class: "em", style: { display: "grid", placeItems: "center", fontSize: Math.round(ts * .78) + "px", lineHeight: 1, background: g[y][x] ? "#dfe9d9" : "#f8fbff", borderRadius: g[y][x] ? "6px" : "0" } }, g[y][x] ? "🌲" : ""));
        }
        const pad = h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: "6px", justifyContent: "center", marginTop: "14px" } },
          h("span"), h("button", { class: "btn ghost", onclick: () => move(0, -1) }, "⬆️"), h("span"),
          h("button", { class: "btn ghost", onclick: () => move(-1, 0) }, "⬅️"), h("button", { class: "btn ghost", onclick: () => move(0, 1) }, "⬇️"), h("button", { class: "btn ghost", onclick: () => move(1, 0) }, "➡️"));
        stage.append(h("div", { class: "center", style: { marginBottom: "6px" } }, h("span", { class: "pill" }, `Уровень ${level + 1} из 3 · ${L.name}`)), hud, board, pad);
        let sx, sy;
        board.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
        board.addEventListener("pointerup", e => {
          if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
          Math.abs(dx) > Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy));
        });
        paint();
      };

      const cell = (x, y) => board.children[y * W + x];
      const paint = () => {
        const L = LEVELS[level];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!g[y][x]) cell(x, y).textContent = "";
        cell(1, 1).textContent = level === 0 ? "🏠" : "";
        cell(W - 2, H - 2).textContent = L.exit;
        items.forEach(i => { if (!i.taken) cell(i.x, i.y).textContent = i.it[0]; });
        fish.forEach(f => { if (!f.taken) cell(f.x, f.y).textContent = "🐟"; });
        cell(px, py).textContent = "🛷";
        U.clear(hud).append(
          ...items.map(i => h("span", { class: "em", style: { opacity: i.taken ? 1 : .3, fontSize: "30px" }, title: i.it[1] }, i.it[0])),
          h("span", { class: "muted", style: { margin: "0 6px" } }, "·"),
          h("span", { class: "em" }, "🐟 " + (fishTotal + fish.filter(f => f.taken).length)));
      };

      const move = (dx, dy) => {
        if (document.querySelector(".modal-back")) return;
        const x = px + dx, y = py + dy;
        if (!g[y] || g[y][x] !== 0) { board.classList.remove("shake"); void board.offsetWidth; board.classList.add("shake"); return; }
        px = x; py = y; steps++; Sfx.step();
        const it = items.find(i => !i.taken && i.x === x && i.y === y);
        if (it) {
          it.taken = true; got++; Sfx.ok();
          modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji bounce" }, it.it[0]), h("h2", null, `Нашёл ${it.it[1]}!`), h("p", { style: { fontSize: "21px" } }, it.it[2])), { buttons: [{ text: "Дальше ▶" }] });
        }
        const f = fish.find(f => !f.taken && f.x === x && f.y === y);
        if (f) { f.taken = true; Sfx.tone(880, .1, "triangle"); }
        paint();
        if (x === W - 2 && y === H - 2) {
          if (got < 2) { Sfx.bad(); modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji" }, "🔍"), h("h2", null, "Сначала найди оба предмета!"), h("p", { style: { fontSize: "21px" } }, "Посмотри наверху, что ещё осталось найти: " + items.filter(i => !i.taken).map(i => i.it[0] + " " + i.it[1]).join(", "))), { buttons: [{ text: "Ищу! ▶" }] }); return; }
          levelDone();
        }
      };

      const levelDone = async () => {
        const L = LEVELS[level];
        fishTotal += fish.filter(f => f.taken).length;
        Sfx.win(); confetti(80);
        if (level < LEVELS.length - 1) {
          await intro(stage, { emoji: L.exit, title: "Получилось!", text: L.done, extra: Voice.button(L.done), btn: "Дальше ▶" });
          level++; runLevel();
        } else {
          const stars = 1 + (fishTotal >= 4) + (fishTotal >= 8);
          finale(stage, {
            stars, title: "Миша добрался до академии!",
            text: `${L.done} Ты собрал рыбок: ${fishTotal} из 9.`,
            facts: [
              "<b>А что было дальше?</b> Михаил учился в Москве, потом в Петербурге и в Германии. Он стал великим учёным: изучал планеты, делал цветное стекло и мозаики, писал стихи и помог открыть Московский университет.",
              "<b>Подумай:</b> чему хочешь научиться ты? Какой первый шаг ты можешь сделать уже завтра?",
            ],
            hashtag: ctx.hashtag, onAgain: ctx.restart,
          });
        }
      };

      keyHandler = e => {
        const k = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[e.code];
        if (k && board && board.isConnected) { e.preventDefault(); move(...k); }
      };
      addEventListener("keydown", keyHandler);
      ctx.onCleanup(() => removeEventListener("keydown", keyHandler));
      runLevel();
    },
  });
})();
