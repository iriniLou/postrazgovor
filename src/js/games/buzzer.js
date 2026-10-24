/* 8–9 классы · Я с командой · «Кто первый?» — буззер-квиз на одном устройстве */
"use strict";
(() => {
  const QS = [
    ["Сколько лет длился творческий и семейный союз Пахмутовой и Добронравова?", ["67", "25", "40", "50"], 0],
    ["Сколько песен создала Александра Пахмутова?", ["Больше 400", "Около 50", "Ровно 100", "Больше 5000"], 0],
    ["Кем был Николай Добронравов?", ["Поэтом", "Дирижёром", "Пианистом", "Певцом"], 0],
    ["Где родилась Александра Пахмутова?", ["В Бекетовке под Сталинградом", "В Москве", "В Иркутске", "В Ленинграде"], 0],
    ["Песню о каком событии пел весь стадион в Лужниках в 1980 году?", ["Закрытие Олимпиады", "Полёт Гагарина", "Победа в хоккее", "Открытие метро"], 0],
    ["На чём улетел в небо Олимпийский Мишка?", ["На воздушных шарах", "На вертолёте", "На ракете", "На дельтаплане"], 0],
    ["Кому посвящена песня «Нежность»?", ["Лётчикам и космонавтам", "Хоккеистам", "Строителям ГЭС", "Учителям"], 0],
    ["В каком фильме «Нежность» зазвучала как песня о любви?", ["«Три тополя на Плющихе»", "«Ирония судьбы»", "«Девчата»", "«Москва слезам не верит»"], 0],
    ["Какой великий хоккейный вратарь говорил, что песня «Трус не играет в хоккей» «вела в бой»?", ["Владислав Третьяк", "Валерий Харламов", "Лев Яшин", "Александр Овечкин"], 0],
    ["Куда в 1963 году поехали Пахмутова и Добронравов за песнями?", ["В Сибирь, на великие стройки", "В Париж", "На Чёрное море", "В Антарктиду"], 0],
    ["Как назывался цикл песен о Сибири и её строителях?", ["«Таёжные звёзды»", "«Сибирские морозы»", "«Огни Ангары»", "«Песни тайги»"], 0],
    ["Как называется цикл песен о Юрии Гагарине?", ["«Созвездие Гагарина»", "«Звёздный путь»", "«Поехали!»", "«Орбита»"], 0],
    ["Какая награда вручена Пахмутовой в 2019 году?", ["Орден Святого апостола Андрея Первозванного", "Оскар", "Нобелевская премия", "Золотой мяч"], 0],
    ["Что назвали в честь Александры Пахмутовой?", ["Малую планету — астероид", "Остров в океане", "Сорт яблок", "Ледокол"], 0],
    ["Чья была «формула счастья»: талант, трудолюбие и любимая работа?", ["Пахмутовой и Добронравова", "Ломоносова", "Гагарина", "Чайковского"], 0],
    ["Какой ансамбль сделал «Беловежскую пущу» всенародным хитом?", ["«Песняры»", "«Самоцветы»", "«Земляне»", "«Цветы»"], 0],
    ["Чьё исполнение песни «Надежда» стало самым знаменитым?", ["Анны Герман", "Аллы Пугачёвой", "Майи Кристалинской", "Людмилы Зыкиной"], 0],
    ["Что значит, что у песни есть «второй смысл», как у «Нежности»?", ["Слушатели услышали в ней новое в новых обстоятельствах", "Её переписали", "Её запретили", "Её спели наоборот"], 0],
    ["Почему для закрытия Олимпиады-80 выбрали лирическую, а не бодрую песню?", ["Это было прощание — светлая грусть", "Не успели написать марш", "Так велели спортсмены", "Случайно"], 0],
    ["Где в 2014 году снова прозвучала мелодия «До свиданья, Москва»?", ["На закрытии Олимпиады в Сочи", "На концерте в Нью-Йорке", "В космосе", "На хоккейном матче в Канаде"], 0],
  ];
  const AUDIO = ["hockey", "moskva", "nezhnost", "molody", "belovezh", "ptica", "gagarin", "inache"];
  const KEYS = [["KeyQ", "Q"], ["KeyP", "P"], ["KeyZ", "Z"], ["KeyM", "M"]];

  Games.register({
    id: "buzzer", group: "8-9", mode: "friends", emoji: "🚨", title: "Кто первый?",
    short: "Буззер-квиз на одном компьютере или планшете: у каждого своя кнопка. Знаешь ответ — жми первым! Есть музыкальные вопросы.",
    players: "2–4 игрока", time: "15 минут", needs: "🔊 звук",
    rules: [
      "У каждого игрока своя клавиша (Q, P, Z, M) или своя большая кнопка на экране.",
      "Появляется вопрос. Когда загорится «Жми!», нажми свою кнопку первым.",
      "Нажал раньше времени — кнопка блокируется на секунду. Первый нажавший выбирает ответ (мышкой или клавишами 1–4).",
      "Верно: +1. Неверно: −1, и отвечать могут остальные. 15 вопросов, среди них — угадай песню по фрагменту.",
    ],
    async start(stage, ctx) {
      const players = await setupPlayers(stage, { min: 2, max: 4, def: 2, label: "Кто играет?", noun: "Игрок", note: "Сядьте так, чтобы каждый дотянулся до своей кнопки." });
      players.forEach((p, i) => p.key = KEYS[i]);
      const list = U.shuffle([...U.sample(QS, 11).map(q => ({ q })), ...U.sample(AUDIO, 4).map(a => ({ a }))]);
      let qi = 0, keyH = null;
      const kd = e => keyH && keyH(e);
      addEventListener("keydown", kd); ctx.onCleanup(() => { removeEventListener("keydown", kd); Music.stop(); });

      const ask = () => {
        if (qi >= list.length) { keyH = null; return finale(stage, { players, text: "Какой вопрос оказался самым неожиданным? Включите вместе любую песню из викторины целиком.", hashtag: ctx.hashtag, onAgain: ctx.restart }); }
        const item = list[qi++];
        let text, opts, right;
        if (item.q) { [text, opts, right] = item.q; const o = U.shuffle(opts.map((_, i) => i)); opts = o.map(i => item.q[1][i]); right = o.indexOf(item.q[2]); }
        else {
          const s = Music.get(item.a), wrong = U.sample(SONGS.filter(x => x.id !== s.id), 3);
          const all = U.shuffle([s, ...wrong]); text = "🎵 Что это за песня?"; opts = all.map(x => "«" + x.title + "»"); right = all.indexOf(s);
        }
        let state = "wait", who = -1;
        const locked = new Set(), early = new Set();
        const status = h("div", { class: "title-xl center", style: { minHeight: "56px" } }, "Приготовились…");
        const optsBox = h("div", { class: "options" }, opts.map((o, k) => h("button", { class: "opt", onclick: () => answer(k) }, h("span", { class: "k" }, k + 1), o)));
        const pads = h("div", { style: { display: "grid", gridTemplateColumns: `repeat(${players.length}, 1fr)`, gap: "10px", marginTop: "16px" } }, players.map((p, i) =>
          h("button", { style: { minHeight: "110px", borderRadius: "18px", border: 0, background: p.color, color: "#fff", fontSize: "20px", fontWeight: 800, cursor: "pointer", touchAction: "manipulation" }, onpointerdown: e => { e.preventDefault(); buzz(i); } },
            h("div", { class: "em", style: { fontSize: "30px" } }, p.avatar), p.name, h("div", { class: "small" }, "клавиша " + p.key[1]))));
        const paintPads = () => [...pads.children].forEach((b, i) => { b.style.opacity = locked.has(i) || early.has(i) ? .3 : who === i ? 1 : state === "go" ? 1 : .75; b.style.outline = who === i ? "5px solid var(--ink)" : "none"; });
        const buzz = i => {
          if (locked.has(i) || early.has(i)) return;
          if (state === "wait") { early.add(i); Sfx.bad(); paintPads(); setTimeout(() => { early.delete(i); paintPads(); }, 1000); return; }
          if (state !== "go") return;
          state = "answer"; who = i; Sfx.buzz(); Music.stop();
          status.textContent = `${players[i].avatar} ${players[i].name}, отвечай!`; status.style.color = players[i].color;
          paintPads();
        };
        const answer = k => {
          if (state !== "answer") return;
          const p = players[who];
          if (k === right) {
            p.score++; Sfx.ok(); optsBox.children[k].classList.add("right"); state = "done";
            status.textContent = `Верно! +1 ${p.name}`; finishQ();
          } else {
            p.score--; Sfx.bad(); optsBox.children[k].classList.add("wrong"); locked.add(who); who = -1;
            if (locked.size >= players.length) { state = "done"; optsBox.children[right].classList.add("right"); status.textContent = "Никто не угадал"; finishQ(); }
            else { state = "go"; status.textContent = "Неверно! Кто ещё знает? Жми!"; status.style.color = "var(--accent)"; }
          }
          bar.replaceWith(bar = scoreBar(players)); paintPads();
        };
        const finishQ = () => {
          keyH = null;
          stage.append(h("div", { class: "row c", style: { marginTop: "14px" } }, h("button", { class: "btn big", onclick: () => { Music.stop(); ask(); } }, qi >= list.length ? "Итоги ▶" : "Следующий вопрос ▶")));
          if (item.a) { const s = Music.get(item.a); stage.append(h("p", { class: "center small muted" }, s.note)); }
        };
        keyH = e => {
          const pi = players.findIndex(p => p.key[0] === e.code);
          if (pi >= 0) { e.preventDefault(); if (!e.repeat) buzz(pi); }
          const n = +e.key; if (n >= 1 && n <= opts.length) answer(n - 1);
        };
        let bar = scoreBar(players);
        U.clear(stage).append(bar, h("div", { class: "stack", style: { maxWidth: "760px", margin: "0 auto" } },
          h("span", { class: "pill" }, `Вопрос ${qi} из ${list.length}`), h("h2", null, text), optsBox, status, pads));
        paintPads();
        if (item.a) Music.play(item.a, { from: 0, dur: 14 });
        setTimeout(() => { if (state === "wait") { state = "go"; status.textContent = "Жми!"; status.style.color = "var(--ok)"; Sfx.tone(1000, .12, "square", .1); paintPads(); } }, item.a ? 1200 : 1800 + Math.random() * 1200);
      };
      ask();
    },
  });
})();
