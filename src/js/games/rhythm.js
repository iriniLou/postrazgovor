/* 6–7 классы · Я – сам · «Шайба в ритм» — ритм-игра на фрагментах песен */
"use strict";
(() => {
  const TRACKS = ["hockey", "ptica", "moskva", "gagarin"];
  const LEVELS = [
    { name: "Новичок", every: 2, travel: 2.0, onsets: false },
    { name: "Нападающий", every: 1, travel: 1.6, onsets: false },
    { name: "Капитан", every: 1, travel: 1.3, onsets: true },
  ];
  const KEYS = { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, KeyA: 0, KeyS: 1, KeyD: 2, KeyJ: 0, KeyK: 1, KeyL: 2 };

  function buildNotes(id, lvl) {
    const b = (window.BEATS || {})[id];
    if (!b) return [];
    let notes = b.beats.filter((_, i) => i % lvl.every === 0).map(([t, lane]) => ({ t, lane }));
    if (lvl.onsets) {
      for (const [t, lane] of b.onsets) if (notes.every(n => Math.abs(n.t - t) > .18)) notes.push({ t, lane });
      notes.sort((a, b) => a.t - b.t);
    }
    // не больше трёх подряд на одной дорожке
    for (let i = 3; i < notes.length; i++) if (notes[i].lane === notes[i - 1].lane && notes[i].lane === notes[i - 2].lane && notes[i].lane === notes[i - 3].lane) notes[i].lane = (notes[i].lane + 1 + (i % 2)) % 3;
    return notes.map(n => ({ ...n, hit: false, judged: false }));
  }

  Games.register({
    id: "rhythm", group: "6-7", mode: "solo", emoji: "🏒", title: "Шайба в ритм",
    short: "Ритм-игра: шайбы летят под музыку Пахмутовой. Отбивай их точно в такт — и стань капитаном команды!",
    players: "1 игрок", time: "5–15 минут", needs: "🔊 нужен звук",
    rules: [
      "Выбери песню и уровень. Шайбы скользят по трём дорожкам к линии ворот.",
      "Когда шайба касается линии, нажми её дорожку: стрелки ← ↓ → (или A S D), а на телефоне — коснись дорожки.",
      "Точно в такт — «Отлично!», чуть раньше или позже — «Хорошо». Чем длиннее серия без промахов, тем больше очков.",
      "После песни узнаешь её историю.",
    ],
    start(stage, ctx) {
      let raf = null, audio = null, keyH = null;
      const stopAll = () => { cancelAnimationFrame(raf); Music.stop(); if (keyH) removeEventListener("keydown", keyH); };
      ctx.onCleanup(stopAll);

      const menu = () => {
        stopAll();
        let song = TRACKS[0], lvl = 1;
        const songsBox = h("div", { class: "options" }), lvlBox = h("div", { class: "row c" });
        const draw = () => {
          U.clear(songsBox).append(TRACKS.map(id => { const s = Music.get(id); return h("button", { class: "opt" + (song === id ? " right" : ""), onclick: () => { song = id; draw(); } }, h("span", { class: "em", style: { fontSize: "22px", marginRight: "8px" } }, s.emoji), `«${s.title}»`, h("div", { class: "small muted" }, `${s.artist} · темп ≈ ${Math.round(BEATS[id].bpm)}`)); }));
          U.clear(lvlBox).append(LEVELS.map((l, i) => h("button", { class: "btn " + (lvl === i ? "" : "ghost"), onclick: () => { lvl = i; draw(); } }, l.name)));
        };
        draw();
        U.clear(stage).append(h("div", { class: "stack", style: { maxWidth: "720px", margin: "0 auto" } },
          h("h2", { class: "center" }, "Выбери песню"), songsBox, h("h3", { class: "center" }, "Уровень"), lvlBox,
          h("div", { class: "row c" }, h("button", { class: "btn big", onclick: () => play(song, LEVELS[lvl]) }, "На лёд! ▶")),
          h("p", { class: "center small muted" }, "Совет: надень наушники и играй на компьютере стрелками — так точнее.")));
      };

      const play = async (id, lvl) => {
        const notes = buildNotes(id, lvl);
        const W = Math.min(520, stage.clientWidth - 20), H = Math.min(560, Math.max(420, innerHeight - 260));
        const cv = h("canvas", { width: W * devicePixelRatio, height: H * devicePixelRatio, style: { width: W + "px", height: H + "px", display: "block", margin: "0 auto", borderRadius: "18px", touchAction: "none" } });
        const c = cv.getContext("2d"); c.scale(devicePixelRatio, devicePixelRatio);
        const info = h("div", { class: "row c", style: { marginBottom: "8px", fontWeight: 700 } });
        U.clear(stage).append(info, cv, h("p", { class: "center small muted", style: { marginTop: "8px" } }, "← ↓ →  или  A S D  ·  на телефоне — касайся дорожек"));
        const lw = W / 3, hitY = H - 70;
        let score = 0, combo = 0, maxCombo = 0, perfect = 0, good = 0, miss = 0;
        const fx = [];
        const flash = [0, 0, 0];
        const judge = (lane, t) => {
          flash[lane] = 1;
          let best = null;
          for (const n of notes) if (!n.judged && n.lane === lane && Math.abs(n.t - t) < .2) { if (!best || Math.abs(n.t - t) < Math.abs(best.t - t)) best = n; }
          if (!best) return;
          const d = Math.abs(best.t - t);
          best.judged = true; best.hit = true;
          if (d < .085) { perfect++; combo++; score += 300 * (1 + Math.floor(combo / 10)); fx.push({ lane, text: "Отлично!", col: "#2e8b57", a: 1 }); }
          else { good++; combo++; score += 100 * (1 + Math.floor(combo / 10)); fx.push({ lane, text: "Хорошо", col: "#2f4fa3", a: 1 }); }
          maxCombo = Math.max(maxCombo, combo);
        };
        const now = () => audio ? audio.currentTime : 0;
        keyH = e => { if (e.code in KEYS) { e.preventDefault(); if (!e.repeat) judge(KEYS[e.code], now()); } };
        addEventListener("keydown", keyH);
        cv.addEventListener("pointerdown", e => { const r = cv.getBoundingClientRect(); judge(U.clamp(Math.floor((e.clientX - r.left) / lw), 0, 2), now()); });

        // обратный отсчёт
        for (const k of ["3", "2", "1"]) { U.clear(info).append(h("span", { class: "title-xl" }, k)); Sfx.tone(660, .1); await U.wait(600); }
        if (!stage.contains(cv)) return;
        audio = Music.play(id, { from: 0 });
        let ended = false;
        audio.onended = () => ended = true;

        const draw = () => {
          const t = now();
          // лёд
          c.fillStyle = "#eef6fb"; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 3; i++) {
            c.fillStyle = flash[i] > 0 ? `rgba(158,34,64,${.12 * flash[i]})` : (i % 2 ? "#e6f0f7" : "#eef6fb"); c.fillRect(i * lw, 0, lw, H);
            flash[i] = Math.max(0, flash[i] - .08);
          }
          c.strokeStyle = "#c9dbe8"; c.lineWidth = 2; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(i * lw, 0); c.lineTo(i * lw, H); c.stroke(); }
          c.strokeStyle = "#9e2240"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, hitY); c.lineTo(W, hitY); c.stroke();
          c.strokeStyle = "#3b6fb5"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, H * .33); c.lineTo(W, H * .33); c.stroke();
          for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(i * lw + lw / 2, hitY, 26, 0, Math.PI * 2); c.strokeStyle = "#9e224088"; c.lineWidth = 3; c.stroke(); }
          c.font = "15px " + getComputedStyle(document.body).fontFamily; c.fillStyle = "#9e2240aa"; c.textAlign = "center";
          ["←", "↓", "→"].forEach((k, i) => c.fillText(k, i * lw + lw / 2, H - 22));
          // шайбы
          for (const n of notes) {
            if (n.judged && n.hit) continue;
            const y = hitY - (n.t - t) / lvl.travel * hitY;
            if (!n.judged && t - n.t > .2) { n.judged = true; miss++; combo = 0; fx.push({ lane: n.lane, text: "Мимо", col: "#c0392b", a: 1 }); }
            if (y < -30 || y > H + 30) continue;
            const x = n.lane * lw + lw / 2;
            c.fillStyle = n.judged ? "#88888855" : "#1d1b20";
            c.beginPath(); c.ellipse(x, y, 22, 14, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = n.judged ? "#88888833" : "#3a3740"; c.beginPath(); c.ellipse(x, y - 4, 22, 12, 0, 0, Math.PI * 2); c.fill();
          }
          for (const f of fx) { c.globalAlpha = f.a; c.fillStyle = f.col; c.font = "bold 20px sans-serif"; c.fillText(f.text, f.lane * lw + lw / 2, hitY - 40 - (1 - f.a) * 40); f.a -= .025; }
          c.globalAlpha = 1;
          for (let i = fx.length - 1; i >= 0; i--) if (fx[i].a <= 0) fx.splice(i, 1);
          U.clear(info).append(h("span", null, `Очки: ${score}`), h("span", { class: "pill" }, `Серия ×${combo}`));
          const last = notes.length ? notes[notes.length - 1].t : 0;
          if (ended || t > last + 1.5 && t > 5) return finish();
          raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        const finish = () => {
          stopAll();
          const total = notes.length || 1, acc = Math.round((perfect + good * .6) / total * 100);
          const stars = acc >= 85 ? 3 : acc >= 60 ? 2 : 1;
          const s = Music.get(id);
          finale(stage, {
            stars, title: ["Хороший старт!", "Надёжный нападающий!", "Капитан команды!"][stars - 1],
            text: `Очки: ${score} · точность ${acc}% · отлично: ${perfect}, хорошо: ${good}, мимо: ${miss} · лучшая серия: ${maxCombo}`,
            facts: [`<b>«${s.title}»${s.year ? ", " + s.year : ""}.</b> ${s.note}`,
              "<b>Подумай:</b> почему одним песням хочется отбивать ритм, а другие хочется слушать в тишине? Что сделали авторы, чтобы песня звучала именно так?"],
            hashtag: ctx.hashtag,
            extra: h("div", { class: "row c" }, h("button", { class: "btn dark", onclick: menu }, "Другая песня или уровень")),
            onAgain: () => play(id, lvl),
          });
        };
      };
      menu();
    },
  });
})();
