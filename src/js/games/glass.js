/* 3–4 классы · Я – сам · «Стекольная мастерская» — свари цветное стекло и собери мозаику */
"use strict";
(() => {
  // Цвета смальты, которые можно получить
  const COL = {
    blue: { name: "синий", hex: "#2846a8" },
    green: { name: "зелёный", hex: "#2f8f4e" },
    teal: { name: "бирюзовый", hex: "#5cc6d0" },
    red: { name: "рубиновый", hex: "#b3123a" },
    violet: { name: "фиолетовый", hex: "#7b4bb5" },
    amber: { name: "жёлтый", hex: "#f0b429" },
    white: { name: "белый", hex: "#f7f5ee" },
    brown: { name: "коричневый", hex: "#8a5a32" },
    black: { name: "чёрный", hex: "#23202a" },
    pink: { name: "бледно-розовый", hex: "#efc3cd", bad: true },
    clear: { name: "прозрачный зеленоватый", hex: "#cfe6d4", bad: true },
    murky: { name: "мутно-бурый", hex: "#9b8a6a", bad: true },
  };
  // Добавки: результат зависит от жара печи (обычный / сильный и долгий)
  const ADD = [
    { id: "none", name: "Без добавки", em: "🫙", res: ["clear", "clear"] },
    { id: "co", name: "Кобальт", em: "🔵", res: ["blue", "blue"], hint: "Кобальт даёт стеклу глубокий синий цвет — его видно даже в маленьком кусочке." },
    { id: "cu", name: "Медь", em: "🟢", res: ["green", "teal"], hint: "Медь даёт зелёный цвет, а при сильном и долгом жаре стекло становится бирюзовым." },
    { id: "au", name: "Золото", em: "🟡", res: ["pink", "red"], hint: "Капля золота даёт рубиновый цвет, но только если стекло долго держать в сильном жаре. Иначе выйдет бледно-розовое." },
    { id: "mn", name: "Марганец", em: "🟣", res: ["violet", "violet"], hint: "Марганец окрашивает стекло в фиолетовый цвет." },
    { id: "sb", name: "Сурьма", em: "⚪", res: ["amber", "murky"], hint: "Сурьма даёт жёлтую смальту. Если перегреть — цвет темнеет и мутнеет." },
    { id: "sn", name: "Олово", em: "🥈", res: ["white", "white"], hint: "Олово делает стекло белым и непрозрачным — такую смальту называют «глухой»." },
    { id: "fe", name: "Железо", em: "🟤", res: ["brown", "black"], hint: "Железо даёт коричневое стекло, а если добавить его много и долго держать в жаре — почти чёрное." },
  ];
  // Мозаики 16×16. Буква — цвет: b синий, g зелёный, t бирюзовый, r рубиновый, v фиолетовый, a жёлтый, w белый, n коричневый, k чёрный
  const PICS = [
    { title: "Парусник на Белом море", em: "⛵", fact: "Ломоносов вырос у Белого моря и с детства ходил с отцом на парусном судне.",
      rows: [
        "tttttttttttttttt", "ttttttttkrrtaatt", "ttttttttkrtaaaat", "tttttttwkttaaaat",
        "ttttttwwkwttaatt", "tttttwwwkwwttttt", "ttttwwwwkwwwtttt", "tttwwwwwkwwwwttt",
        "ttwwwwwwkwwwwttt", "twwwwwwwkwwwwttt", "tnnnnannannannnt", "tttnnnnnnnnnnttt",
        "bbbbbbbbbbbbbbbb", "bwwbbbbbbbbwwbbb", "bbbbbbwwbbbbbbbb", "bbbwbbbbbbbbbbwb"] },
    { title: "Венера на фоне Солнца", em: "🔭", fact: "В 1761 году Ломоносов увидел светлый ободок вокруг Венеры и догадался: у планеты есть атмосфера.",
      rows: [
        "wkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkwk", "kkkkkrrrrrrkkkkk", "kkwkraaaaaarkkkk",
        "kkkraaaaaaaarkkk", "kkraaaaaaaaaarkk", "kkraaaaaaaaaarkw", "kraaaaaaaaaaaark",
        "kraaaaaaawwaaark", "kraaaaaawvvwaark", "kkraaaaawvvwarkk", "kkraaaaaawwaarkk",
        "kkkraaaaaaaarkkk", "kkkkraaaaaarkkkw", "kwkkkrrrrrrkkkkk", "kkkkkkkkkkkkkwkk"] },
    { title: "Северное сияние над домом", em: "🌌", fact: "Ломоносов изучал северное сияние и написал о нём знаменитые стихи: «Открылась бездна звёзд полна; Звездам числа нет, бездне дна».",
      rows: [
        "bwbbbbbbbbbbwbbb", "bbbbbbwbbbggbbbb", "bbbbbbbbggttggwb", "gbbbbbbgttbbttgb",
        "tggbbggtbbbbbbtg", "bttvvvvvbbbbbbbv", "bbvttbbbvbbbbvvb", "vvbbbbbbbvvvvbbb",
        "bbbbbbbbbbbbbwbb", "bbwbbbbrbbbbbgbb", "bbbbbbrrrbbbgggb", "bbbbbrrrrrbggggg",
        "bbbbrrrrrrrbbnbb", "wwwwbnanknbwwwww", "wwwwwnnnknwwwwww", "wwwwwwwwwwwwwwww"] },
    { title: "Белый медведь на льдине", em: "🐻‍❄️", fact: "Белые медведи живут на берегах Белого и других северных морей — там, где рос Ломоносов.",
      rows: [
        "tttttttttttttttt", "taaatttttttttttt", "taaatttttttttttt", "taaatttttttttttt",
        "tttttttttttttttt", "tttttttttttwtttt", "ttttttwwtttwkwtt", "tttwwwwwwwwwwwkt",
        "ttwwwwwwwwwwwwwt", "ttwwwwwwwwwwtttt", "tttwwwwwwwwttttt", "tttwwtwwwwtttttt",
        "wwwwwwwwwwwwwwww", "bwwwwwwwwwwwwwbb", "bbbbtbbbbbbbbbtb", "bbbbbbbbbbtbbbbb"] },
    { title: "Рыба из обоза", em: "🐟", fact: "В Москву Ломоносов ушёл вместе с обозом, который вёз на продажу мороженую рыбу.",
      rows: [
        "bbbbbbbbbbbbbbbb", "bbbbtbbbbbbbbbbb", "bbbtbbbbbbbtbbbb", "bbbbbbbbbbtbbbbb",
        "bbbbbbbbbbbbbbbb", "bbbbbrrarrbbnbbb", "bbbrrrarrarrnnbb", "bbbrkwrrarrrnnnb",
        "bbrrrrrarrrrnnnn", "bbbrrrarrarrnnnb", "bbbrrarrarrrnnbb", "bbbbbrrarrbbnbbb",
        "bbbbbbbbbbbbbbbb", "bbtgbbbbbbbbbbbg", "bgbbbbbbbbbbtbgb", "gggggggggggggggg"] },
  ];
  const LET = { b: "blue", g: "green", t: "teal", r: "red", v: "violet", a: "amber", w: "white", n: "brown", k: "black" };

  Games.register({
    id: "glass", group: "3-4", mode: "solo", emoji: "⚗️", title: "Стекольная мастерская",
    short: "Свари цветное стекло, как Ломоносов: пробуй добавки и жар печи, записывай опыты и собери мозаику.",
    players: "1 игрок", time: "15 минут",
    rules: [
      "Выбери мозаику. Посмотри, какие цвета смальты для неё нужны.",
      "В мастерской выбери добавку и жар печи, нажми «Плавить». Получится стекло какого-то цвета.",
      "Все опыты записываются в журнал. Не вышло — попробуй иначе: другую добавку или другой жар.",
      "Когда все нужные цвета готовы, собери мозаику по номерам: выбери цвет и нажимай на клетки с его номером — сразу всю область или по одной клетке.",
      "Чем меньше опытов понадобилось, тем больше звёзд.",
      "Химия в игре упрощена: в настоящей мастерской цвет зависел ещё от состава стекла, количества добавки и многих других условий.",
    ],
    start(stage, ctx) {
      let pic, need, made = new Set(), journal = [];

      const LIGHT = ["white", "amber", "teal"];
      const thumb = (rows, size = 6) => h("div", { style: { display: "grid", gridTemplateColumns: `repeat(16, ${size}px)`, gridAutoRows: size + "px", margin: "0 auto", borderRadius: "6px", overflow: "hidden", width: "fit-content" } },
        rows.join("").split("").map(l => h("span", { style: { background: COL[LET[l]].hex } })));
      const choosePic = () => {
        U.clear(stage).append(h("div", { class: "center stack" },
          h("h2", null, "Какую мозаику соберём?"),
          h("p", { class: "muted" }, "В мастерской Ломоносова мозаики собирали из смальты — кусочков цветного непрозрачного стекла. Сначала стекло нужно сварить, а потом — выложить картину по номерам!"),
          h("div", { class: "row c" }, PICS.map(p => h("button", { class: "btn ghost", style: { flexDirection: "column", width: "190px", padding: "14px" }, onclick: () => { pic = p; lab(); } },
            thumb(p.rows, 7), h("span", { style: { marginTop: "8px" } }, p.title),
            h("span", { class: "small muted" }, `цветов: ${new Set(p.rows.join("")).size}`))))));
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
          class: "pill", style: { background: made.has(c) ? COL[c].hex : "#fff", color: made.has(c) && !LIGHT.includes(c) ? "#fff" : "var(--ink)", border: "2px solid " + COL[c].hex },
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
        let cur = cols[0], mode = "fill", painting = false;
        const grid = pic.rows.map(r => r.split("").map(l => ({ c: LET[l], done: false })));
        const num = c => cols.indexOf(c) + 1;
        const N = 16, ts = U.clamp(Math.floor((stage.clientWidth - 50) / N) - 2, 18, 38);
        const board = h("div", { style: { display: "grid", gridTemplateColumns: `repeat(${N}, ${ts}px)`, gap: "2px", justifyContent: "center", background: "#cfc6b6", padding: "6px", borderRadius: "12px", width: "fit-content", margin: "0 auto", touchAction: "none", userSelect: "none" } });
        const cellsEl = [];
        grid.forEach((row, y) => row.forEach((cell, x) => {
          const el = h("div", { "data-x": x, "data-y": y, style: { width: ts + "px", height: ts + "px", borderRadius: "3px", background: "#fffaf1", fontSize: Math.round(ts * .5) + "px", fontWeight: 650, color: "#8a7f70", cursor: "pointer", display: "grid", placeItems: "center", lineHeight: 1 } }, num(cell.c));
          cellsEl.push(el); board.append(el);
        }));
        const left = h("span", { class: "pill" });
        const palette = h("div", { class: "row c" });
        const modeBox = h("div", { class: "row c" });
        const remain = c => grid.flat().filter(x => !x.done && x.c === c).length;
        const drawPal = () => {
          U.clear(palette).append(cols.map(c => h("button", {
            class: "btn small", style: { background: COL[c].hex, color: LIGHT.includes(c) ? "#222" : "#fff", outline: c === cur ? "4px solid var(--ink)" : "none", outlineOffset: "2px", opacity: remain(c) ? 1 : .45 },
            onclick: () => { cur = c; drawPal(); highlight(); },
          }, `${num(c)} · ${COL[c].name}` + (remain(c) ? "" : " ✓"))));
          left.textContent = `Осталось клеток: ${grid.flat().filter(x => !x.done).length}`;
        };
        const drawMode = () => U.clear(modeBox).append([["fill", "🪣 Закрашивать всю область"], ["cell", "✏️ По одной клетке"]].map(([m, t]) =>
          h("button", { class: "btn small " + (mode === m ? "dark" : "ghost"), onclick: () => { mode = m; drawMode(); } }, t)));
        // подсвечиваем клетки выбранного цвета, чтобы их было легко найти
        const highlight = () => grid.forEach((row, y) => row.forEach((cell, x) => {
          if (cell.done) return;
          const el = cellsEl[y * N + x];
          el.style.background = cell.c === cur ? "#fff0c2" : "#fffaf1"; el.style.color = cell.c === cur ? "var(--ink)" : "#8a7f70";
        }));
        const paint = (x, y) => {
          const cell = grid[y][x]; cell.done = true;
          const el = cellsEl[y * N + x]; el.style.background = COL[cell.c].hex; el.textContent = ""; el.style.boxShadow = "inset 0 0 0 1px #0001, inset 2px 2px 0 #fff4";
        };
        const fillRegion = (x, y) => {
          const c = grid[y][x].c, st = [[x, y]];
          while (st.length) {
            const [a, b] = st.pop(); const cell = grid[b] && grid[b][a];
            if (!cell || cell.done || cell.c !== c) continue;
            paint(a, b); st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
          }
        };
        let warned = 0;
        const tap = (x, y, fromDrag) => {
          const cell = grid[y][x]; if (cell.done) return;
          if (cell.c !== cur) {
            if (!fromDrag && Date.now() - warned > 1500) { warned = Date.now(); Sfx.bad(); toast(`Здесь номер ${num(cell.c)} — нужен ${COL[cell.c].name} цвет`); }
            return;
          }
          mode === "fill" ? fillRegion(x, y) : paint(x, y);
          Sfx.tone(500 + Math.random() * 400, .06, "triangle", .08);
          drawPal();
          if (grid.every(r => r.every(c => c.done))) done();
        };
        const cellAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.dataset && el.dataset.x != null ? el : null; };
        board.addEventListener("pointerdown", e => { const el = cellAt(e); if (!el) return; painting = true; tap(+el.dataset.x, +el.dataset.y, false); });
        board.addEventListener("pointermove", e => { if (!painting || mode !== "cell") return; const el = cellAt(e); if (el) tap(+el.dataset.x, +el.dataset.y, true); });
        const stop = () => painting = false;
        addEventListener("pointerup", stop); ctx.onCleanup(() => removeEventListener("pointerup", stop));
        const done = () => {
          const extra = journal.length - need.length;
          const stars = extra <= 3 ? 3 : extra <= 8 ? 2 : 1;
          finale(stage, {
            stars, title: `Мозаика «${pic.title}» готова!`,
            text: `Тебе понадобилось опытов: ${journal.length}. ${extra <= 3 ? "Почти без ошибок — как настоящий мастер!" : "Каждая неудача подсказывала, что поменять. Так и работают исследователи."}`,
            extra: thumb(pic.rows, U.clamp(Math.floor((stage.clientWidth - 40) / 16), 12, 26)),
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
          h("p", { class: "muted" }, "Выбери цвет — его клетки подсветятся. Нажимай на клетки с этим номером. В режиме «По одной клетке» можно вести пальцем или мышкой."),
          modeBox, palette, left, board));
        drawMode(); drawPal(); highlight();
      };

      choosePic();
    },
  });
})();
