/* 1 курс СПО · Я с семьёй · «Семейный хит-парад» — олимпийская сетка из восьми песен */
"use strict";
(() => {
  const TALK = [
    "Кто голосовал иначе, чем большинство? Расскажите почему.",
    "С чем у вас связана песня-победитель этого матча? Где вы её слышали впервые?",
    "Какая из двух песен лучше подошла бы для семейной поездки? А для грустного вечера?",
    "Старшие: какую песню из этих пели у вас дома или в школе?",
    "Что важнее в песне для вас — мелодия, слова или голос исполнителя?",
    "Если бы эта песня была про человека из вашей семьи — про кого?",
    "Какая песня вам кажется самой «трудовой», про работу и дело?",
  ];

  Games.register({
    id: "bracket", group: "spo1", mode: "family", emoji: "🏆", title: "Семейный хит-парад",
    short: "Восемь песен Пахмутовой и Добронравова, олимпийская сетка, семья — жюри. Слушайте, голосуйте, спорьте — и выберите песню вашей семьи.",
    players: "2–8 человек", time: "25–30 минут", needs: "🔊 звук",
    rules: [
      "Восемь песен разбиты на пары. Послушайте фрагменты обеих песен в паре.",
      "Голосуйте поднятой рукой и отметьте число голосов. Ничья — решает самый старший.",
      "Между матчами отвечайте на вопрос-карточку: так хит-парад превращается в разговор.",
      "Четвертьфинал → полуфинал → финал. В конце — грамота с песней вашей семьи, её можно распечатать или сохранить.",
    ],
    start(stage, ctx) {
      ctx.onCleanup(() => Music.stop());
      let round = U.shuffle(SONGS.slice());
      const history = [];
      let talk = U.shuffle(TALK);
      const STAGE = { 8: "Четвертьфинал", 4: "Полуфинал", 2: "Финал" };
      const playRound = async () => {
        const winners = [];
        for (let m = 0; m < round.length; m += 2) winners.push(await match(round[m], round[m + 1], STAGE[round.length], m / 2 + 1, round.length / 2));
        round = winners;
        if (round.length > 1) playRound(); else champion(round[0]);
      };
      const match = (a, b, st, k, of) => new Promise(res => {
        const votes = [0, 0];
        const side = (s, i) => {
          const cnt = h("b", { style: { fontSize: "34px" } }, "0");
          return h("div", { class: "panel center stack", style: { flex: 1, minWidth: "240px" } },
            h("div", { class: "big-emoji", style: { fontSize: "54px" } }, s.emoji), h("h3", null, "«" + s.title + "»"), h("div", { class: "small muted" }, s.artist + (s.year ? ", " + s.year : "")),
            h("div", { class: "row c" }, Music.button(s.id, "▶ Слушать", { from: 0, dur: 25 })),
            h("div", { class: "row c" }, h("button", { class: "btn ghost small", onclick: () => { votes[i] = Math.max(0, votes[i] - 1); cnt.textContent = votes[i]; } }, "−"), cnt,
              h("button", { class: "btn small", onclick: () => { votes[i]++; cnt.textContent = votes[i]; Sfx.click(); } }, "＋ голос")));
        };
        const decide = async () => {
          Music.stop();
          let w = votes[0] > votes[1] ? 0 : votes[1] > votes[0] ? 1 : null;
          if (w == null) w = await modal(h("div", { class: "center" }, h("h2", null, "Ничья!"), h("p", null, "Решает самый старший член семьи:")), { buttons: [{ text: "«" + a.title + "»", value: 0 }, { text: "«" + b.title + "»", value: 1 }] });
          const win = [a, b][w];
          history.push([st, a, b, votes.slice(), win]);
          Sfx.ok();
          if (!talk.length) talk = U.shuffle(TALK);
          await modal(h("div", { class: "center stack" }, h("div", { class: "big-emoji bounce" }, win.emoji), h("h2", null, `Дальше проходит «${win.title}»`), h("p", { class: "muted" }, win.note),
            h("div", { class: "fact" }, h("b", null, "Поговорим: "), talk.pop())), { buttons: [{ text: "Следующий матч ▶" }] });
          res(win);
        };
        U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "820px", margin: "0 auto" } },
          h("div", { class: "center" }, h("span", { class: "pill" }, `${st} · матч ${k} из ${of}`)),
          h("div", { class: "row", style: { alignItems: "stretch", gap: "12px" } }, side(a, 0), h("div", { class: "title-xl", style: { alignSelf: "center" } }, "vs"), side(b, 1)),
          h("div", { class: "row c" }, h("button", { class: "btn big", onclick: decide }, "Подвести итог матча"))));
      });
      const champion = win => {
        const fam = h("input", { placeholder: "Например: семья Ивановых", maxlength: 40, style: { padding: "12px", borderRadius: "12px", border: "2px solid var(--line)", width: "100%", maxWidth: "360px", fontSize: "17px" } });
        const date = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
        const cert = h("div", { id: "cert", style: { maxWidth: "560px", margin: "0 auto", border: "6px double var(--accent)", borderRadius: "18px", padding: "26px", background: "#fffdf8", textAlign: "center", fontFamily: "var(--serif)" } },
          h("div", { class: "small", style: { letterSpacing: "3px", color: "var(--accent)" } }, "ГРАМОТА"), h("h2", null, "Песня нашей семьи"),
          h("div", { class: "big-emoji" }, win.emoji), h("div", { class: "title-xl" }, "«" + win.title + "»"),
          h("p", { class: "muted" }, "Музыка Александры Пахмутовой · " + win.artist),
          h("p", { class: "certname", style: { fontSize: "20px", minHeight: "28px" } }, ""), h("p", { class: "small muted" }, date + " · Семейный хит-парад"));
        fam.oninput = () => cert.querySelector(".certname").textContent = fam.value;
        const savePng = () => {
          const W = 1000, H = 700, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d");
          const acc = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#9e2240";
          c.fillStyle = "#fffdf8"; c.fillRect(0, 0, W, H); c.strokeStyle = acc; c.lineWidth = 10; c.strokeRect(30, 30, W - 60, H - 60); c.lineWidth = 3; c.strokeRect(48, 48, W - 96, H - 96);
          c.textAlign = "center"; c.fillStyle = acc; c.font = "28px Georgia"; c.fillText("Г Р А М О Т А", W / 2, 120);
          c.fillStyle = "#23201c"; c.font = "bold 44px Georgia"; c.fillText("Песня нашей семьи", W / 2, 190);
          c.font = "110px 'Segoe UI Emoji', sans-serif"; c.fillText(win.emoji, W / 2, 330);
          c.font = "bold 50px Georgia"; c.fillText("«" + win.title + "»", W / 2, 420);
          c.font = "24px Georgia"; c.fillStyle = "#6b645b"; c.fillText("Музыка Александры Пахмутовой · " + win.artist, W / 2, 470);
          c.fillStyle = "#23201c"; c.font = "30px Georgia"; c.fillText(fam.value || "", W / 2, 540);
          c.fillStyle = "#6b645b"; c.font = "22px Georgia"; c.fillText(date + " · Семейный хит-парад", W / 2, 610);
          const a = document.createElement("a"); a.download = "pesnya-nashej-semi.png"; a.href = cv.toDataURL("image/png"); a.click();
        };
        finale(stage, {
          title: "У вашей семьи есть своя песня!",
          extra: h("div", { class: "stack" }, h("div", { class: "row c" }, fam), cert,
            h("div", { class: "row c no-print" }, h("button", { class: "btn dark", onclick: savePng }, "💾 Сохранить картинкой"), h("button", { class: "btn ghost", onclick: () => print() }, "🖨 Распечатать"), Music.button(win.id, "▶ Послушать ещё раз")),
            h("details", { class: "no-print", style: { textAlign: "left", maxWidth: "560px", margin: "0 auto" } }, h("summary", null, "Вся сетка матчей"),
              h("ul", null, history.map(([st, a, b, v, w]) => h("li", null, `${st}: «${a.title}» ${v[0]} : ${v[1]} «${b.title}» → `, h("b", null, w.title)))))),
          facts: ["<b>Как песня становится общей, оставаясь личной?</b> Каждый в семье мог голосовать по своей причине — из-за мелодии, воспоминания или голоса. А победила одна песня на всех."],
          hashtag: ctx.hashtag, onAgain: ctx.restart,
        });
      };
      intro(stage, { emoji: "🏆", title: "Семейный хит-парад", text: ["Восемь песен Александры Пахмутовой и Николая Добронравова сыграют на вылет, как на Олимпиаде.", "Вся семья — жюри. Слушайте, голосуйте и рассказывайте друг другу, почему выбрали именно эту песню."], btn: "Открыть хит-парад ▶" }).then(playRound);
    },
  });
})();
