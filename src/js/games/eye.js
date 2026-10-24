/* 3–4 классы · Я с друзьями · «Зоркий глаз» — найди, что изменилось */
"use strict";
(() => {
  const THEMES = [
    { name: "Обсерватория", em: ["🔭", "⭐", "🌙", "🪐", "☄️", "🌟", "🌍", "☀️", "🌠", "🧭", "📐", "🕯️"],
      fact: "Ломоносов не только заметил светлый ободок вокруг Венеры, но и понял, что он означает: у планеты есть атмосфера." },
    { name: "Лаборатория", em: ["🧪", "⚗️", "🔥", "🕯️", "📜", "🪶", "📚", "⚖️", "🔬", "🧲", "💎", "🫙"],
      fact: "В лаборатории Ломоносов записывал каждый опыт: что взял, сколько нагревал, что получилось. Внимательность — главный инструмент учёного." },
    { name: "Деревня у моря", em: ["🏠", "🌲", "⛵", "🐟", "🐻", "❄️", "🦭", "🐦", "⚓", "🛶", "🌊", "🐴"],
      fact: "Миша с детства наблюдал за морем, погодой и северным сиянием. Так начиналась его любознательность." },
  ];
  const KIND = { remove: "Пропал предмет", add: "Появился новый предмет", replace: "Предмет превратился в другой", swap: "Два предмета поменялись местами", move: "Предмет переехал" };

  Games.register({
    id: "eye", group: "3-4", mode: "friends", emoji: "👁️", title: "Зоркий глаз",
    short: "Игра на внимательность для компании: запомни картинку, закрой глаза — и найди, что изменилось. Как Ломоносов у телескопа!",
    players: "1–6 игроков", time: "10–15 минут",
    rules: [
      "Все смотрят на экран и запоминают, где какие предметы.",
      "Звучит сигнал — закройте глаза! За это время в картинке что-то меняется.",
      "Кто первым заметил, что изменилось, нажимает на это место. Если угадал — получает очко.",
      "10 раундов. С каждым раундом предметов больше, а времени меньше.",
    ],
    async start(stage, ctx) {
      const players = await setupPlayers(stage, { min: 1, max: 6, def: 3, label: "Кто играет?", noun: "Игрок", note: "Можно и одному — тогда просто считай свои очки." });
      const ROUNDS = 10;
      let round = 0;

      const play = async () => {
        round++;
        const th = U.pick(THEMES);
        const cols = round <= 3 ? 4 : round <= 7 ? 5 : 6, rows = round <= 3 ? 3 : 4;
        const total = cols * rows, nObj = Math.round(total * (round <= 3 ? .55 : .65));
        const look = Math.max(5, 12 - round);
        const slots = U.shuffle([...Array(total).keys()]);
        const scene = Array(total).fill(null);
        slots.slice(0, nObj).forEach(i => scene[i] = U.pick(th.em));
        const after = scene.slice();
        const filled = scene.map((v, i) => v ? i : -1).filter(i => i >= 0), empty = scene.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        let kinds = ["remove", "add", "replace", "move"]; if (round > 4) kinds.push("swap", "swap");
        const kind = U.pick(kinds);
        let changed = [];
        if (kind === "remove") { const i = U.pick(filled); after[i] = null; changed = [i]; }
        if (kind === "add") { const i = U.pick(empty); after[i] = U.pick(th.em); changed = [i]; }
        if (kind === "replace") { const i = U.pick(filled); after[i] = U.pick(th.em.filter(e => e !== scene[i])); changed = [i]; }
        if (kind === "move") { const i = U.pick(filled), j = U.pick(empty); after[j] = after[i]; after[i] = null; changed = [i, j]; }
        if (kind === "swap") {
          const i = U.pick(filled), cand = filled.filter(j => scene[j] !== scene[i]);
          const j = cand.length ? U.pick(cand) : U.pick(filled.filter(x => x !== i));
          [after[i], after[j]] = [after[j], after[i]]; changed = [i, j];
        }

        const ts = U.clamp(Math.floor((stage.clientWidth - 60) / cols), 54, 110);
        const grid = arr => h("div", { style: { display: "grid", gridTemplateColumns: `repeat(${cols}, ${ts}px)`, gap: "8px", justifyContent: "center", background: "var(--soft)", padding: "12px", borderRadius: "18px", width: "fit-content", margin: "0 auto" } },
          arr.map((e, i) => h("button", { "data-i": i, class: "em", style: { width: ts + "px", height: ts + "px", fontSize: Math.round(ts * .58) + "px", border: 0, borderRadius: "14px", background: "#fff", cursor: "pointer", padding: 0 } }, e || "")));

        // 1. Запоминаем
        const timer = new Timer(look);
        U.clear(stage).append(scoreBar(players), h("div", { class: "center stack" },
          h("div", { class: "row c" }, h("span", { class: "pill" }, `Раунд ${round} из ${ROUNDS} · ${th.name}`)),
          h("h2", null, "Запоминай!"), timer.el, grid(scene)));
        await new Promise(res => { timer.onEnd = res; timer.start(); ctx.onCleanup(() => timer.stop()); });

        // 2. Закрыли глаза
        U.clear(stage).append(h("div", { class: "center stack", style: { padding: "60px 0" } }, h("div", { class: "big-emoji" }, "🙈"), h("h2", null, "Закройте глаза!")));
        await U.wait(1600);
        Sfx.tone(880, .15, "triangle", .15);

        // 3. Ищем
        const g2 = grid(after);
        const msg = h("p", { class: "center muted" }, "Что изменилось? Кто первым заметил — нажми на это место.");
        U.clear(stage).append(scoreBar(players), h("div", { class: "center stack" }, h("h2", null, "Открывайте! Что изменилось?"), msg, g2,
          h("button", { class: "btn ghost small", onclick: () => reveal(false) }, "Сдаёмся — показать")));
        let done = false;
        g2.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b || done) return;
          const i = +b.dataset.i;
          if (changed.includes(i)) reveal(true);
          else { Sfx.bad(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); b.style.background = "#fbe5e2"; }
        });

        const reveal = async ok => {
          if (done) return; done = true;
          changed.forEach(i => { const b = g2.children[i]; b.style.boxShadow = "0 0 0 4px var(--ok)"; b.style.background = "#e3f4ea"; });
          const was = changed.map(i => scene[i] || "пусто");
          msg.innerHTML = `<b>${KIND[kind]}.</b> ` + (kind === "add" ? `Раньше здесь было пусто.` : kind === "swap" ? `Было: ${scene[changed[0]]} и ${scene[changed[1]]}.` : `Раньше здесь было: ${was[0]}.`);
          if (ok) Sfx.ok();
          await U.wait(900);
          let winner = null;
          if (ok && players.length > 1) {
            winner = await modal(h("div", { class: "center stack" }, h("h2", null, "Кто нашёл первым?"),
              h("p", { class: "muted" }, th.fact)), { buttons: [...players.map((p, k) => ({ text: p.avatar + " " + p.name, value: k })), { text: "Никто", value: -1, cls: "ghost" }] });
          } else if (ok) { winner = 0; await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji" }, "👁️"), h("h2", null, "Зоркий глаз!"), h("p", null, th.fact)), { buttons: [{ text: "Дальше" }] }); }
          else await modal(h("div", { class: "center" }, h("p", null, th.fact)), { buttons: [{ text: "Дальше" }] });
          if (winner != null && winner >= 0) players[winner].score++;
          if (round >= ROUNDS) return finale(stage, {
            players: players.length > 1 ? players : null,
            title: players.length === 1 ? `Твой результат: ${players[0].score} из ${ROUNDS}` : null,
            stars: players.length === 1 ? (players[0].score >= 8 ? 3 : players[0].score >= 5 ? 2 : 1) : null,
            text: "Заметить, задать вопрос «почему?», найти объяснение — так начинается любое открытие.",
            hashtag: ctx.hashtag, onAgain: ctx.restart,
          });
          play();
        };
      };
      play();
    },
  });
})();
