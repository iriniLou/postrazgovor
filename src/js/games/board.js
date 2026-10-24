/* 3–4 классы · Я с семьёй · «Путь к открытию» — настольная ходилка с кубиком */
"use strict";
(() => {
  const N = 30;
  const PLACES = { 1: "Деревня", 6: "Белое море", 11: "Обоз", 15: "Москва", 19: "Академия", 22: "Петербург", 25: "Германия", 28: "Лаборатория", 30: "Университет" };
  // Особые клетки: go — переход на клетку, skip — пропуск хода, q — вопрос, task — задание для всех
  const CELLS = {
    3: { t: "go", to: 8, em: "📖", text: "Сосед дал почитать «Арифметику»! Знания помогают — поднимайся на клетку 8." },
    5: { t: "q" }, 9: { t: "q" }, 13: { t: "q" }, 17: { t: "q" }, 21: { t: "q" }, 25: { t: "q" }, 28: { t: "q" },
    6: { t: "go", to: 4, em: "🌊", text: "Шторм на Белом море! Лодка вернулась к берегу — назад на клетку 4." },
    7: { t: "task" }, 16: { t: "task" }, 23: { t: "task" },
    10: { t: "skip", em: "🏠", text: "Отец уговаривает остаться дома и ходить в море. Подумай как следует — пропусти ход." },
    11: { t: "go", to: 15, em: "🐴", text: "Ты догнал рыбный обоз! С ним дорога быстрее — вперёд до Москвы, клетка 15." },
    14: { t: "go", to: 9, em: "🥶", text: "Сильный мороз, обоз стоит. Вернись на клетку 9." },
    18: { t: "go", to: 22, em: "👩‍🏫", text: "Учитель объяснил трудную тему. Спрашивать — не стыдно! Вперёд до клетки 22." },
    20: { t: "go", to: 16, em: "😴", text: "Лень и отговорки «потом, потом»… Назад на клетку 16." },
    24: { t: "go", to: 19, em: "😶", text: "Постеснялся спросить и запутался. Назад на клетку 19. В следующий раз — спроси!" },
    26: { t: "go", to: 29, em: "🧪", text: "Опыт удался после многих попыток! Вперёд до клетки 29." },
    27: { t: "skip", em: "💥", text: "Опыт не получился. Пропусти ход и подумай, что изменить в следующий раз." },
  };
  const QUESTIONS = [
    ["В какой город отправился учиться Михаил Ломоносов?", ["В Москву", "В Архангельск", "В Казань"], 0],
    ["С кем Миша отправился в путь?", ["С рыбным обозом", "С караваном верблюдов", "С цирком"], 0],
    ["Сколько лет было Ломоносову, когда он ушёл учиться?", ["19 лет", "10 лет", "30 лет"], 0],
    ["Что Ломоносов разглядел у планеты Венеры?", ["Атмосферу — воздушную оболочку", "Кольца", "Горы"], 0],
    ["Какой прибор помогал Ломоносову наблюдать Венеру?", ["Телескоп", "Микроскоп", "Компас"], 0],
    ["Из чего Ломоносов собирал мозаики?", ["Из цветного стекла — смальты", "Из фантиков", "Из ракушек"], 0],
    ["Как называется огромная мозаика из мастерской Ломоносова?", ["«Полтавская баталия»", "«Утро в лесу»", "«Девятый вал»"], 0],
    ["Какой университет помог основать Ломоносов?", ["Московский", "Казанский", "Новосибирский"], 0],
    ["В каком году открылся Московский университет?", ["В 1755", "В 1855", "В 1955"], 0],
    ["Как называется книга Ломоносова о правилах русского языка?", ["«Российская грамматика»", "«Весёлая азбука»", "«Сказки о буквах»"], 0],
    ["Где родился Ломоносов?", ["На Русском Севере, у Холмогор", "В Москве", "У Чёрного моря"], 0],
    ["Чем занимался отец Михаила?", ["Ловил рыбу и ходил в море", "Писал книги", "Строил дворцы"], 0],
    ["Что такое смальта?", ["Цветное непрозрачное стекло", "Краска для забора", "Морская рыба"], 0],
    ["Где Ломоносов учился после Москвы и Петербурга?", ["В Германии", "В Китае", "В Египте"], 0],
    ["Что больше всего помогало Ломоносову учиться?", ["Любознательность и упорство", "Удача", "Богатые родители"], 0],
    ["Кем был Ломоносов?", ["И учёным, и поэтом, и художником", "Только поэтом", "Только моряком"], 0],
    ["Что лучше сделать, если тема непонятна?", ["Спросить и попробовать разобраться", "Бросить", "Сделать вид, что понял"], 0],
    ["Атмосфера — это…", ["Газовая оболочка планеты", "Высокие горы", "Глубокий океан"], 0],
    ["Что Ломоносов изучал на северном ночном небе?", ["Северное сияние", "Радугу", "Туман"], 0],
    ["Сколько опытов со стеклом провёл Ломоносов?", ["Больше четырёх тысяч", "Четыре", "Сорок"], 0],
    ["Какие две книги Ломоносов называл «вратами своей учёности»?", ["«Грамматику» и «Арифметику»", "Сказки и былины", "Атлас и словарь"], 0],
    ["Как учёный узнаёт новое?", ["Замечает, задаёт вопрос, ищет объяснение", "Ждёт, пока кто-то расскажет", "Угадывает"], 0],
  ];
  const TASKS = [
    "Каждый по очереди называет, чему хочет научиться в этом году.",
    "Найдите дома любой предмет из стекла. Расскажите, для чего он нужен.",
    "Все вместе покажите, как смотрят в телескоп. Кто первым «заметит» в комнате что-то необычное?",
    "Придумайте вопрос, который начинается со слова «почему». Кто знает ответ? Если никто — запишите и найдите ответ завтра!",
    "Вспомните, что у вас получилось не с первого раза. Что помогло?",
    "Назовите три профессии, в которых нужна химия.",
    "Сочините вместе две строчки стихотворения про зиму или звёзды.",
    "Расскажите, кто в вашей семье что-то умеет делать очень хорошо. Как он этому научился?",
  ];
  const DICE = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  Games.register({
    id: "board", group: "3-4", mode: "family", emoji: "🎲", title: "Путь к открытию",
    short: "Настольная игра с кубиком: от деревни у Белого моря до Московского университета. Помощники ведут вперёд, трудности — назад.",
    players: "2–4 игрока", time: "20–30 минут",
    rules: [
      "Игроки по очереди бросают кубик и идут вперёд.",
      "Книга, обоз, учитель и удачный опыт — помощники: переносят вперёд. Шторм, мороз, лень и стеснение — трудности: отбрасывают назад.",
      "На клетке ❓ ответь на вопрос: верно — ещё 2 шага вперёд.",
      "На клетке 💡 задание для всей семьи: выполнили — игрок делает шаг вперёд.",
      "Побеждает тот, кто первым дойдёт до университета.",
    ],
    async start(stage, ctx) {
      const players = await setupPlayers(stage, { min: 2, max: 4, def: 2, label: "Кто играет?", noun: "Игрок" });
      players.forEach(p => { p.pos = 1; p.skip = false; });
      let turn = 0, busy = false, qDeck = U.shuffle(QUESTIONS), tDeck = U.shuffle(TASKS);

      const cellsEl = {};
      const board = h("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", maxWidth: "720px", margin: "0 auto" } });
      for (let i = 1; i <= N; i++) {
        const r = Math.floor((i - 1) / 6), c = (i - 1) % 6;
        const sp = CELLS[i];
        const icon = i === 1 ? "🏠" : i === N ? "🏛️" : sp ? (sp.t === "q" ? "❓" : sp.t === "task" ? "💡" : sp.em) : "";
        const good = sp && sp.t === "go" && sp.to > i, bad = sp && ((sp.t === "go" && sp.to < i) || sp.t === "skip");
        const toks = h("div", { class: "em", style: { fontSize: "20px", minHeight: "24px", lineHeight: "1" } });
        const el = h("div", {
          style: {
            gridRow: 5 - r, gridColumn: r % 2 === 0 ? c + 1 : 6 - c, aspectRatio: "1.15", borderRadius: "12px", padding: "4px 6px",
            background: i === N ? "var(--accent)" : good ? "#e3f4ea" : bad ? "#fbe5e2" : sp && sp.t === "q" ? "var(--soft)" : sp ? "#fff3e0" : "#fff",
            color: i === N ? "#fff" : "inherit", border: "1.5px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0,
          },
        },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2px" } },
            h("b", { style: { fontSize: "13px" } }, i), h("span", { class: "em", style: { fontSize: "clamp(16px, 3.4vw, 24px)" } }, icon)),
          PLACES[i] ? h("div", { style: { fontSize: "11px", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, PLACES[i]) :
            sp && sp.t === "go" ? h("div", { style: { fontSize: "11px", fontWeight: 650 } }, (sp.to > i ? "↗ " : "↙ ") + sp.to) : h("div"),
          toks);
        cellsEl[i] = toks; board.append(el);
      }
      const dice = h("div", { class: "em", style: { fontSize: "64px", lineHeight: 1 } }, "🎲");
      const bar = h("div");
      const who = h("h3", { class: "center" });
      const rollBtn = h("button", { class: "btn big", onclick: () => roll() }, "Бросить кубик");
      U.clear(stage).append(bar, who, h("div", { class: "row c", style: { marginBottom: "12px" } }, dice, rollBtn), board);

      const drawTokens = () => {
        Object.values(cellsEl).forEach(e => U.clear(e));
        players.forEach(p => cellsEl[Math.min(p.pos, N)].append(h("span", { title: p.name, style: { filter: `drop-shadow(0 0 2px ${p.color})` } }, p.avatar)));
      };
      const drawHud = () => {
        U.clear(bar).append(scoreBar(players.map(p => ({ ...p, score: p.pos })), turn, { suffix: "" }));
        const p = players[turn]; who.textContent = `Ходит ${p.avatar} ${p.name}`; who.style.color = p.color;
      };
      const walk = async (p, to) => {
        const dir = Math.sign(to - p.pos);
        while (p.pos !== to) { p.pos += dir; drawTokens(); Sfx.step(); await U.wait(220); }
      };
      const message = (em, title, text) => modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji bounce" }, em), h("h2", null, title), h("p", { style: { fontSize: "19px" } }, text)), { buttons: [{ text: "Дальше" }] });

      const roll = async () => {
        if (busy) return; busy = true; rollBtn.disabled = true;
        const p = players[turn];
        if (p.skip) {
          p.skip = false; await message("⏸", `${p.name} пропускает ход`, "В следующий раз повезёт больше!");
          return nextTurn();
        }
        Sfx.dice();
        for (let i = 0; i < 8; i++) { dice.textContent = U.pick(DICE); await U.wait(70); }
        const n = 1 + (Math.random() * 6 | 0); dice.textContent = DICE[n - 1];
        await U.wait(250);
        await walk(p, Math.min(N, p.pos + n));
        await land(p);
      };
      const land = async p => {
        if (p.pos >= N) return win(p);
        const sp = CELLS[p.pos];
        if (sp && sp.t === "go") {
          sp.to > p.pos ? Sfx.ok() : Sfx.bad();
          await message(sp.em, sp.to > p.pos ? "Помощник!" : "Трудность!", sp.text);
          await walk(p, sp.to);
          if (p.pos >= N) return win(p);
        } else if (sp && sp.t === "skip") {
          Sfx.bad(); p.skip = true; await message(sp.em, "Пауза", sp.text);
        } else if (sp && sp.t === "q") {
          if (!qDeck.length) qDeck = U.shuffle(QUESTIONS);
          const [q, opts, right] = qDeck.pop();
          const order = U.shuffle(opts.map((o, i) => i));
          const box = h("div", { class: "stack" }, h("div", { class: "center big-emoji", style: { fontSize: "56px" } }, "❓"), h("h2", { class: "center" }, q));
          let ok = false;
          askOptions(box, order.map(i => opts[i]), order.indexOf(right)).then(v => ok = v);
          await modal(box, { buttons: [{ text: "Дальше" }] });
          if (ok) { toast("Верно! +2 шага"); await walk(p, Math.min(N, p.pos + 2)); if (p.pos >= N) return win(p); }
          else toast("Ничего, теперь вы знаете правильный ответ!");
        } else if (sp && sp.t === "task") {
          if (!tDeck.length) tDeck = U.shuffle(TASKS);
          const v = await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji bounce" }, "💡"), h("h2", null, "Задание для всей семьи"), h("p", { style: { fontSize: "19px" } }, tDeck.pop())),
            { buttons: [{ text: "Сделали! +1 шаг", value: true, cls: "ok" }, { text: "Пропустить", value: false, cls: "ghost" }] });
          if (v) { await walk(p, p.pos + 1); await land(p); return; }
        }
        nextTurn();
      };
      const nextTurn = () => { turn = (turn + 1) % players.length; drawHud(); busy = false; rollBtn.disabled = false; };
      const win = p => {
        players.forEach(x => x.score = x === p ? 1 : 0);
        finale(stage, {
          title: `${p.avatar} ${p.name} дошёл до университета первым!`,
          text: "Путь Ломоносова к знаниям занял больше десяти лет: деревня, дорога в Москву, академия, Петербург, Германия. А какая клетка на этом пути была самой трудной для вас?",
          facts: ["<b>Интерес → учёба → опыты и труд → результат → польза людям.</b> Так мечта становится делом — и у Ломоносова, и у каждого из нас."],
          hashtag: ctx.hashtag, onAgain: ctx.restart,
        });
      };
      drawTokens(); drawHud();
    },
  });
})();
