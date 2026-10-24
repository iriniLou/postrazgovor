/* 2–4 курсы СПО · Я с командой · «Блеф-клуб» — придумай правдоподобную ложь и найди правду */
"use strict";
(() => {
  // [текст с пропуском ___, правда, пояснение]
  const FACTS = [
    ["За первый год учёбы в Славяно-греко-латинской академии Ломоносов прошёл сразу ___.", "три класса", "Его быстро перевели в число лучших учеников."],
    ["На жизнь студенту Ломоносову в день выдавали ___.", "алтын (три копейки)", "Хватало на хлеб, квас и немного бумаги."],
    ["В 1754 году Ломоносов показал Академии модель ___ машины — с двумя винтами для подъёма приборов.", "аэродинамической", "Её считают одним из первых прообразов вертолёта."],
    ["Свою зрительную трубу для наблюдений в сумерках Ломоносов назвал «___ труба».", "ночезрительная", "Она собирала больше света и помогала видеть в полутьме."],
    ["Опытов с цветным стеклом Ломоносов провёл больше ___.", "четырёх тысяч", "Каждый опыт он записывал в лабораторный журнал."],
    ["Мозаика «Полтавская баталия» из мастерской Ломоносова занимает около ___.", "30 квадратных метров", "Её размер — примерно 4,8 на 6,4 метра."],
    ["Путь с рыбным обозом от Холмогор до Москвы занял у Ломоносова около ___.", "трёх недель", "Он вышел в декабре 1730 года и пришёл в январе 1731-го."],
    ["Ломоносов доказывал, что янтарь — это окаменевшая ___ древних деревьев.", "смола", "Он обращал внимание на насекомых и травинки внутри янтаря."],
    ["В честь Ломоносова назван подводный ___ в Северном Ледовитом океане.", "хребет", "Хребет Ломоносова открыли в 1948 году."],
    ["Город Ораниенбаум под Петербургом с 1948 года называется ___.", "Ломоносов", "Неподалёку, в Усть-Рудице, была фабрика цветного стекла Ломоносова."],
    ["За резкие слова в адрес коллег Ломоносов в 1743 году провёл под арестом около ___.", "восьми месяцев", "Под арестом он продолжал работать и писать стихи."],
    ["По Ломоносову, чернозём образовался из ___.", "перегнивших растений", "Он писал об этом в труде «О слоях земных»."],
    ["«Грамматику» и «Арифметику» Ломоносов называл «вратами своей ___».", "учёности", "С этих двух книг начался его путь к знаниям."],
    ["Фабрика Ломоносова в Усть-Рудице выпускала смальту, бисер и ___.", "стеклярус", "Стеклярус — короткие стеклянные трубочки для вышивки."],
    ["Ломоносов первым из русских учёных стал ___ химии Петербургской академии наук.", "профессором", "Это случилось в 1745 году."],
    ["Учёный Георг Рихман, коллега Ломоносова, погиб, изучая ___.", "атмосферное электричество", "Это был удар молнии во время опыта в 1753 году."],
  ];

  Games.register({
    id: "bluff", group: "spo24", mode: "friends", emoji: "🎭", title: "Блеф-клуб",
    short: "В фактах о Ломоносове пропущено слово. Каждый придумывает правдоподобную ложь, а потом все ищут правду среди обманок.",
    players: "3–8 игроков", time: "20–30 минут",
    rules: [
      "На экране — удивительный факт о Ломоносове с пропуском.",
      "Устройство передаётся по кругу: каждый тайно вписывает выдуманный ответ, похожий на правду.",
      "Потом все варианты, вместе с правдой, перемешиваются. Каждый тайно голосует за тот, который считает правдой.",
      "Нашёл правду — +2 очка. За каждого, кто поверил твоей выдумке, — +1 очко.",
    ],
    async start(stage, ctx) {
      const players = await setupPlayers(stage, { min: 3, max: 8, def: 4, label: "Кто играет?", noun: "Игрок" });
      const ROUNDS = Math.min(6, FACTS.length);
      const deck = U.sample(FACTS, ROUNDS);
      for (let r = 0; r < ROUNDS; r++) {
        const [text, truth, note] = deck[r];
        const lies = [];
        // 1. Сочиняем
        for (const p of players) {
          await passScreen(stage, p, `Раунд ${r + 1} из ${ROUNDS}. Сочиняем ответ`, "Показать факт");
          const lie = await new Promise(res => {
            const inp = h("input", { maxlength: 40, placeholder: "Твой выдуманный ответ", style: { width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid var(--line)", fontSize: "18px" } });
            const err = h("p", { class: "small", style: { color: "var(--bad)", minHeight: "20px" } });
            const go = () => {
              const v = inp.value.trim(), nv = U.norm(v);
              if (!nv) return err.textContent = "Впиши что-нибудь!";
              if (nv === U.norm(truth) || U.norm(truth).includes(nv) && nv.length > 3) return err.textContent = "Ого, это правда! Придумай другой, ложный ответ 😉";
              if (lies.some(l => U.norm(l.text) === nv)) return err.textContent = "Такой вариант уже есть. Придумай другой!";
              Sfx.click(); res(v);
            };
            inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
            U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "640px", margin: "0 auto" } },
              h("p", { class: "pill" }, `${p.avatar} ${p.name}`), h("h2", null, text.replace("___", "______")),
              h("p", { class: "muted" }, "Придумай ответ, в который поверят другие. Правду писать нельзя!"), inp, err,
              h("button", { class: "btn big", onclick: go }, "Готово")));
            inp.focus();
          });
          lies.push({ text: lie, by: p, votes: [] });
        }
        // 2. Голосуем
        const options = U.shuffle([...lies, { text: truth, truth: true, votes: [] }]);
        for (const p of players) {
          await passScreen(stage, p, "Голосование: где правда?", "Голосовать");
          await new Promise(res => {
            U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "640px", margin: "0 auto" } },
              h("p", { class: "pill" }, `${p.avatar} ${p.name}`), h("h2", null, text.replace("___", "______")),
              h("p", { class: "muted" }, `Все ответы: ${options.length}. Свой выбрать нельзя — найди среди остальных правду.`),
              h("div", { class: "options" }, options.map(o => o.by === p
                ? h("button", { class: "opt", disabled: true, style: { opacity: .5 } }, o.text, h("div", { class: "small muted" }, "это твой ответ"))
                : h("button", { class: "opt", onclick: () => { o.votes.push(p); Sfx.click(); res(); } }, o.text)))));
          });
        }
        // 3. Разоблачение
        const tr = options.find(o => o.truth);
        tr.votes.forEach(v => v.score += 2);
        lies.forEach(l => l.by.score += l.votes.length);
        await new Promise(res => {
          U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "700px", margin: "0 auto" } },
            h("h2", { class: "center" }, "Разоблачение!"),
            h("div", { class: "stack" }, options.sort((a, b) => (a.truth ? 1 : 0) - (b.truth ? 1 : 0)).map(o => h("div", { class: "opt " + (o.truth ? "right" : ""), style: { cursor: "default" } },
              h("b", null, o.text), " — ", o.truth ? h("span", null, "ПРАВДА ✓") : h("span", { class: "muted" }, `выдумал(а) ${o.by.name}`),
              h("div", { class: "small muted" }, o.votes.length ? "Поверили: " + o.votes.map(v => v.name).join(", ") : "Никто не выбрал")))),
            h("div", { class: "fact" }, h("b", null, text.replace("___", truth) + " "), note),
            scoreBar(players),
            h("div", { class: "row c" }, h("button", { class: "btn big", onclick: res }, r + 1 < ROUNDS ? "Следующий раунд ▶" : "Итоги ▶"))));
          Sfx.ok();
        });
      }
      finale(stage, { players, text: "Отличить факт от правдоподобной выдумки — тоже профессиональный навык. Ломоносов проверял каждую догадку опытом и наблюдением.", hashtag: ctx.hashtag, onAgain: ctx.restart });
    },
  });
})();
