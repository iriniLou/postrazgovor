/* 8–9 классы · Я с семьёй · «Кто кого перепоёт» — песенная дуэль поколений */
"use strict";
(() => {
  // слово и подсказка: названия песен Пахмутовой и Добронравова, где есть это слово или тема
  const WORDS = [
    ["небо", "«Обнимая небо»"], ["Москва", "«До свиданья, Москва»"], ["сердце", "«Главное, ребята, сердцем не стареть»"], ["молодость", "«Команда молодости нашей», «Как молоды мы были»"],
    ["надежда", "«Надежда»"], ["птица", "«Птица счастья»"], ["звезда", "«Созвездие Гагарина», цикл «Таёжные звёзды»"], ["счастье", "«Птица счастья»"],
    ["мелодия", "«Мелодия»"], ["нежность", "«Нежность»"], ["лес", "«Беловежская пуща»"], ["дорога", null], ["друг", null], ["весна", null], ["море", null],
    ["поезд", null], ["солнце", null], ["город", null], ["песня", null], ["мама", null], ["ветер", null], ["снег", null], ["любовь", null], ["мечта", null],
    ["земля", null], ["река", null], ["лето", null], ["ночь", null], ["дом", null], ["берёза", null], ["школа", null], ["улица", null], ["окно", null], ["зима", null],
  ];

  Games.register({
    id: "singbattle", group: "8-9", mode: "family", emoji: "🎤", title: "Кто кого перепоёт",
    short: "Песенная дуэль поколений: на экране слово — команды по очереди поют строчки любых песен, где оно есть. Кто первым не вспомнит — проиграл раунд.",
    players: "2 команды: младшие и старшие", time: "20 минут", needs: "🎶 нужно петь!",
    rules: [
      "На экране появляется слово, например «небо».",
      "Команды по очереди поют хотя бы строчку любой песни, где есть это слово. На ход — 20 секунд.",
      "Повторять песни нельзя. Соперники решают, засчитать ли ответ.",
      "Каждая спетая песня — +1 очко, песня Пахмутовой и Добронравова — +2. Кто не успел вспомнить — проиграл раунд, а соперники получают ещё +2.",
      "Застряли? Есть подсказка — название песни Пахмутовой на эту тему (не для всех слов).",
    ],
    async start(stage, ctx) {
      const teams = await setupPlayers(stage, { min: 2, max: 2, def: 2, label: "Команды", noun: "Команда", defaults: ["Младшие", "Старшие"] });
      const deck = U.shuffle(WORDS);
      let round = 0, first = 0;
      const ROUNDS = 8;
      const nextRound = () => {
        if (round >= ROUNDS) return finale(stage, { players: teams, text: "Какие песни совпали у разных поколений? Что из спетого старшими вы слышали впервые? Попросите рассказать историю одной из этих песен.", hashtag: ctx.hashtag, onAgain: ctx.restart });
        round++;
        const [word, hint] = deck.pop();
        let turn = first, sung = 0;
        first = 1 - first;
        const turnBox = h("div", { class: "center stack" });
        const drawTurn = () => {
          const t = teams[turn];
          const timer = new Timer(20, { onEnd: () => lose(), warn: 5 });
          ctx.onCleanup(() => timer.stop());
          U.clear(turnBox).append(
            h("h3", { style: { color: t.color } }, `Поёт команда ${t.avatar} «${t.name}»`), timer.el,
            h("div", { class: "row c" },
              h("button", { class: "btn ok big", onclick: () => { timer.stop(); Sfx.ok(); sung++; t.score += 1; refresh(); turn = 1 - turn; drawTurn(); } }, "✓ Спели! (+1)"),
              h("button", { class: "btn dark", onclick: () => { timer.stop(); Sfx.ok(); sung++; t.score += 2; refresh(); toast("Песня Пахмутовой и Добронравова! +2"); turn = 1 - turn; drawTurn(); } }, "✓ Спели песню Пахмутовой (+2)"),
              h("button", { class: "btn bad", onclick: () => { timer.stop(); lose(); } }, "✗ Не вспомнили")));
          timer.start();
        };
        const lose = async () => {
          const loser = teams[turn], winner = teams[1 - turn];
          winner.score += 2; refresh(); Sfx.buzz();
          await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji" }, "🏆"), h("h2", null, `Раунд за командой «${winner.name}»! +2`),
            h("p", null, `Слово «${word}»: спето песен — ${sung}.`), hint ? h("p", { class: "muted" }, `А у Пахмутовой и Добронравова есть: ${hint}.`) : null), { buttons: [{ text: "Следующее слово ▶" }] });
          nextRound();
        };
        let bar = scoreBar(teams);
        const refresh = () => { const nb = scoreBar(teams); bar.replaceWith(nb); bar = nb; };
        U.clear(stage).append(bar, h("div", { class: "center stack" },
          h("span", { class: "pill" }, `Раунд ${round} из ${ROUNDS}`), h("p", { class: "muted" }, "Пойте песни со словом"),
          h("div", { class: "title-xl bounce", style: { fontSize: "clamp(40px, 10vw, 72px)", color: "var(--accent)" } }, "«" + word + "»"),
          hint ? h("button", { class: "btn ghost small", onclick: e => { e.target.replaceWith(h("p", { class: "panel" }, "Подсказка: " + hint)); } }, "💡 Подсказка из песен Пахмутовой") : null,
          turnBox));
        drawTurn();
      };
      nextRound();
    },
  });
})();
