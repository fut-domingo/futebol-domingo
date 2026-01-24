export function computeMvpFromMatch(match) {
  const all = [...(match.teamA ?? []), ...(match.teamB ?? [])];

  if (all.length === 0) return null;

  const score = (p) => (Number(p.goals || 0) * 2) + Number(p.assists || 0);

  const best = all
    .map((p) => ({
      playerId: p.playerId,
      name: p.name,
      photoURL: p.photoURL || "",
      goals: Number(p.goals || 0),
      assists: Number(p.assists || 0),
      mvpScore: score(p),
    }))
    .sort((a, b) => {
      // 1) score (gols*2 + assist)
      if (b.mvpScore !== a.mvpScore) return b.mvpScore - a.mvpScore;
      // 2) gols
      if (b.goals !== a.goals) return b.goals - a.goals;
      // 3) assists
      if (b.assists !== a.assists) return b.assists - a.assists;
      // 4) nome
      return (a.name || "").localeCompare(b.name || "", "pt-BR");
    })[0];

  // se ninguém fez nada, pode retornar null (pra não mostrar modal “sem destaque”)
  if (best.goals === 0 && best.assists === 0) return null;

  return best;
}
