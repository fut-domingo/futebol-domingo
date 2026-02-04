export function computeRating(stats) {
  const goals = Number(stats.goals || 0);
  const assists = Number(stats.assists || 0);
  const shotsOnTarget = Number(stats.shotsOnTarget || 0);
  const shots = Number(stats.shots || 0);
  const passes = Number(stats.passes || 0);
  const passesCompleted = Number(stats.passesCompleted || 0);
  const tackles = Number(stats.tackles || 0);
  const dispossessions = Number(stats.dispossessions || 0);
  const foulsCommitted = Number(stats.foulsCommitted || 0);
  const foulsSuffered = Number(stats.foulsSuffered || 0);

  // base
  let r = 6.0;

  // impacto “decisivo”
  r += goals * 0.9;
  r += assists * 0.7;

  // finalização
  r += shotsOnTarget * 0.18;
  r += Math.max(0, shots - shotsOnTarget) * 0.05;

  // passe (qualidade)
  const acc = passes > 0 ? passesCompleted / passes : 0.75;
  r += (acc - 0.75) * 2.0; // acima de 75% sobe, abaixo cai

  // defesa/duelo
  r += tackles * 0.10;

  // erros/impactos negativos
  r -= dispossessions * 0.10;
  r -= foulsCommitted * 0.08;

  // sofrer falta ajuda um pouco
  r += foulsSuffered * 0.05;

  // clamp 0..10
  r = Math.max(0, Math.min(10, r));

  // 2 casas (tipo 7.46)
  return Math.round(r * 100) / 100;
}
