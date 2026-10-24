/* 1–2 классы · Я с друзьями · «Покажи без слов» — пантомима по картинкам */
"use strict";
(() => {
  const CARDS = [
    ["🎣", "Рыбак"], ["⛵", "Парусник"], ["🛷", "Сани"], ["🔭", "Смотреть в телескоп"], ["📖", "Читать книгу"],
    ["🪶", "Писать пером"], ["❄️", "Снегопад"], ["🥶", "Мороз"], ["⭐", "Звезда"], ["🪐", "Планета"],
    ["🧩", "Собирать мозаику"], ["🎨", "Художник"], ["✍️", "Поэт сочиняет стихи"], ["🎓", "Студент"], ["🧪", "Опыт с колбой"],
    ["🚢", "Корабль в шторм"], ["🌬️", "Сильный ветер"], ["🐟", "Рыба"], ["🐴", "Лошадь везёт сани"], ["👩‍🏫", "Учитель"],
    ["❓", "Задать вопрос"], ["🔥", "Печь, в которой плавят стекло"], ["🌊", "Море"], ["🐻", "Белый медведь"], ["🏛️", "Университет"],
    ["🧭", "Компас"], ["🥾", "Идти по сугробам"], ["🔔", "Звонок на урок"], ["🌙", "Ночь"], ["☀️", "Солнце"],
    ["🧮", "Считать"], ["🙋", "Поднять руку на уроке"], ["🏃", "Бежать догонять обоз"], ["🍞", "Есть хлеб"], ["💡", "Догадаться!"],
  ];

  Games.register({
    id: "mime", group: "1-2", mode: "friends", emoji: "🤫", title: "Покажи без слов",
    short: "Командная пантомима: показывай руками и лицом слова из жизни Ломоносова, а друзья отгадывают.",
    players: "от 3 человек, 2 команды", time: "15–20 минут",
    rules: [
      "Делитесь на две команды. Игрок из команды берёт телефон или встаёт у экрана так, чтобы картинку видел только он.",
      "Нажимает «Начали!» и показывает слово без слов и звуков — только жестами.",
      "Своя команда отгадывает. Угадали — нажми «Угадали!», не получается — «Другое слово».",
      "За минуту можно показать несколько слов. Потом ход другой команды. Играйте 3 круга.",
    ],
    async start(stage, ctx) {
      const teams = await setupPlayers(stage, { min: 2, max: 3, def: 2, label: "Команды", noun: "Команда", defaults: ["Звездочёты", "Мореходы"] });
      let deck = U.shuffle(CARDS), turn = 0, round = 1;
      const ROUNDS = 3, SEC = 60;

      const nextTurn = async () => {
        const t = teams[turn];
        await new Promise(res => U.clear(stage).append(h("div", { class: "center stack" }, scoreBar(teams, turn),
          h("p", { class: "pill" }, `Круг ${round} из ${ROUNDS}`), h("h2", { style: { color: t.color } }, `${t.avatar} Показывает команда «${t.name}»`),
          h("p", null, "Выберите, кто показывает. Он смотрит на экран, остальные — нет!"),
          h("button", { class: "btn big", onclick: res }, "Начали! ⏱"))));
        let guessed = 0;
        const card = h("div", { class: "center" });
        const timer = new Timer(SEC, { onEnd: () => end() });
        const showCard = () => {
          if (!deck.length) deck = U.shuffle(CARDS);
          const [em, word] = deck.pop();
          U.clear(card).append(h("div", { class: "big-emoji bounce" }, em), h("div", { class: "title-xl" }, word));
        };
        const end = async () => {
          timer.stop(); t.score += guessed;
          await modal(h("div", { class: "center" }, h("div", { class: "big-emoji" }, "⏰"), h("h2", null, "Время вышло!"), h("p", null, `Команда «${t.name}» угадала: ${guessed}`)), { buttons: [{ text: "Дальше" }] });
          turn = (turn + 1) % teams.length;
          if (turn === 0) round++;
          if (round > ROUNDS) return finale(stage, { players: teams, text: "Молодцы! Ломоносов был и мореходом, и учёным, и художником, и поэтом. Какое слово было самым трудным?", hashtag: ctx.hashtag, onAgain: ctx.restart });
          nextTurn();
        };
        U.clear(stage).append(h("div", { class: "stack center" }, timer.el, card,
          h("div", { class: "row c" },
            h("button", { class: "btn ok big", onclick: () => { guessed++; Sfx.ok(); showCard(); } }, "✓ Угадали!"),
            h("button", { class: "btn ghost big", onclick: () => { Sfx.click(); showCard(); } }, "Другое слово"))));
        showCard(); timer.start();
        ctx.onCleanup(() => timer.stop());
      };
      nextTurn();
    },
  });
})();
