/* 1 курс СПО · Я с командой · «Промычи хит» — изобрази мелодию без слов */
"use strict";
(() => {
  // [название, песня Пахмутовой?, id фрагмента]
  const POOL = [
    ["Трус не играет в хоккей", true, "hockey"], ["До свиданья, Москва", true, "moskva"], ["Нежность", true, "nezhnost"], ["Как молоды мы были", true, "molody"],
    ["Беловежская пуща", true, "belovezh"], ["Птица счастья", true, "ptica"], ["Созвездие Гагарина", true, "gagarin"], ["Я не могу иначе", true, "inache"],
    ["Надежда", true], ["Команда молодости нашей", true], ["Мелодия", true], ["Старый клён", true],
    ["Улыбка (из мультфильма «Крошка Енот»)", false], ["Голубой вагон", false], ["Песенка крокодила Гены (из мультфильма про Чебурашку)", false],
    ["В траве сидел кузнечик", false], ["Чунга-Чанга", false], ["Прекрасное далёко", false], ["Крылатые качели", false], ["Катюша", false],
    ["Подмосковные вечера", false], ["Калинка", false], ["Трава у дома", false], ["Миллион алых роз", false], ["Ой, мороз, мороз", false],
    ["Песенка о медведях (из фильма «Кавказская пленница»)", false], ["В лесу родилась ёлочка", false], ["Happy Birthday to You", false],
    ["Гимн России", false], ["Песенка Винни-Пуха (из советского мультфильма)", false], ["Антошка", false], ["Пусть всегда будет солнце", false],
  ];

  Games.register({
    id: "hum", group: "spo1", mode: "friends", emoji: "🎶", title: "Промычи хит",
    short: "Командная игра: напой мелодию без слов — «м-м-м» или «ля-ля-ля» — так, чтобы своя команда угадала песню. Звёздочкой отмечены хиты Пахмутовой.",
    players: "от 4 человек, 2–4 команды", time: "20 минут",
    rules: [
      "Делитесь на команды. Исполнитель смотрит на экран — название видит только он.",
      "Не знаешь песню? Нажми «🎧 Подслушать» (лучше в наушниках) — у хитов Пахмутовой есть фрагмент.",
      "Мычи или напевай «ля-ля-ля» — слова петь нельзя! Команда угадывает за 30 секунд.",
      "Угадали в первые 15 секунд — 2 очка, позже — 1. Песня Пахмутовой и Добронравова ★ — ещё +1. Пять ходов на команду.",
    ],
    async start(stage, ctx) {
      const teams = await setupPlayers(stage, { min: 2, max: 4, def: 2, label: "Команды", noun: "Команда", defaults: ["Высотники", "Геологи", "Машинисты", "Монтажники"] });
      const ROUNDS = 5;
      let deck = U.shuffle(POOL), turn = 0, round = 1;
      ctx.onCleanup(() => Music.stop());
      const next = async () => {
        const t = teams[turn];
        await new Promise(res => U.clear(stage).append(h("div", { class: "center stack" }, scoreBar(teams, turn), h("span", { class: "pill" }, `Ход ${round} из ${ROUNDS}`),
          h("h2", { style: { color: t.color } }, `Мычит команда ${t.avatar} «${t.name}»`), h("p", null, "Выберите исполнителя. Экран — только ему!"),
          h("button", { class: "btn big", onclick: res }, "Показать песню исполнителю"))));
        if (!deck.length) deck = U.shuffle(POOL);
        let [title, pah, sid] = deck.pop();
        let swaps = 1;
        const tBox = h("div", { class: "center" });
        const drawTitle = () => U.clear(tBox).append(h("div", { class: "title-xl" }, (pah ? "★ " : "") + "«" + title + "»"), pah ? h("p", { class: "muted" }, "Песня Пахмутовой и Добронравова: +1 очко") : null,
          h("div", { class: "row c" }, sid ? Music.button(sid, "🎧 Подслушать", { from: 0, dur: 15 }) : null,
            swaps ? h("button", { class: "btn ghost small", onclick: () => { swaps--; Music.stop(); [title, pah, sid] = deck.pop() || U.pick(POOL); drawTitle(); } }, "Не знаю эту — заменить (1 раз)") : null));
        drawTitle();
        await new Promise(res => U.clear(stage).append(h("div", { class: "center stack" }, tBox, h("p", { class: "small muted" }, "Запомнил мелодию? Повернись к команде."), h("button", { class: "btn big", onclick: () => { Music.stop(); res(); } }, "Начать мычать! ⏱"))));
        const timer = new Timer(30, { onEnd: () => done(0) });
        ctx.onCleanup(() => timer.stop());
        const done = async pts => {
          timer.stop();
          const bonus = pts && pah ? 1 : 0;
          t.score += pts + bonus; pts ? Sfx.ok() : Sfx.bad();
          await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji" }, pts ? "🎉" : "🤐"), h("h2", null, pts ? `+${pts + bonus} команде «${t.name}»` : "Не угадали"),
            h("p", null, "Это была песня «" + title + "»" + (pah ? " — Александры Пахмутовой" : "")), sid ? h("div", { class: "row c" }, Music.button(sid, "▶ Послушать", { from: 0, dur: 20 })) : null), { buttons: [{ text: "Дальше" }] });
          Music.stop();
          turn = (turn + 1) % teams.length; if (turn === 0) round++;
          if (round > ROUNDS) return finale(stage, { players: teams, text: "Мелодию узнают без единого слова — вот почему хорошая песня живёт десятилетиями. Какая мелодия оказалась самой узнаваемой?", hashtag: ctx.hashtag, onAgain: ctx.restart });
          next();
        };
        U.clear(stage).append(h("div", { class: "center stack" }, h("p", { class: "muted" }, "Только мелодия, никаких слов! 🤐"), timer.el,
          h("div", { class: "row c" },
            h("button", { class: "btn ok big", onclick: () => done(timer.left > 15 ? 2 : 1) }, "✓ Угадали!"),
            h("button", { class: "btn bad big", onclick: () => done(0) }, "✗ Сдаёмся"))));
        timer.start();
      };
      next();
    },
  });
})();
