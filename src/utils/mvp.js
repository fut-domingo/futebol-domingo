export function computeMvpFromMatch(match) {
  const all = [...(match?.teamA ?? []), ...(match?.teamB ?? [])];
  if (!all.length) return null;

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // se vier "12%" retorna 12, se vier número retorna número
  const toPercent = (v) => {
    if (typeof v === "string" && v.includes("%")) return toNum(v.replace("%", ""));
    return toNum(v);
  };

  // ===== PESOS (ajustáveis) =====
  const W = {
    goal: 6,
    assist: 4,
    shotsOnTarget: 1.5,
    shots: 0.3,
    passesCompleted: 0.08,
    tackles: 1.2,
    foulsSuffered: 0.25,
    rating: 0.8,
  };

  const P = {
    passesErrado: 0.12,
    foulsCommitted: 0.7,
    golContra: 5,
    // possessionLost numérico (não-%): punição direta
    possessionLostFlat: 0.9,
  };

  const score = (p) => {
    const goals = toNum(p.goals);
    const assists = toNum(p.assists);
    const shotsOnTarget = toNum(p.shotsOnTarget);
    const shots = toNum(p.shots);
    const passesCompleted = toNum(p.passesCompleted);
    const passesErrado = toNum(p.passesErrado);
    const tackles = toNum(p.tackles);
    const foulsSuffered = toNum(p.foulsSuffered);
    const foulsCommitted = toNum(p.foulsCommitted);
    const rating = toNum(p.rating);
    const golContra = toNum(p.golContra);

    // perda de posse pode vir como número OU "xx%"
    const rawLost = p.possessionLost;
    const lostIsPercent = typeof rawLost === "string" && rawLost.includes("%");
    const lostVal = lostIsPercent ? toPercent(rawLost) : toNum(rawLost);

    const plus =
      goals * W.goal +
      assists * W.assist +
      shotsOnTarget * W.shotsOnTarget +
      shots * W.shots +
      passesCompleted * W.passesCompleted +
      tackles * W.tackles +
      foulsSuffered * W.foulsSuffered +
      rating * W.rating;

    const minus =
      passesErrado * P.passesErrado +
      foulsCommitted * P.foulsCommitted +
      golContra * P.golContra +
      (lostIsPercent ? 0 : lostVal * P.possessionLostFlat);

    let total = plus - minus;

    // ✅ Penalidade percentual (se for %):
    // Ex.: 12% de perda de posse reduz o MVP em 12%
    if (lostIsPercent && lostVal > 0) {
      const factor = Math.max(0, 1 - lostVal / 100);
      total = total * factor;
    }

    return total;
  };

  const ranked = all
    .map((p) => ({
      playerId: p.playerId,
      name: p.name,
      photoURL: p.photoURL || "",
      goals: toNum(p.goals),
      assists: toNum(p.assists),
      rating: toNum(p.rating),
      mvpScore: Number(score(p).toFixed(2)),
    }))
    .sort((a, b) => {
      if (b.mvpScore !== a.mvpScore) return b.mvpScore - a.mvpScore;
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return (a.name || "").localeCompare(b.name || "", "pt-BR");
    });

  const best = ranked[0];

  // se todo mundo ficou <= 0, não mostra MVP
  if (!best || best.mvpScore <= 0) return null;

  return best;
}
