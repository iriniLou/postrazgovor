/* 1–2 классы · Я с семьёй · «Мемори учёного» — найди пары и узнай факт */
"use strict";
(() => {
  const PAIRS = [
    ["🔭", "Телескоп", "В телескоп Ломоносов разглядел, что у планеты Венеры есть воздух — атмосфера."],
    ["📚", "Книги", "Миша очень любил читать. Книги в его деревне были редкостью, и он искал их сам."],
    ["🧪", "Колба", "Ломоносов ставил опыты в своей лаборатории — первой научной химической лаборатории в России."],
    ["🧩", "Мозаика", "Из маленьких кусочков цветного стекла Ломоносов собирал большие картины — мозаики."],
    ["🪶", "Перо", "Гусиным пером Ломоносов писал стихи и научные книги."],
    ["⛵", "Парусник", "В детстве Миша ходил с отцом в море на парусном судне."],
    ["🐟", "Рыба", "Отец Миши ловил рыбу. В Москву Миша ушёл вместе с рыбным обозом."],
    ["🏛️", "Университет", "Ломоносов помог открыть Московский университет. Это было в 1755 году."],
    ["❄️", "Снежинка", "Миша вырос на Севере, где зима длинная и снежная."],
    ["🌌", "Северное сияние", "Ломоносов любовался северным сиянием, изучал его и писал о нём стихи."],
    ["🔤", "Буквы", "Ломоносов написал «Российскую грамматику» — книгу о правилах русского языка."],
    ["🧮", "Счёты", "По «Арифметике» Магницкого Миша научился считать."],
    ["🛷", "Сани", "Зимой Миша отправился в Москву на санях с обозом."],
    ["🪐", "Планета", "Ломоносов наблюдал за планетами и звёздами."],
  ];

  Games.register({
    id: "memory", group: "1-2", mode: "family", emoji: "🃏", title: "Мемори учёного",
    short: "Найдите пары картинок по очереди. За каждую пару — рассказ о Ломоносове, который можно прочитать вслух.",
    players: "1–4 игрока", time: "15 минут",
    rules: [
      "Игроки ходят по очереди: открывают две карточки.",
      "Если картинки одинаковые — пара твоя, прочитайте вместе рассказ и ходи ещё раз.",
      "Если разные — карточки закрываются, ходит следующий игрок.",
      "Когда все пары найдены, побеждает тот, у кого их больше.",
    ],
    async start(stage, ctx) {
      const players = await setupPlayers(stage, { min: 1, max: 4, def: 2, label: "Кто играет?", noun: "Игрок", note: "Можно играть и вдвоём со взрослым, и всей семьёй." });
      let size = 8;
      await new Promise(res => {
        U.clear(stage).append(h("div", { class: "center stack" }, h("h2", null, "Сколько пар?"),
          h("div", { class: "row c" }, [[6, "Лёгкая · 6 пар"], [8, "Средняя · 8 пар"], [12, "Сложная · 12 пар"]].map(([n, t]) =>
            h("button", { class: "btn big" + (n === 8 ? "" : " ghost"), onclick: () => { size = n; res(); } }, t)))));
      });
      const deck = U.shuffle(U.sample(PAIRS, size).flatMap((p, i) => [{ p, i }, { p, i }]));
      let turn = 0, open = [], lock = false, found = 0;
      const cols = size <= 6 ? 4 : size <= 8 ? 4 : 6;

      const grid = h("div", { style: { display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: "10px", maxWidth: cols * 120 + "px", margin: "0 auto" } });
      const bar = h("div");
      const turnLbl = h("p", { class: "center", style: { fontWeight: 700, fontSize: "20px" } });
      const cards = deck.map((c, k) => {
        const el = h("button", {
          class: "em", "aria-label": "карточка",
          style: { aspectRatio: "1", borderRadius: "16px", border: "0", cursor: "pointer", fontSize: "clamp(30px, 7vw, 52px)", background: "var(--accent)", color: "#fff", boxShadow: "0 3px 0 rgba(0,0,0,.18)", transition: "transform .2s" },
          onclick: () => flip(k),
        }, "?");
        return { ...c, el, open: false, done: false };
      });
      cards.forEach(c => grid.append(c.el));
      const show = c => { c.el.textContent = c.p[0]; c.el.style.background = "#fff"; c.el.style.color = "inherit"; c.el.style.border = "3px solid var(--accent)"; };
      const hide = c => { c.el.textContent = "?"; c.el.style.background = "var(--accent)"; c.el.style.color = "#fff"; c.el.style.border = "0"; };
      const drawBar = () => {
        U.clear(bar).append(scoreBar(players, turn));
        const p = players[turn]; turnLbl.textContent = `Ходит: ${p.avatar} ${p.name}`; turnLbl.style.color = p.color;
      };
      U.clear(stage).append(bar, turnLbl, grid);
      drawBar();

      async function flip(k) {
        const c = cards[k];
        if (lock || c.open || c.done) return;
        Sfx.click(); c.open = true; show(c); open.push(c);
        if (open.length < 2) return;
        lock = true;
        const [a, b] = open; open = [];
        if (a.i === b.i) {
          a.done = b.done = true; found++;
          const p = players[turn]; p.score++;
          a.el.style.borderColor = b.el.style.borderColor = p.color;
          Sfx.ok(); drawBar();
          Voice.say(a.p[1] + ". " + a.p[2]);
          await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji bounce" }, a.p[0]), h("h2", null, a.p[1]), h("p", { style: { fontSize: "20px" } }, a.p[2]),
            h("div", { class: "row c" }, Voice.button(a.p[1] + ". " + a.p[2]), h("span", { class: "pill" }, `${p.avatar} ${p.name}: +1 пара`))), { buttons: [{ text: "Дальше ▶" }] });
          Voice.stop();
          lock = false;
          if (found === size) {
            finale(stage, {
              players: players.length > 1 ? players : null, title: players.length === 1 ? "Все пары найдены!" : null,
              text: "Вспомните вместе: какой рассказ о Ломоносове вам понравился больше всего? А что из этого хочется попробовать самим — посмотреть на звёзды, собрать мозаику, написать стихотворение?",
              hashtag: ctx.hashtag, onAgain: ctx.restart,
            });
          }
        } else {
          await U.wait(900); hide(a); hide(b); a.open = b.open = false;
          turn = (turn + 1) % players.length; drawBar(); lock = false;
        }
      }
    },
  });
})();
