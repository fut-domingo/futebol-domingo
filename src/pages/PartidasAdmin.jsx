import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";

export default function PartidasAdmin() {
  const matches = useMatches();

  const ordered = useMemo(() => {
    return [...matches].sort((a, b) => (a.matchDate ?? "").localeCompare(b.matchDate ?? ""));
  }, [matches]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h2 style={{ margin: 0, color: "#2a004f" }}>Partidas</h2>
          <div style={{ color: "rgba(42,0,79,0.65)", fontWeight: 700, fontSize: 12 }}>
            Agendadas e jogadas
          </div>
        </div>

        <Link to="/admin" style={{ textDecoration: "none", fontWeight: 1000, color: "#5b2cff" }}>
          Voltar
        </Link>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {ordered.map((m) => (
          <div key={m.id} style={{ padding: 12, border: "1px solid #efe6ff", borderRadius: 14, background: "#fff" }}>
            <div style={{ fontWeight: 1000, color: "#2a004f" }}>
              {m.matchDate ?? "—"} — {m.status === "scheduled" ? "Agendada" : "Jogada"}
            </div>
            <div style={{ color: "rgba(42,0,79,0.7)", marginTop: 4 }}>
              <span style={{ color: "#1d4ed8", fontWeight: 900 }}>{m.teamAName ?? "Time Azul"}</span>
              {"  "}vs{"  "}
              <span style={{ color: "#b91c1c", fontWeight: 900 }}>{m.teamBName ?? "Time Vermelho"}</span>
              {m.status === "played" ? (
                <span style={{ marginLeft: 10, fontWeight: 1000 }}>
                  ({m.scoreA ?? 0} x {m.scoreB ?? 0})
                </span>
              ) : null}
            </div>

            <div style={{ marginTop: 10 }}>
              <Link to={`/admin/partidas/${m.id}`} style={{ fontWeight: 1000, color: "#5b2cff" }}>
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
