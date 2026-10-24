/* 10–11 классы · Я – сам · «Склейка плёнки» — собери фрагмент песни из обрывков на слух */
"use strict";
(() => {
  const SEG = 4; // секунд в одном обрывке

  Games.register({
    id: "tape", group: "10-11", mode: "solo", emoji: "📼", title: "Склейка плёнки",
    short: "Радиостудия, до эфира пять минут. Магнитофонная плёнка с песней порвалась на куски. Склей её на слух, пока не начался эфир!",
    players: "1 игрок", time: "5–15 минут", needs: "🎧 лучше в наушниках",
    rules: [
      "Выбери песню и сложность: на сколько кусков порвалась плёнка.",
      "Слушай обрывки (кнопка ▶) и вклеивай их в плёнку по порядку.",
      "Нажми «Проверить» — узнаешь, сколько кусков стоят на своих местах (но не каких именно).",
      "После трёх проверок правильные куски подсветятся. Чем меньше проверок, тем больше звёзд.",
    ],
    start(stage, ctx) {
      ctx.onCleanup(() => Music.stop());
      const menu = () => {
        let song = SONGS[0].id, n = 6;
        const sBox = h("div", { class: "options" }), nBox = h("div", { class: "row c" });
        const draw = () => {
          U.clear(sBox).append(SONGS.map(s => h("button", { class: "opt" + (song === s.id ? " right" : ""), onclick: () => { song = s.id; draw(); } }, h("span", { class: "em", style: { marginRight: "8px" } }, s.emoji), "«" + s.title + "»", h("div", { class: "small muted" }, s.artist))));
          U.clear(nBox).append([[4, "4 куска · лёгкий"], [6, "6 кусков"], [8, "8 кусков · для профи"]].map(([v, t]) => h("button", { class: "btn " + (n === v ? "" : "ghost"), onclick: () => { n = v; draw(); } }, t)));
        };
        draw();
        U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "760px", margin: "0 auto" } },
          h("h2", { class: "center" }, "Какую плёнку склеиваем?"), sBox, nBox, h("div", { class: "row c" }, h("button", { class: "btn big", onclick: () => game(song, n) }, "За монтажный стол ▶"))));
      };

      const game = (id, n) => {
        const start0 = 0;
        const pieces = Array.from({ length: n }, (_, i) => ({ i, from: start0 + i * SEG, label: "ABCDEFGH"[i] }));
        let pool = U.shuffle(pieces); while (n > 2 && pool.every((p, k) => p.i === k)) pool = U.shuffle(pieces);
        // буквы перемешаны, чтобы не подсказывать порядок
        const letters = U.shuffle("АБВГДЕЖЗ".slice(0, n).split("")); pool.forEach((p, k) => p.label = letters[k]);
        const tape = [];
        let checks = 0, playingEl = null, showRight = false;
        const s = Music.get(id);
        const poolBox = h("div", { class: "row c" }), tapeBox = h("div", { class: "row", style: { gap: "6px", minHeight: "92px", background: "#2c2a33", borderRadius: "14px", padding: "12px", justifyContent: "flex-start", overflowX: "auto", flexWrap: "nowrap" } });
        const msg = h("p", { class: "center", style: { minHeight: "26px", fontWeight: 650 } });
        const piece = (p, inTape) => {
          const el = h("div", { style: { flex: "none", width: "86px", borderRadius: "10px", padding: "8px 6px", background: inTape && showRight && tape.indexOf(p) === p.i ? "#2e8b57" : "#6b4b2e", color: "#fff", textAlign: "center", boxShadow: "inset 0 6px 0 #0003, inset 0 -6px 0 #0003" } },
            h("div", { style: { fontWeight: 800, fontSize: "22px" } }, p.label),
            h("div", { class: "row c", style: { gap: "4px" } },
              h("button", { class: "icon-btn", style: { height: "32px", minWidth: "32px", fontSize: "14px" }, title: "Послушать", onclick: () => listen(p, el) }, "▶"),
              inTape ? h("button", { class: "icon-btn", style: { height: "32px", minWidth: "32px", fontSize: "14px" }, title: "Вернуть", onclick: () => { tape.splice(tape.indexOf(p), 1); pool.push(p); draw(); } }, "↩")
                : h("button", { class: "icon-btn", style: { height: "32px", minWidth: "32px", fontSize: "14px" }, title: "Вклеить", onclick: () => { pool.splice(pool.indexOf(p), 1); tape.push(p); Sfx.click(); draw(); } }, "＋")));
          return el;
        };
        const listen = (p, el) => {
          if (playingEl) playingEl.style.outline = "none";
          playingEl = el; el.style.outline = "4px solid #f6b26b";
          Music.play(id, { from: p.from, dur: SEG, onEnd: () => { el.style.outline = "none"; } });
        };
        const playTape = async () => {
          if (!tape.length) return;
          for (const [k, p] of tape.entries()) {
            const el = tapeBox.children[k]; if (!el) return;
            await new Promise(r => { el.style.outline = "4px solid #f6b26b"; Music.play(id, { from: p.from, dur: SEG, onEnd: r }); });
            el.style.outline = "none";
            if (!stage.contains(tapeBox)) return;
          }
        };
        const check = () => {
          if (tape.length < n) return msg.textContent = `Вклей все куски: осталось ${n - tape.length}.`;
          checks++;
          const ok = tape.filter((p, k) => p.i === k).length;
          if (ok === n) return win();
          if (checks >= 3) showRight = true;
          Sfx.bad(); msg.textContent = `На своих местах: ${ok} из ${n}.` + (showRight ? " Правильные куски подсвечены зелёным." : " Послушай ещё раз стыки!");
          draw();
        };
        const draw = () => {
          U.clear(poolBox).append(pool.length ? pool.map(p => piece(p, false)) : h("p", { class: "muted small" }, "Все куски вклеены — прослушай и проверь!"));
          U.clear(tapeBox).append(tape.length ? tape.map(p => piece(p, true)) : h("p", { style: { color: "#bbb", margin: "auto" } }, "Здесь будет склеенная плёнка ▶"));
        };
        const win = () => {
          Music.play(id, { from: start0, dur: n * SEG });
          const stars = checks <= 1 ? 3 : checks <= 3 ? 2 : 1;
          finale(stage, {
            stars, title: "Плёнка склеена — эфир спасён!",
            text: `«${s.title}» · ${s.artist}. Проверок: ${checks}.`,
            facts: [`<b>О песне.</b> ${s.note}`,
              "<b>Что помогало склеивать?</b> Мелодия, слова, дыхание певца, ритм, нарастание оркестра. Так же внимательно звукорежиссёры и авторы работали над каждой записью: чтобы песня прожила десятилетия, важна каждая секунда.",
              "<b>Вопрос:</b> что вы услышали в песне, слушая её по кусочкам, чего не заметили бы при обычном прослушивании?"],
            extra: h("div", { class: "row c" }, h("button", { class: "btn dark", onclick: () => { Music.stop(); menu(); } }, "Другая плёнка")),
            hashtag: ctx.hashtag, onAgain: () => game(id, n),
          });
        };
        U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "860px", margin: "0 auto" } },
          h("div", { class: "row", style: { justifyContent: "space-between" } }, h("h3", { style: { margin: 0 } }, `«${s.title}»`), h("span", { class: "pill" }, `${n} ${U.plural(n, "кусок", "куска", "кусков")} по ${SEG} с`)),
          h("b", null, "Обрывки плёнки"), poolBox,
          h("b", null, "📼 Склеенная плёнка"), tapeBox,
          h("div", { class: "row c" }, h("button", { class: "btn dark", onclick: playTape }, "▶ Прослушать склейку"), h("button", { class: "btn", onclick: check }, "✓ Проверить"), h("button", { class: "btn ghost", onclick: () => Music.stop() }, "⏹ Стоп")),
          msg,
          h("p", { class: "small muted center" }, "Подсказка: самый первый кусок начинается тихо — так звучит начало фрагмента.")));
        draw();
      };
      menu();
    },
  });
})();
