/* 6–7 классы · Я с семьёй · «Эмодзи-ребусы» — дети против взрослых */
"use strict";
(() => {
  // [эмодзи, название песни, подсказка, id фрагмента или null]
  const CARDS = [
    ["🐦✨🍀", "Птица счастья", "Светлая песня о мечте и счастье, 1980-е годы", "ptica"],
    ["👋🏙️🧸🎈", "До свиданья, Москва", "Прозвучала на закрытии Олимпиады-80", "moskva"],
    ["😨🚫🏒", "Трус не играет в хоккей", "1968 год, гимн советского хоккея", "hockey"],
    ["✈️🧑‍🚀💗", "Нежность", "1965 год; позже прозвучала в фильме «Три тополя на Плющихе»", "nezhnost"],
    ["🧑➡️👴⏳", "Как молоды мы были", "Поёт Иосиф Кобзон", "molody"],
    ["🦬🌲🌲", "Беловежская пуща", "Заповедный лес, где живут зубры", "belovezh"],
    ["⭐⭐⭐🚀", "Созвездие Гагарина", "Из цикла песен о первом космонавте", "gagarin"],
    ["🙅‍♀️🔀❌", "Я не могу иначе", "Поёт Валентина Толкунова", "inache"],
    ["⚓💫", "Надежда", "Её знаменитой сделала Анна Герман", null],
    ["🎼🎶", "Мелодия", "Поёт Муслим Магомаев", null],
    ["🍁👴", "Старый клён", "Из фильма «Девчата» (1961)", null],
    ["👥🏆🧒", "Команда молодости нашей", "Поёт Лев Лещенко", null],
    ["❤️🚫👴", "Главное, ребята, сердцем не стареть", "Песня о молодости души", null],
    ["⛏️🪨🧭", "Геологи", "О людях, которые ищут под землёй полезные ископаемые", null],
    ["🤗☁️", "Обнимая небо", "Так называется цикл песен о лётчиках, в него входит «Нежность»", null],
    ["⚔️🔁", "И вновь продолжается бой", "1974 год", null],
    ["👍👧👧", "Хорошие девчата", "Ещё одна песня из фильма «Девчата»", null],
  ];

  Games.register({
    id: "emoji", group: "6-7", mode: "family", emoji: "🧩", title: "Эмодзи-ребусы",
    short: "Дети против взрослых: угадайте песни Пахмутовой и Добронравова, зашифрованные смайликами. А потом — послушайте и подпойте!",
    players: "2 команды: молодёжь и старшие", time: "15–20 минут",
    rules: [
      "Делитесь на две команды: «Молодёжь» и «Старшие». Команды угадывают по очереди.",
      "На экране — ребус из эмодзи. Это название песни. На размышление 40 секунд.",
      "Угадали — 2 очка. Подсказка стоит 1 очко: оно снимается сразу, как только вы её открыли, даже если потом не угадаете.",
      "Бонус +1: напойте мелодию угаданной песни (без слов тоже можно — «ля-ля-ля»).",
      "После ответа включите фрагмент, если он есть, и расскажите друг другу, что вы знаете об этой песне.",
    ],
    async start(stage, ctx) {
      const teams = await setupPlayers(stage, { min: 2, max: 2, def: 2, label: "Команды", noun: "Команда", defaults: ["Молодёжь", "Старшие"], note: "Взрослые наверняка знают эти песни, зато дети лучше разгадывают эмодзи!" });
      const deck = U.shuffle(CARDS).slice(0, 12);
      let n = 0, turn = 0;
      const next = () => {
        if (n >= deck.length) return finale(stage, { players: teams, text: "Какую песню вы послушаете целиком? Попросите старших рассказать, где они слышали её впервые.", hashtag: ctx.hashtag, onAgain: ctx.restart });
        const [em, title, hint, sid] = deck[n++];
        const t = teams[turn];
        let usedHint = false;
        const hintBox = h("div", { class: "center" });
        const timer = new Timer(40, { onEnd: () => reveal() });
        ctx.onCleanup(() => timer.stop());
        const reveal = () => {
          timer.stop();
          const pts = 2;
          U.clear(stage).append(scoreBar(teams, turn), h("div", { class: "center stack" },
            h("div", { class: "big-emoji", style: { fontSize: "64px" } }, em),
            h("div", { class: "title-xl" }, "«" + title + "»"), h("p", { class: "muted" }, hint),
            sid ? h("div", { class: "row c" }, Music.button(sid, "▶ Послушать фрагмент")) : null,
            h("p", null, `Команда «${t.name}» угадала?`),
            h("div", { class: "row c" },
              h("button", { class: "btn ok big", onclick: () => score(pts) }, `✓ Да, +${pts}`),
              h("button", { class: "btn bad big", onclick: () => score(0) }, "✗ Нет"))));
        };
        const score = async pts => {
          Music.stop();
          t.score += pts; pts ? Sfx.ok() : Sfx.bad();
          if (pts) {
            const sang = await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji" }, "🎤"), h("h2", null, "Бонус!"), h("p", null, `Команда «${t.name}», напойте мелодию этой песни. Получилось?`)),
              { buttons: [{ text: "Напели! +1", value: true, cls: "ok" }, { text: "Пропустить", value: false, cls: "ghost" }] });
            if (sang) t.score++;
          }
          turn = 1 - turn; next();
        };
        let bar = scoreBar(teams, turn);
        U.clear(stage).append(bar, h("div", { class: "center stack" },
          h("span", { class: "pill" }, `Ребус ${n} из ${deck.length}`), h("h3", { style: { color: t.color } }, `Отгадывает команда ${t.avatar} «${t.name}»`),
          timer.el, h("div", { class: "big-emoji bounce", style: { fontSize: "clamp(64px, 16vw, 120px)", letterSpacing: "6px" } }, em), hintBox,
          h("div", { class: "row c" },
            h("button", { class: "btn ghost", onclick: e => { usedHint = true; e.target.disabled = true; t.score -= 1; Sfx.bad(); const nb = scoreBar(teams, turn); bar.replaceWith(nb); bar = nb; U.clear(hintBox).append(h("p", { class: "panel" }, "Подсказка: " + hint)); } }, "💡 Подсказка (−1 очко)"),
            h("button", { class: "btn", onclick: reveal }, "Показать ответ"))));
        timer.start();
      };
      next();
    },
  });
})();
