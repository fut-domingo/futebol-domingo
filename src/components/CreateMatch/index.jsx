import { useMemo, useState } from "react";
import {
  collection,
  getDocs,
  writeBatch,
  addDoc,
  doc,
  increment,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { usePlayers } from "../../hooks/usePlayers";
import { computeMvpFromMatch } from "../../utils/mvp";
import { computeRating } from "../../utils/rating";

const tagStyle = {
  fontSize: 11,
  fontWeight: 900,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #efe6ff",
  background: "#fbf8ff",
  color: "#5b2cff",
};

const btnStyle = {
  padding: "9px 12px",
  borderRadius: 12,
  border: "1px solid #efe6ff",
  background: "#fff",
  fontWeight: 1000,
  cursor: "pointer",
}
const STAT_FIELDS = [
  { key: "goals", label: "Gols" },
  { key: "assists", label: "Assistências" },
  { key: "golContra", label: "Gol Contra" },
  { key: "shotsOnTarget", label: "Chutes no gol" },
  { key: "shots", label: "Chutes" },
  { key: "passesErrado", label: "Passes Errado" },
  { key: "passesCompleted", label: "Passes Certos" },
  { key: "tackles", label: "Desarmes" },
  { key: "dispossessions", label: "Perda de posse" },
  { key: "foulsCommitted", label: "Faltas cometidas" },
  { key: "foulsSuffered", label: "Faltas sofridas" },
];

const statLabelStyle = {
  fontSize: 11,
  fontWeight: 900,
  color: "rgba(42,0,79,0.75)",
};

const statInputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #efe6ff",
  outline: "none",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function CreateMatch() {
  const players = usePlayers();

  const [matchDate, setMatchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const [teamA, setTeamA] = useState([]); // Azul
  const [teamB, setTeamB] = useState([]); // Vermelho

  const playersSorted = useMemo(() => {
    return [...players].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"));
  }, [players]);

  function isInTeam(team, id) {
    return team.some((p) => p.id === id);
  }

  function getTeamLabel(playerId) {
    if (isInTeam(teamA, playerId)) return "Azul";
    if (isInTeam(teamB, playerId)) return "Vermelho";
    return "—";
  }

  function removeFromTeams(playerId) {
    setTeamA((prev) => prev.filter((p) => p.id !== playerId));
    setTeamB((prev) => prev.filter((p) => p.id !== playerId));
  }

  function setToTeam(player, team) {
    // Remove dos dois
    setTeamA((prev) => prev.filter((p) => p.id !== player.id));
    setTeamB((prev) => prev.filter((p) => p.id !== player.id));

    const payload = {
  ...player,
  goals: 0,


  assists: 0,
  golContra:0,
  shotsOnTarget: 0,
  shots: 0,
  passesCompleted: 0,
  passesErrado: 0,
  tackles: 0,
  dispossessions: 0,
  foulsCommitted: 0,
  foulsSuffered: 0,
};


    if (team === "A") setTeamA((prev) => [...prev, payload]);
    if (team === "B") setTeamB((prev) => [...prev, payload]);
  }

  function updatePlayerField(team, setTeam, playerId, field, value) {
    const num = value === "" ? 0 : Number(value);
    setTeam(team.map((p) => (p.id === playerId ? { ...p, [field]: num } : p)));
  }

  async function updatePlayers(team, result) {
    for (const player of team) {
      const ref = doc(db, "players", player.id);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const current = snap.data() || {};
        const currentForm = Array.isArray(current.form) ? current.form : [];

        const newForm = [
          result === "win" ? "W" : result === "draw" ? "D" : "L",
          ...currentForm,
        ].slice(0, 5);

        const updateData = {
          games: increment(1),
          goals: increment(Number(player.goals || 0)),
          assists: increment(Number(player.assists || 0)),
          form: newForm,
        };

        if (result === "win") {
          updateData.wins = increment(1);
          updateData.points = increment(3);
        } else if (result === "draw") {
          updateData.draws = increment(1);
          updateData.points = increment(1);
        } else {
          updateData.losses = increment(1);
        }

        tx.update(ref, updateData);
      });
    }
  }

  async function processMatch(scoreA, scoreB) {
    let resultA = "draw";
    let resultB = "draw";

    if (scoreA > scoreB) {
      resultA = "win";
      resultB = "loss";
    } else if (scoreB > scoreA) {
      resultA = "loss";
      resultB = "win";
    }

    await updatePlayers(teamA, resultA);
    await updatePlayers(teamB, resultB);
  }

  function comparePlayers(a, b) {
    const pts = (b.points ?? 0) - (a.points ?? 0);
    if (pts !== 0) return pts;

    const wins = (b.wins ?? 0) - (a.wins ?? 0);
    if (wins !== 0) return wins;

    const goals = (b.goals ?? 0) - (a.goals ?? 0);
    if (goals !== 0) return goals;

    return (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
  }

  async function updateRanks() {
    const snap = await getDocs(collection(db, "players"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    list.sort(comparePlayers);

    const batch = writeBatch(db);

    list.forEach((p, idx) => {
      const newRank = idx + 1;
      const oldRank = typeof p.rank === "number" ? p.rank : null;

      batch.update(doc(db, "players", p.id), {
        prevRank: oldRank,
        rank: newRank,
      });
    });

    await batch.commit();
  }

  async function saveMatch() {
  // ✅ força 8x8
  if (teamA.length !== 8 || teamB.length !== 8) {
    alert(
      `Precisa ter 8 jogadores no Time Azul e 8 no Time Vermelho.\nAzul: ${teamA.length} | Vermelho: ${teamB.length}`
    );
    return;
  }

  // ✅ calcula placares primeiro
  const scoreA = teamA.reduce((sum, p) => sum + Number(p.goals || 0), 0);
  const scoreB = teamB.reduce((sum, p) => sum + Number(p.goals || 0), 0);

  // ✅ monta payload completo (uma única vez)
  const matchPayload = {
    status: "played",
    matchDate, // "YYYY-MM-DD"
    matchDateTS: new Date(matchDate + "T12:00:00"),
    createdAt: serverTimestamp(),
    processedAt: serverTimestamp(), // já processou ao salvar

    teamAName: "Time Azul",
    teamBName: "Time Vermelho",

    scoreA,
    scoreB,

   teamA: teamA.map((p) => {
  const stats = {
    goals: Number(p.goals || 0),
    assists: Number(p.assists || 0),
    golContra: Number(p.golContra || 0),
    shotsOnTarget: Number(p.shotsOnTarget || 0),
    shots: Number(p.shots || 0),
    passesErrado: Number(p.passesErrado || 0),
    passesCompleted: Number(p.passesCompleted || 0),
    tackles: Number(p.tackles || 0),
    dispossessions: Number(p.dispossessions || 0),
    foulsCommitted: Number(p.foulsCommitted || 0),
    foulsSuffered: Number(p.foulsSuffered || 0),
  };

  return {
    playerId: p.id,
    name: p.name,
    photoURL: p.photoURL || "",
    ...stats,
    rating: computeRating(stats),
  };
}),


    teamB: teamB.map((p) => {
  const stats = {
    goals: Number(p.goals || 0),
    assists: Number(p.assists || 0),
    golContra: Number(p.golContra || 0),
    shotsOnTarget: Number(p.shotsOnTarget || 0),
    shots: Number(p.shots || 0),
    passesErrado: Number(p.passesErrado || 0),
    passesCompleted: Number(p.passesCompleted || 0),
    tackles: Number(p.tackles || 0),
    dispossessions: Number(p.dispossessions || 0),
    foulsCommitted: Number(p.foulsCommitted || 0),
    foulsSuffered: Number(p.foulsSuffered || 0),
  };

  return {
    playerId: p.id,
    name: p.name,
    photoURL: p.photoURL || "",
    ...stats,
    rating: computeRating(stats),
  };
}),
  };

  // ✅ MVP calculado com base na partida (gols e assists)
  const mvp = computeMvpFromMatch(matchPayload);

  // ✅ salva UMA vez no Firestore
  await addDoc(collection(db, "matches"), {
    ...matchPayload,
    mvp: mvp || null,
  });

  // ✅ atualiza estatísticas dos jogadores (players)
  await processMatch(scoreA, scoreB);

  // ✅ atualiza ranking (prevRank -> rank)
  await updateRanks();

  setTeamA([]);
  setTeamB([]);
  alert("Partida salva, MVP calculado e estatísticas atualizadas!");
}


  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0, color: "#2a004f" }}>Criar Partida</h2>
      <p style={{ marginTop: 6, color: "rgba(42,0,79,0.65)", fontWeight: 700 }}>
        Monte os times e lance gols/assistências.
      </p>

      {/* Data da partida */}
      <div style={{ marginTop: 16, marginBottom: 14 }}>
        <label style={{ fontWeight: 1000, color: "#2a004f" }}>Data da partida</label>
        <input
          type="date"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          style={{
            display: "block",
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #efe6ff",
            width: 220,
          }}
        />
      </div>

      {/* Seleção */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <h3 style={{ margin: 0, color: "#2a004f" }}>Selecionar Jogadores</h3>

        <div style={{ display: "flex", gap: 10, fontWeight: 1000, color: "rgba(42,0,79,0.7)" }}>
          <span>Azul: {teamA.length}/8</span>
          <span>Vermelho: {teamB.length}/8</span>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        {playersSorted.map((player) => {
          const label = getTeamLabel(player.id);

          const canAddA = teamA.length < 8 || isInTeam(teamA, player.id);
          const canAddB = teamB.length < 8 || isInTeam(teamB, player.id);

          return (
            <div
              key={player.id}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 140px 280px",
                gap: 12,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid #efe6ff",
                background: "#fff",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "1px solid #e0d8ff",
                  background: "#efeaff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 1000,
                  color: "#3a2cff",
                }}
              >
                {player.photoURL ? (
                  <img
                    src={player.photoURL}
                    alt={player.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  initials(player.name || "")
                )}
              </div>

              {/* Nome + tags */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 1000,
                    color: "#2a004f",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {player.name}
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {player.isFixed ? <span style={tagStyle}>📌 FIXO</span> : null}
                  {player.isStar ? <span style={tagStyle}>⭐ CRAQUE</span> : null}
                  {Array.isArray(player.positions) && player.positions.length ? (
                    <span style={tagStyle}>{player.positions.join(" / ")}</span>
                  ) : null}
                </div>
              </div>

              {/* Time atual */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span
                  style={{
                    ...tagStyle,
                    background:
                      label === "Azul"
                        ? "rgba(59,130,246,0.10)"
                        : label === "Vermelho"
                        ? "rgba(239,68,68,0.10)"
                        : "#fbf8ff",
                    borderColor:
                      label === "Azul"
                        ? "rgba(59,130,246,0.25)"
                        : label === "Vermelho"
                        ? "rgba(239,68,68,0.25)"
                        : "#efe6ff",
                    color: label === "Azul" ? "#1d4ed8" : label === "Vermelho" ? "#b91c1c" : "#5b2cff",
                  }}
                >
                  {label === "—" ? "Sem time" : `Time ${label}`}
                </span>
              </div>

              {/* Botões */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setToTeam(player, "A")}
                  style={{ ...btnStyle, borderColor: "#bfdbfe", color: "#1d4ed8" }}
                  disabled={!canAddA}
                >
                  Azul
                </button>

                <button
                  type="button"
                  onClick={() => setToTeam(player, "B")}
                  style={{ ...btnStyle, borderColor: "#fecaca", color: "#b91c1c" }}
                  disabled={!canAddB}
                >
                  Vermelho
                </button>

                <button
                  type="button"
                  onClick={() => removeFromTeams(player.id)}
                  style={{ ...btnStyle, opacity: 0.75 }}
                >
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <hr style={{ margin: "18px 0" }} />

            {/* Time Azul */}
      <h3 style={{ margin: "10px 0", color: "#1d4ed8" }}>Time Azul (estatísticas)</h3>
      {teamA.length === 0 ? (
        <p>Nenhum jogador no Time Azul.</p>
      ) : (
        teamA.map((player) => (
          <div
            key={player.id}
            style={{
              marginBottom: 10,
              padding: "12px 12px",
              border: "1px solid #efe6ff",
              borderRadius: 14,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <strong
                style={{
                  color: "#2a004f",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {player.name}
              </strong>

              <button type="button" onClick={() => removeFromTeams(player.id)} style={{ ...btnStyle, opacity: 0.9 }}>
                Remover
              </button>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {STAT_FIELDS.map((f) => (
                <label key={f.key} style={{ display: "grid", gap: 6 }}>
                  <span style={statLabelStyle}>{f.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={player?.[f.key] ?? 0}
                    onChange={(e) => updatePlayerField(teamA, setTeamA, player.id, f.key, e.target.value)}
                    style={statInputStyle}
                  />
                </label>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Time Vermelho */}
      <h3 style={{ margin: "18px 0 10px 0", color: "#b91c1c" }}>Time Vermelho (estatísticas)</h3>
      {teamB.length === 0 ? (
        <p>Nenhum jogador no Time Vermelho.</p>
      ) : (
        teamB.map((player) => (
          <div
            key={player.id}
            style={{
              marginBottom: 10,
              padding: "12px 12px",
              border: "1px solid #efe6ff",
              borderRadius: 14,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <strong
                style={{
                  color: "#2a004f",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {player.name}
              </strong>

              <button type="button" onClick={() => removeFromTeams(player.id)} style={{ ...btnStyle, opacity: 0.9 }}>
                Remover
              </button>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {STAT_FIELDS.map((f) => (
                <label key={f.key} style={{ display: "grid", gap: 6 }}>
                  <span style={statLabelStyle}>{f.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={player?.[f.key] ?? 0}
                    onChange={(e) => updatePlayerField(teamB, setTeamB, player.id, f.key, e.target.value)}
                    style={statInputStyle}
                  />
                </label>
              ))}
            </div>
          </div>
        ))
      )}

      <hr style={{ margin: "18px 0" }} />

      <button
        type="button"
        onClick={saveMatch}
        disabled={teamA.length !== 8 || teamB.length !== 8}
        style={{
          ...btnStyle,
          padding: "12px 16px",
          borderRadius: 14,
          background: teamA.length === 8 && teamB.length === 8 ? "#2a004f" : "#ddd",
          color: teamA.length === 8 && teamB.length === 8 ? "#fff" : "#666",
          border: "0",
        }}
      >
        Salvar Partida (8 x 8)
      </button>
    </div>
  );
}
