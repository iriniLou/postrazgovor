/* 6–7 классы · Я с командой · «Объясни слово» — алиас про мир песен Пахмутовой и Добронравова */
"use strict";
(() => {
  const WORDS = {
    "Космос и небо": ["Гагарин", "космонавт", "ракета", "орбита", "созвездие", "невесомость", "скафандр", "лётчик", "парашют", "аэродром", "иллюминатор", "Байконур", "спутник", "небо", "звезда"],
    "Великие стройки": ["стройка", "тайга", "ГЭС", "плотина", "бетон", "подъёмный кран", "каска", "бригада", "вахта", "палатка", "геолог", "буровая", "ЛЭП", "Сибирь", "Ангара", "Байкал", "рельсы", "экскаватор"],
    "Спорт": ["хоккей", "шайба", "клюшка", "вратарь", "Олимпиада", "Олимпийский мишка", "воздушные шары", "стадион", "болельщик", "медаль", "пьедестал", "капитан", "тренер", "команда", "факел", "сборная"],
    "Музыка": ["композитор", "поэт", "рояль", "пластинка", "мелодия", "припев", "куплет", "ноты", "дирижёр", "микрофон", "сцена", "аплодисменты", "хор", "оркестр", "радио", "магнитофон", "гитара", "песенник", "концерт", "репетиция"],
    "Чувства и жизнь": ["нежность", "надежда", "дружба", "разлука", "встреча", "письмо", "вокзал", "поезд", "телеграмма", "молодость", "память", "мечта", "счастье", "костёр", "рюкзак", "юбилей", "фотоальбом", "бабушка"],
    "Природа": ["зубр", "пуща", "клён", "тополь", "берёза", "метель", "северное сияние", "река", "сопка", "кедр", "рассвет"],
  };
  const ALL = Object.entries(WORDS).flatMap(([cat, ws]) => ws.map(w => [w, cat]));

  Games.register({
    id: "alias", group: "6-7", mode: "friends", emoji: "🗣️", title: "Объясни слово",
    short: "Командная игра на скорость: объясняй слова из мира песен — космос, стройки, хоккей, музыка — не называя их.",
    players: "от 4 человек, 2–4 команды", time: "20 минут",
    rules: [
      "Делитесь на команды. Объясняющий смотрит на экран, его команда — нет.",
      "Объясняй слово другими словами, жестами, примерами. Нельзя называть само слово и однокоренные.",
      "Угадали — «✓», не получается — «Пропуск» (−1 очко, если включён штраф). На ход — 60 секунд.",
      "Играем до 25 очков. Объясняющие в команде меняются каждый ход.",
    ],
    async start(stage, ctx) {
      let penalty = true, goal = 25;
      const extra = h("div", { class: "row c" },
        h("label", { class: "row", style: { gap: "6px" } }, h("input", { type: "checkbox", checked: true, onchange: e => penalty = e.target.checked }), "Штраф за пропуск"),
        h("label", { class: "row", style: { gap: "6px" } }, "До", h("select", { onchange: e => goal = +e.target.value }, [15, 25, 40].map(v => h("option", { value: v, selected: v === 25 }, v))), "очков"));
      const teams = await setupPlayers(stage, { min: 2, max: 4, def: 2, label: "Команды", noun: "Команда", defaults: ["Хоккеисты", "Космонавты", "Геологи", "Музыканты"], extra });
      let deck = U.shuffle(ALL), turn = 0;
      const nextTurn = async () => {
        const t = teams[turn];
        await new Promise(res => U.clear(stage).append(h("div", { class: "center stack" }, scoreBar(teams, turn),
          h("h2", { style: { color: t.color } }, `Объясняет команда ${t.avatar} «${t.name}»`), h("p", null, `Играем до ${goal} очков. Выберите, кто объясняет, — экран только ему!`),
          h("button", { class: "btn big", onclick: res }, "Поехали! ⏱"))));
        const log = [];
        const card = h("div", { class: "center" });
        let cur;
        const timer = new Timer(60, { onEnd: () => end() });
        ctx.onCleanup(() => timer.stop());
        const show = () => {
          if (!deck.length) deck = U.shuffle(ALL);
          cur = deck.pop();
          U.clear(card).append(h("span", { class: "pill" }, cur[1]), h("div", { class: "title-xl bounce", style: { margin: "14px 0" } }, cur[0]));
        };
        const end = async () => {
          timer.stop();
          const pts = log.filter(x => x[1]).length - (penalty ? log.filter(x => !x[1]).length : 0);
          t.score = Math.max(0, t.score + pts);
          await modal(h("div", { class: "stack" }, h("h2", { class: "center" }, `Время! Команда «${t.name}»: ${pts >= 0 ? "+" : ""}${pts}`),
            h("div", { class: "row c" }, log.map(([w, ok]) => h("span", { class: "pill", style: { background: ok ? "#e3f4ea" : "#fbe5e2", color: ok ? "var(--ok)" : "var(--bad)" } }, (ok ? "✓ " : "✗ ") + w)))), { buttons: [{ text: "Дальше" }] });
          const lead = teams.find(x => x.score >= goal);
          turn = (turn + 1) % teams.length;
          if (lead && turn === 0) return finale(stage, { players: teams, text: "В песнях Пахмутовой и Добронравова — целая эпоха: космос, стройки, спорт и простые человеческие чувства. Какое слово было самым трудным?", hashtag: ctx.hashtag, onAgain: ctx.restart });
          nextTurn();
        };
        U.clear(stage).append(h("div", { class: "stack center" }, timer.el, card,
          h("div", { class: "row c" },
            h("button", { class: "btn ok big", onclick: () => { log.push([cur[0], true]); Sfx.ok(); show(); } }, "✓ Угадали"),
            h("button", { class: "btn ghost big", onclick: () => { log.push([cur[0], false]); Sfx.click(); show(); } }, penalty ? "Пропуск (−1)" : "Пропуск"))));
        show(); timer.start();
      };
      nextTurn();
    },
  });
})();
