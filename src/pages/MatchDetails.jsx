import { useEffect, useMemo, useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const Page = styled.div`
  padding: 18px;
  background: #f6f6fb;
  min-height: 100vh;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #efe6ff;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 18px 40px rgba(20, 0, 40, 0.06);
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: 20px;
  color: #2a004f;
  letter-spacing: -0.2px;
`;

const Sub = styled.div`
  font-size: 12px;
  color: rgba(42, 0, 79, 0.65);
  font-weight: 700;
`;

const BackBtn = styled(Link)`
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #ffffff;
  color: #5b2cff;
  font-weight: 900;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const PitchCard = styled(Card)`
  padding: 0; /* tira padding pra ocupar tudo */
  overflow: hidden;
`;


const PitchField = styled.div`
  position: relative;
  width: 100%;
  height: 620px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #1f8a4c 0%, #167a40 100%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.10);

  @media (max-width: 980px) {
    height: 520px;
  }

  @media (max-width: 560px) {
    height: 460px;
  }
`;

const PitchLines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  /* linha do meio */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }

  /* círculo central */
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 140px;
    height: 140px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    transform: translate(-50%, -50%);
  }
`;

const TeamTag = styled.div`
  position: absolute;
  top: ${(p) => (p.$side === "top" ? "12px" : "auto")};
  bottom: ${(p) => (p.$side === "bottom" ? "12px" : "auto")};
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
`;

const TeamPill = styled.div`
  font-weight: 1000;
  font-size: 13px;
  letter-spacing: -0.2px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  backdrop-filter: blur(8px);
`;

const PlayerSpot = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 110px; /* era 78 */
  pointer-events: none;
`;

const PlayerAvatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 999px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 18px rgba(0,0,0,0.25);
`;

const PlayerName = styled.div`
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 1000;
  font-size: 12px;
  width: 110px;
  text-align: center;

  /* permite 2 linhas tipo Google */
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PlayerRating = styled.div`
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 1000;
  font-size: 12px;
`;



const MidLine = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.35);
    transform: translateX(-1px);
  }
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 120px;
    height: 120px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    transform: translate(-50%, -50%);
  }
`;

const SideLabel = styled.div`
  position: absolute;
  top: 10px;
  font-weight: 1000;
  font-size: 13px;
  letter-spacing: -0.2px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  backdrop-filter: blur(8px);
`;


const RatingPill = styled.div`
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 1000;
  font-size: 11px;
  line-height: 1;
  backdrop-filter: blur(8px);
`;

const PlayerMarker = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 86px;
  pointer-events: none;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
`;


const RatingBadge = styled.div`
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
`;


// --- Stats ---
const StatsCard = styled(Card)``;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const TabBtn = styled.button`
  border: 1px solid #efe6ff;
  background: ${(p) => (p.$active ? "#2a004f" : "#fff")};
  color: ${(p) => (p.$active ? "#fff" : "#5b2cff")};
  font-weight: 1000;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
`;

const TableWrap = styled.div`
  overflow: auto;
  border-radius: 14px;
  border: 1px solid #efe6ff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;

  th,
  td {
    padding: 10px 10px;
    border-bottom: 1px solid rgba(91, 44, 255, 0.12);
    font-size: 13px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    position: sticky;
    top: 0;
    background: #fbf8ff;
    color: rgba(42, 0, 79, 0.7);
    font-weight: 1000;
    z-index: 1;
  }

  tr:last-child td {
    border-bottom: 0;
  }
`;

function brDate(s) {
  if (!s) return "";
  const [y, m, d] = String(s).split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

// function hasPos(p, key) {
//   const arr = Array.isArray(p?.positions) ? p.positions : [];
//   return arr.includes(key);
// }

function hasPos(player, pos) {
  if (!player) return false;
  if (Array.isArray(player.positions)) {
    return player.positions.includes(pos);
  }
  if (typeof player.position === "string") {
    return player.position === pos;
  }
  return false;
}



// ======= FORMATION (estilo Google) =======

const POS_ORDER = ["ZG", "VOL", "MC", "MEI", "ATA"];

// Y do TIME DE CIMA (em %). TIME DE BAIXO = espelhado.
const Y_TOP = {
  ZG: 18,
  VOL: 30,
  MC: 40,
  MEI: 46,
  ATA: 52, // ataque mais perto do meio
};

function getPrimaryPos(p) {
  for (const pos of POS_ORDER) {
    if (hasPos(p, pos)) return pos;
  }
  return "MC"; // fallback
}

function groupByPos(players) {
  const groups = { ZG: [], VOL: [], MC: [], MEI: [], ATA: [] };
  for (const p of players || []) {
    const k = getPrimaryPos(p);
    groups[k].push(p);
  }
  return groups;
}

function xPositions(n, min = 18, max = 82) {
  if (!n) return [];
  if (n === 1) return [50];
  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, i) => min + step * i);
}

// side: "top" | "bottom"
function renderTeamOnPitch(players, side) {
  const groups = groupByPos(players);

  return POS_ORDER.flatMap((posKey) => {
    const list = groups[posKey] || [];
    if (list.length === 0) return [];

    const xs = xPositions(list.length);
    const baseY = Y_TOP[posKey] ?? 40;
    const y = side === "top" ? baseY : 100 - baseY;

    return list.map((p, idx) => {
      const x = xs[idx] ?? 50;
      const ratingText =
        p?.rating && Number(p.rating) > 0 ? Number(p.rating).toFixed(2) : "—";

      return (
        <PlayerSpot
          key={`${side}-${posKey}-${p.playerId || p.id || p.name}-${idx}`}
          style={{ left: `${x}%`, top: `${y}%` }}
          title={p.name}
        >
          <PlayerAvatar>
            {p.photoURL ? (
              <img
                src={p.photoURL}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </PlayerAvatar>

          <PlayerName>{p.name}</PlayerName>
          <PlayerRating>{ratingText}</PlayerRating>
        </PlayerSpot>
      );
    });
  });
}


function primaryPos(p) {
  // prioridade (MEI separado do MC)
  if (hasPos(p, "ZG")) return "ZG";
  if (hasPos(p, "MC")) return "MC";
  if (hasPos(p, "MEI")) return "MEI";
  if (hasPos(p, "ATA")) return "ATA";
  return "OUT";
}

function buildLines(players) {
  const groups = {
    ZG: [],
    MC: [],
    MEI: [],
    ATA: [],
    OUT: [],
  };

  for (const p of players || []) {
    groups[primaryPos(p)].push(p);
  }

  // monta apenas as linhas que existem (sem zeros)
  const order = ["ZG", "MC", "MEI", "ATA", "OUT"];
  const lines = order
    .map((k) => ({ key: k, players: groups[k] }))
    .filter((x) => x.players.length > 0);

  return lines;
}

function formationLabel(lines) {
  // ex: 3-2-1-2 (não mostra OUT)
  const filtered = lines.filter((l) => l.key !== "OUT");
  return filtered.map((l) => l.players.length).join("-");
}

function normalizeMatch(m) {
  // Match docs guard: some old matches may not have the new stats.
  const normPlayer = (x) => ({
    ...x,
    goals: Number(x?.goals || 0),
    assists: Number(x?.assists || 0),
    shotsOnTarget: Number(x?.shotsOnTarget || 0),
    shots: Number(x?.shots || 0),
    passesCompleted: Number(x?.passesCompleted || 0),
    passesErrado: Number(x?.passesErrado || 0),
    tackles: Number(x?.tackles || 0),
    possessionLost: Number(x?.possessionLost || 0),
    foulsCommitted: Number(x?.foulsCommitted || 0),
    foulsSuffered: Number(x?.foulsSuffered || 0),
    rating: Number(x?.rating || 0),
  });

  return {
    ...m,
    teamA: (m?.teamA || []).map(normPlayer),
    teamB: (m?.teamB || []).map(normPlayer),
  };
}

export default function MatchDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [tab, setTab] = useState("geral");

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        const ref = doc(db, "matches", id);
        const snap = await getDoc(ref);
        if (!alive) return;
        if (!snap.exists()) {
          setMatch(null);
        } else {
          setMatch(normalizeMatch({ id: snap.id, ...snap.data() }));
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) run();
    return () => {
      alive = false;
    };
  }, [id]);

  const title = useMemo(() => {
    if (!match) return "Partida";
    const a = match?.teamAName || "Time Azul";
    const b = match?.teamBName || "Time Vermelho";
    return `${a} x ${b}`;
  }, [match]);

  const get = (p, key) => {
    switch (key) {
      case "goals": return p.goals ?? 0;
      case "assists": return p.assists ?? 0;
      case "golContra": return p.golContra ?? 0;
      case "shotsOnTarget": return p.shotsOnTarget ?? 0;
      case "shots": return p.shots ?? 0;
      case "passesCompleted": return p.passesCompleted ?? 0;
      case "passesErrado": return p.passesErrado ?? 0;
      case "tackles": return p.tackles ?? 0;
      case "possessionLost": return p.possessionLost ?? 0;
      case "foulsCommitted": return p.foulsCommitted ?? 0;
      case "foulsSuffered": return p.foulsSuffered ?? 0;
      case "rating": return p.rating ?? 0;
      default: return 0;
    }
  };

  const scoreLine = useMemo(() => {
    if (!match) return "";
    const a = Number(match?.scoreA || 0);
    const b = Number(match?.scoreB || 0);
    return `${a} x ${b}`;
  }, [match]);




  if (loading) {
    return (
      <Page>
        <Top>
          <Title>
            <H1>Carregando…</H1>
            <Sub>Buscando dados da partida</Sub>
          </Title>
          <BackBtn to="/">Voltar</BackBtn>
        </Top>
        <Card>Carregando…</Card>
      </Page>
    );
  }

  if (!match) {
    return (
      <Page>
        <Top>
          <Title>
            <H1>Partida não encontrada</H1>
            <Sub>ID: {id}</Sub>
          </Title>
          <BackBtn to="/">Voltar</BackBtn>
        </Top>
        <Card>Não achei essa partida no banco.</Card>
      </Page>
    );
  }

  const teamLabelA = match?.teamAName || "Time Azul";
  const teamLabelB = match?.teamBName || "Time Vermelho";

  const allPlayers = [
    ...(match.teamA || []).map((p) => ({ ...p, __team: teamLabelA })),
    ...(match.teamB || []).map((p) => ({ ...p, __team: teamLabelB })),
  ];

  return (
    <Page>
      <Top>
        <Title>
          <H1>
            {title} • {scoreLine}
          </H1>
          <Sub>
            {match?.matchDate ? `Data: ${brDate(match.matchDate)}` : ""}
          </Sub>
        </Title>

        <BackBtn to="/">Voltar</BackBtn>
      </Top>

      <Grid>
<PitchCard>
  <PitchField>
    <TeamTag $side="top">
      <TeamPill>{teamLabelB}</TeamPill>
      <TeamPill>Formação automática</TeamPill>
    </TeamTag>

    <TeamTag $side="bottom">
      <TeamPill>{teamLabelA}</TeamPill>
      <TeamPill>Formação automática</TeamPill>
    </TeamTag>

    <PitchLines />

    {/* Time Vermelho em cima */}
{/* Time de CIMA (ex: Vermelho) */}
{renderTeamOnPitch(match.teamB, "top")}

{/* Time de BAIXO (ex: Azul) */}
{renderTeamOnPitch(match.teamA, "bottom")}


  </PitchField>
</PitchCard>


        <StatsCard>
          <Tabs>
            <TabBtn type="button" $active={tab === "geral"} onClick={() => setTab("geral")}>
              Geral
            </TabBtn>
            <TabBtn type="button" $active={tab === "passe"} onClick={() => setTab("passe")}>
              Passe
            </TabBtn>
            <TabBtn type="button" $active={tab === "defesa"} onClick={() => setTab("defesa")}>
              Defesa
            </TabBtn>
            <TabBtn type="button" $active={tab === "disciplina"} onClick={() => setTab("disciplina")}>
              Disciplina
            </TabBtn>
          </Tabs>

          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Jogador</th>
                  <th>Gols</th>
                  <th>Assist.</th>
                  {tab === "geral" ? (
                    <>
                      <th>Chutes no gol</th>
                      <th>Chutes</th>
                      <th>Nota</th>
                    </>
                  ) : null}
                  {tab === "passe" ? (
                    <>
                      <th>Passes certos</th>
                      <th>Passes Errados</th>
                      <th>Nota</th>
                    </>
                  ) : null}
                  {tab === "defesa" ? (
                    <>
                      <th>Desarmes</th>
                      <th>Perda de posse</th>
                      <th>Nota</th>
                    </>
                  ) : null}
                  {tab === "disciplina" ? (
                    <>
                      <th>Faltas cometidas</th>
                      <th>Faltas sofridas</th>
                      <th>Nota</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((p) => (
                  <tr key={`${p.__team}-${p.playerId || p.id}-${p.name}`}>
                    <td style={{ fontWeight: 1000, color: "rgba(42,0,79,0.7)" }}>{p.__team}</td>
                    <td style={{ fontWeight: 1000, color: "#2a004f" }}>{p.name}</td>
                    <td>{p.goals}</td>
                    <td>{p.assists}</td>

                    {tab === "geral" ? (
                      <>
                        <td>{p.shotsOnTarget}</td>
                        <td>{p.shots}</td>
                        <td style={{ fontWeight: 1000 }}>{p.rating ? p.rating.toFixed(2) : "—"}</td>
                      </>
                    ) : null}

                    {tab === "passe" ? (
                      <>
                        <td>{p.passesCompleted}</td>
                        <td>{p.passesErrado}</td>
                        <td style={{ fontWeight: 1000 }}>{p.rating ? p.rating.toFixed(2) : "—"}</td>
                      </>
                    ) : null}

                    {tab === "defesa" ? (
                      <>
                        <td>{p.tackles}</td>
                        <td>{p.dispossessions}</td>
                        <td style={{ fontWeight: 1000 }}>{p.rating ? p.rating.toFixed(2) : "—"}</td>
                      </>
                    ) : null}

                    {tab === "disciplina" ? (
                      <>
                        <td>{p.foulsCommitted}</td>
                        <td>{p.foulsSuffered}</td>
                        <td style={{ fontWeight: 1000 }}>{p.rating ? p.rating.toFixed(2) : "—"}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </StatsCard>
      </Grid>
    </Page>
  );
}
