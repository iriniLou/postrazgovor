/* 3–4 классы · Я – сам · «Стекольная мастерская» — свари цветное стекло и собери мозаику */
"use strict";
(() => {
  // Цвета смальты, которые можно получить
  const COL = {
    blue: { name: "синий", hex: "#2846a8" },
    green: { name: "зелёный", hex: "#2f8f4e" },
    teal: { name: "бирюзовый", hex: "#2bb3b1" },
    red: { name: "рубиновый", hex: "#b3123a" },
    violet: { name: "фиолетовый", hex: "#6c3fa3" },
    amber: { name: "жёлтый", hex: "#e0a526" },
    white: { name: "белый", hex: "#f3f1ea" },
    pink: { name: "бледно-розовый", hex: "#efc3cd", bad: true },
    clear: { name: "прозрачный зеленоватый", hex: "#cfe6d4", bad: true },
    brown: { name: "мутно-бурый", hex: "#7a5a3a", bad: true },
  };
  // Добавки: результат зависит от жара печи (обычный / сильный и долгий)
  const ADD = [
    { id: "none", name: "Без добавки", em: "🫙", res: ["clear", "clear"] },
    { id: "co", name: "Кобальт", em: "🔵", res: ["blue", "blue"], hint: "Кобальт даёт стеклу глубокий синий цвет — его видно даже в маленьком кусочке." },
    { id: "cu", name: "Медь", em: "🟤", res: ["green", "teal"], hint: "Медь даёт зелёный цвет, а при сильном и долгом жаре стекло становится бирюзовым." },
    { id: "au", name: "Золото", em: "🟡", res: ["pink", "red"], hint: "Капля золота даёт рубиновый цвет, но только если стекло долго держать в сильном жаре. Иначе выйдет бледно-розовое." },
    { id: "mn", name: "Марганец", em: "🟣", res: ["violet", "violet"], hint: "Марганец окрашивает стекло в фиолетовый цвет." },
    { id: "sb", name: "Сурьма", em: "⚪", res: ["amber", "brown"], hint: "Сурьма даёт жёлтую смальту. Если перегреть — цвет темнеет и мутнеет." },
    { id: "sn", name: "Олово", em: "🥈", res: ["white", "white"], hint: "Олово делает стекло белым и непрозрачным — такую смальту называют «глухой»." },
  ];
  // Мозаики (12×12). Буква — цвет: b синий, g зелёный, t бирюзовый, r рубиновый, v фиолетовый, a жёлтый, w белый
  const PICS = [
    {
      title: "Парусник на Белом море", em: "⛵",
      fact: "Ломоносов вырос у Белого моря и с детства ходил с отцом на парусном судне.",
      rows: [
        "tttttttttaat", "tttttwtttaat", "ttttwwtttttt", "tttwwwwttttt", "ttwwwwwttttt", "twwwwwwttttt",
        "tttttrtttttt", "trrrrrrrrrtt", "ttrrrrrrrttt", "bbbbbbbbbbbb", "bbtbbbbbtbbb", "bbbbbbbbbbbb"],
    },
    {
      title: "Венера на фоне Солнца", em: "🔭",
      fact: "В 1761 году Ломоносов увидел светлый ободок вокруг Венеры и догадался: у планеты есть атмосфера.",
      rows: [
        "vvvvvvvvvvvv", "vvvaaaaaavvv", "vvaaaaaaaavv", "vaaaaaaaaaav", "vaaaawwwaaav", "vaaawbbbwaav",
        "vaaawbbbwaav", "vaaaawwwaaav", "vaaaaaaaaaav", "vvaaaaaaaavv", "vvvaaaaaavvv", "vvvvvvvvvvvv"],
    },
    {
      title: "Северное сияние", em: "🌌",
      fact: "Ломоносов изучал северное сияние и написал о нём знаменитые стихи: «Открылась бездна звёзд полна; Звездам числа нет, бездне дна».",
      rows: [
        "bbbbbbbbbbbb", "bbgbbbbbbwbb", "bggtbbbbbbbb", "bbgttbbbvbbb", "bbbgttbvvbbb", "bwbbgttvbbbb",
        "bbbbbgtvbbwb", "bbbbbbggbbbb", "wwwwwwwwwwww", "wwrrwwwwwwww", "wrrrrwwwwwww", "wwrrwwwwwwww"],
    },
  ];
  const LET = { b: "blue", g: "green", t: "teal", r: "red", v: "violet", a: "amber", w: "white" };

  Games.register({
    id: "glass", group: "3-4", mode: "solo", emoji: "⚗️", title: "Стекольная мастерская",
    short: "Свари цветное стекло, как Ломоносов: пробуй добавки и жар печи, записывай опыты и собери мозаику.",
    players: "1 игрок", time: "15 минут",
    rules: [
      "Выбери мозаику. Посмотри, какие цвета смальты для неё нужны.",
      "В мастерской выбери добавку и жар печи, нажми «Плавить». Получится стекло какого-то цвета.",
      "Все опыты записываются в журнал. Не вышло — попробуй иначе: другую добавку или другой жар.",
      "Когда все нужные цвета готовы, собери мозаику: выбери цвет и нажимай на клетки с его номером.",
      "Чем меньше опытов понадобилось, тем больше звёзд.",
      "Химия в игре упрощена: в настоящей мастерской цвет зависел ещё от состава стекла, количества добавки и многих других условий.",
    ],
    start(stage, ctx) {
      let pic, need, made = new Set(), journal = [];

      const choosePic = () => {
        U.clear(stage).append(h("div", { class: "center stack" },
          h("h2", null, "Какую мозаику соберём?"),
          h("p", { class: "muted" }, "В мастерской Ломоносова мозаики собирали из смальты — кусочков цветного непрозрачного стекла. Сначала стекло нужно сварить!"),
          h("div", { class: "row c" }, PICS.map(p => h("button", { class: "btn ghost big", style: { flexDirection: "column", minWidth: "200px" }, onclick: () => { pic = p; lab(); } },
            h("span", { class: "em", style: { fontSize: "44px" } }, p.em), p.title)))));
      };

      const lab = () => {
        need = [...new Set(pic.rows.join("").split(""))].map(l => LET[l]);
        let add = ADD[1], hot = 0;
        const flask = h("div", { style: { width: "130px", height: "130px", borderRadius: "50% 50% 46% 46%", margin: "0 auto", background: "#e8e3d8", border: "6px solid #8b6b4a", display: "grid", placeItems: "center", fontSize: "40px", transition: "background .6s, box-shadow .6s" }, class: "em" }, "🫙");
        const fire = h("div", { class: "em", style: { fontSize: "36px", textAlign: "center", height: "44px" } }, "🔥");
        const needBox = h("div", { class: "row c" });
        const jBox = h("div", { class: "stack", style: { maxHeight: "260px", overflow: "auto" } });
        const addBox = h("div", { class: "row c" });
        const hotBox = h("div", { class: "row c" });
        const go = h("button", { class: "btn big dark", onclick: () => melt() }, "🔥 Плавить");
        const toMosaic = h("button", { class: "btn big ok hidden", onclick: () => mosaic() }, "🧩 Собирать мозаику");

        const drawNeed = () => U.clear(needBox).append(need.map(c => h("span", {
          class: "pill", style: { background: made.has(c) ? COL[c].hex : "#fff", color: made.has(c) && !["white", "amber"].includes(c) ? "#fff" : "var(--ink)", border: "2px solid " + COL[c].hex },
        }, (made.has(c) ? "✓ " : "") + COL[c].name)));
        const drawAdd = () => U.clear(addBox).append(ADD.map(a => h("button", {
          class: "btn small " + (a === add ? "" : "ghost"), onclick: () => { add = a; drawAdd(); Sfx.click(); },
        }, h("span", { class: "em" }, a.em), a.name)));
        const drawHot = () => U.clear(hotBox).append([["Обычный жар", 0], ["Сильный и долгий жар", 1]].map(([t, v]) =>
          h("button", { class: "btn small " + (hot === v ? "" : "ghost"), onclick: () => { hot = v; drawHot(); fire.textContent = v ? "🔥🔥🔥" : "🔥"; Sfx.click(); } }, t)));
        const drawJ = () => U.clear(jBox).append(journal.length ? journal.slice().reverse().map((j, i) => h("div", { class: "row", style: { gap: "8px", fontSize: "15px" } },
          h("b", null, `№${journal.length - i}`), h("span", { class: "swatch", style: { background: COL[j.res].hex, width: "22px", height: "22px", border: "1px solid #0002" } }),
          h("span", null, `${j.add.name}, ${j.hot ? "сильный жар" : "обычный жар"} → `, h("b", null, COL[j.res].name), COL[j.res].bad ? " ✗" : need.includes(j.res) ? " ✓" : ""))) : h("p", { class: "muted small" }, "Пока пусто. Запиши сюда свой первый опыт!"));

        let busy = false;
        const melt = async () => {
          if (busy) return; busy = true; go.disabled = true;
          flask.style.background = "#f6b26b"; flask.style.boxShadow = "0 0 40px #f6b26b"; flask.textContent = "♨️";
          for (let i = 0; i < 6; i++) { Sfx.tone(180 + i * 40, .12, "sawtooth", .05); await U.wait(130); }
          const res = add.res[hot];
          flask.style.background = COL[res].hex; flask.style.boxShadow = "0 0 26px " + COL[res].hex + "99"; flask.textContent = "";
          journal.push({ add, hot, res }); drawJ();
          if (COL[res].bad) {
            Sfx.bad();
            const tip = add.id === "au" ? "Попробуй дольше и сильнее нагреть!" : add.id === "sb" ? "Кажется, перегрели. Попробуй жар послабее." : "Без добавки стекло почти бесцветное. Нужна добавка-краситель!";
            toast(`Вышло ${COL[res].name} стекло. ${tip}`, 3200);
          } else if (!need.includes(res)) { Sfx.click(); toast(`${COL[res].name[0].toUpperCase() + COL[res].name.slice(1)} стекло! Красиво, но для этой мозаики не нужно.`, 2600); }
          else if (made.has(res)) { toast(`${COL[res].name} у нас уже есть`); }
          else { made.add(res); Sfx.ok(); toast(`Готово: ${COL[res].name} смальта! ${add.hint || ""}`, 3600); }
          drawNeed();
          if (need.every(c => made.has(c))) { toMosaic.classList.remove("hidden"); go.classList.add("hidden"); Sfx.win(); }
          busy = false; go.disabled = false;
        };

        U.clear(stage).append(h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" } },
          h("div", { class: "stack" },
            h("h3", null, "Мастерская"),
            h("div", { class: "panel stack" }, h("b", null, "Для мозаики «" + pic.title + "» нужны цвета:"), needBox),
            h("div", null, h("b", null, "1. Добавка в стекло"), addBox),
            h("div", null, h("b", null, "2. Жар печи"), hotBox),
            h("div", { class: "center stack" }, flask, fire, h("div", { class: "row c" }, go, toMosaic))),
          h("div", { class: "stack" },
            h("h3", null, "📒 Журнал опытов"), jBox,
            h("div", { class: "fact small" }, h("b", null, "Как работал Ломоносов. "), "Он провёл тысячи опытов со стеклом и записывал каждый. Неудачный опыт — тоже результат: он подсказывает, что поменять в следующий раз."))));
        drawNeed(); drawAdd(); drawHot(); drawJ();
      };

      const mosaic = () => {
        const cols = [...need];
        let cur = cols[0];
        const grid = pic.rows.map(r => r.split("").map(l => ({ c: LET[l], done: false })));
        const num = c => cols.indexOf(c) + 1;
        const N = 12, ts = U.clamp(Math.floor((stage.clientWidth - 60) / N), 22, 40);
        const board = h("div", { style: { display: "grid", gridTemplateColumns: `repeat(${N}, ${ts}px)`, gap: "2px", justifyContent: "center", background: "#cfc6b6", padding: "6px", borderRadius: "12px", width: "fit-content", margin: "0 auto" } });
        const cellsEl = [];
        grid.forEach((row, y) => row.forEach((cell, x) => {
          const el = h("button", { style: { width: ts + "px", height: ts + "px", border: 0, borderRadius: "4px", background: "#fffaf1", fontSize: Math.round(ts * .42) + "px", color: "#8a7f70", cursor: "pointer", padding: 0 }, onclick: () => tap(x, y) }, num(cell.c));
          cellsEl.push(el); board.append(el);
        }));
        const palette = h("div", { class: "row c" });
        const drawPal = () => U.clear(palette).append(cols.map(c => h("button", {
          class: "btn small", style: { background: COL[c].hex, color: ["white", "amber"].includes(c) ? "#222" : "#fff", outline: c === cur ? "4px solid var(--ink)" : "none", outlineOffset: "2px" },
          onclick: () => { cur = c; drawPal(); },
        }, `${num(c)} · ${COL[c].name}`)));
        const fillRegion = (x, y) => {
          const c = grid[y][x].c, st = [[x, y]]; let n = 0;
          while (st.length) {
            const [a, b] = st.pop(); const cell = grid[b] && grid[b][a];
            if (!cell || cell.done || cell.c !== c) continue;
            cell.done = true; n++;
            const el = cellsEl[b * N + a]; el.style.background = COL[c].hex; el.textContent = ""; el.style.boxShadow = "inset 0 0 0 1px #0001, inset 2px 2px 0 #fff3";
            st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
          }
          return n;
        };
        const tap = (x, y) => {
          const cell = grid[y][x]; if (cell.done) return;
          if (cell.c !== cur) { Sfx.bad(); toast(`Здесь номер ${num(cell.c)} — нужен ${COL[cell.c].name} цвет`); return; }
          fillRegion(x, y); Sfx.tone(500 + Math.random() * 400, .08, "triangle", .1);
          if (grid.every(r => r.every(c => c.done))) done();
        };
        const done = () => {
          const extra = journal.length - need.length;
          const stars = extra <= 2 ? 3 : extra <= 6 ? 2 : 1;
          const art = board.cloneNode(true); art.querySelectorAll("button").forEach(b => b.disabled = true);
          finale(stage, {
            stars, title: `Мозаика «${pic.title}» готова!`,
            text: `Тебе понадобилось опытов: ${journal.length}. ${extra <= 2 ? "Почти без ошибок — как настоящий мастер!" : "Каждая неудача подсказывала, что поменять. Так и работают исследователи."}`,
            extra: art,
            facts: [
              `<b>Ты знаешь?</b> ${pic.fact}`,
              "<b>Мозаика «Полтавская баталия»</b> из мастерской Ломоносова — огромная картина площадью около 30 квадратных метров. Её собрали из тысяч кусочков смальты.",
              "<b>Подумай:</b> что у тебя получилось не с первого раза? Что ты поменял, чтобы получилось?",
            ],
            hashtag: ctx.hashtag, onAgain: ctx.restart,
          });
        };
        U.clear(stage).append(h("div", { class: "stack center" },
          h("h2", null, "Собери мозаику «" + pic.title + "»"),
          h("p", { class: "muted" }, "Выбери цвет и нажимай на клетки с его номером — закрасится вся область сразу."),
          palette, board));
        drawPal();
      };

      choosePic();
    },
  });
})();
