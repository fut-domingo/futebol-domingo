import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  runTransaction,
  increment,
  collection,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { computeMvpFromMatch } from "../../src/utils/mvp";


function sumGoals(team = []) {
  return team.reduce((s, p) => s + Number(p.goals || 0), 0);
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
    batch.update(doc(db, "players", p.id), { prevRank: oldRank, rank: newRank });
  });

  await batch.commit();
}

export default function EditarPartida() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);

  const ref = useMemo(() => doc(db, "matches", id), [id]);

  useEffect(() => {
    return onSnapshot(ref, (snap) => {
      setMatch(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
  }, [ref]);

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;
  if (!match) return <div style={{ padding: 16 }}>Partida não encontrada.</div>;

  const teamAName = match.teamAName ?? "Time Azul";
  const teamBName = match.teamBName ?? "Time Vermelho";

  function updatePlayer(teamKey, index, field, value) {
    const num = value === "" ? 0 : Number(value);
    const next = [...(match[teamKey] ?? [])];
    next[index] = { ...next[index], [field]: num };
    setMatch((prev) => ({ ...prev, [teamKey]: next }));
  }

  async function saveDraft() {
    const scoreA = sumGoals(match.teamA);
    const scoreB = sumGoals(match.teamB);

    await updateDoc(ref, {
      matchDate: match.matchDate,
      matchDateTS: new Date(match.matchDate + "T12:00:00"),
      teamAName,
      teamBName,
      teamA: match.teamA ?? [],
      teamB: match.teamB ?? [],
      scoreA,
      scoreB,
    });

    alert("Alterações salvas.");
  }

async function finalize() {
  const scoreA = sumGoals(match.teamA);
  const scoreB = sumGoals(match.teamB);

  const mvp = computeMvpFromMatch(match);
  

  await runTransaction(db, async (tx) => {
    // 1) READS primeiro
    const matchSnap = await tx.get(ref);
    const data = matchSnap.data();

    if (data?.processedAt) {
      throw new Error("Essa partida já foi finalizada (processada).");
    }

    // calcula resultado
    let resultA = "draw";
    let resultB = "draw";
    if (scoreA > scoreB) { resultA = "win"; resultB = "loss"; }
    else if (scoreB > scoreA) { resultA = "loss"; resultB = "win"; }

    // prepara refs dos players (azul e vermelho)
    const teamA = match.teamA ?? [];
    const teamB = match.teamB ?? [];

    const refsA = teamA.map(p => doc(db, "players", p.playerId));
    const refsB = teamB.map(p => doc(db, "players", p.playerId));

    // lê todos players antes de escrever
    const snapsA = await Promise.all(refsA.map(r => tx.get(r)));
    const snapsB = await Promise.all(refsB.map(r => tx.get(r)));

    // 2) WRITES depois
    // update match
    tx.update(ref, {
      status: "played",
      scoreA,
      scoreB,
      processedAt: serverTimestamp(),
      teamAName: match.teamAName ?? "Time Azul",
      teamBName: match.teamBName ?? "Time Vermelho",
      teamA,
      teamB,
      mvp: mvp || null,
    });

    // helper: aplica update num player snap + resultado
    function buildUpdate(current, playerRow, result) {
      const currentForm = Array.isArray(current.form) ? current.form : [];
      const formChar = result === "win" ? "W" : result === "draw" ? "D" : "L";
      const newForm = [formChar, ...currentForm].slice(0, 5);

      const upd = {
        games: increment(1),
        goals: increment(Number(playerRow.goals || 0)),
        assists: increment(Number(playerRow.assists || 0)),
        form: newForm,
      };

      if (result === "win") { upd.wins = increment(1); upd.points = increment(3); }
      else if (result === "draw") { upd.draws = increment(1); upd.points = increment(1); }
      else { upd.losses = increment(1); }

      return upd;
    }

    // aplica updates no time A
    snapsA.forEach((snap, i) => {
      const currentData = snap.data() || {};
      const upd = buildUpdate(currentData, teamA[i], resultA);
      tx.update(refsA[i], upd);
    });

    // aplica updates no time B
    snapsB.forEach((snap, i) => {
      const currentData = snap.data() || {};
      const upd = buildUpdate(currentData, teamB[i], resultB);
      tx.update(refsB[i], upd);
    });
  });

  await updateRanks();
  alert("Partida finalizada e classificação atualizada!");
}


  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h2 style={{ margin: 0, color: "#2a004f" }}>Editar Partida</h2>
          <div style={{ color: "rgba(42,0,79,0.65)", fontWeight: 700, fontSize: 12 }}>
            Status: {match.status === "scheduled" ? "Agendada" : "Jogada"}
          </div>
        </div>
        <Link to="/admin/partidas" style={{ textDecoration: "none", fontWeight: 1000, color: "#5b2cff" }}>
          Voltar
        </Link>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ fontWeight: 1000, color: "#2a004f" }}>Data</label>
        <input
          type="date"
          value={match.matchDate ?? ""}
          onChange={(e) => setMatch((prev) => ({ ...prev, matchDate: e.target.value }))}
          style={{ display: "block", marginTop: 6, padding: "10px 12px", borderRadius: 12, border: "1px solid #efe6ff", width: 220 }}
        />
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Azul */}
        <div style={{ border: "1px solid #efe6ff", borderRadius: 14, padding: 12, background: "#fff" }}>
          <div style={{ fontWeight: 1000, color: "#1d4ed8", marginBottom: 10 }}>{teamAName}</div>

          {(match.teamA ?? []).map((p, idx) => (
            <div key={p.playerId ?? idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 900, color: "#2a004f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </div>
              <input type="number" min="0" value={p.goals ?? 0} onChange={(e) => updatePlayer("teamA", idx, "goals", e.target.value)} />
              <input type="number" min="0" value={p.assists ?? 0} onChange={(e) => updatePlayer("teamA", idx, "assists", e.target.value)} />
            </div>
          ))}
        </div>

        {/* Vermelho */}
        <div style={{ border: "1px solid #efe6ff", borderRadius: 14, padding: 12, background: "#fff" }}>
          <div style={{ fontWeight: 1000, color: "#b91c1c", marginBottom: 10 }}>{teamBName}</div>

          {(match.teamB ?? []).map((p, idx) => (
            <div key={p.playerId ?? idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 900, color: "#2a004f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </div>
              <input type="number" min="0" value={p.goals ?? 0} onChange={(e) => updatePlayer("teamB", idx, "goals", e.target.value)} />
              <input type="number" min="0" value={p.assists ?? 0} onChange={(e) => updatePlayer("teamB", idx, "assists", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, fontWeight: 1000, color: "#2a004f" }}>
        Placar: {sumGoals(match.teamA)} x {sumGoals(match.teamB)}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={saveDraft} style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid #efe6ff", background: "#fff", fontWeight: 1000 }}>
          Salvar
        </button>

        <button
          onClick={finalize}
          disabled={!!match.processedAt}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "0",
            background: match.processedAt ? "#ddd" : "#2a004f",
            color: match.processedAt ? "#666" : "#fff",
            fontWeight: 1000,
            cursor: match.processedAt ? "not-allowed" : "pointer",
          }}
        >
          Finalizar (atualiza classificação)
        </button>
      </div>
    </div>
  );
}
