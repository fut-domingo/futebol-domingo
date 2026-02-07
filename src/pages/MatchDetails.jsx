import { useEffect, useMemo, useState } from "react";
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

// --- Pitch ---
const PitchRotateWrap = styled.div`
  width: 100%;
  max-width: 520px;         /* ajuste se quiser maior */
  aspect-ratio: 16 / 10;    /* deixa “deitado” */
  border-radius: 20px;
  overflow: hidden;

  /* centraliza */
  display: grid;
  place-items: center;
`;

const PitchRotate = styled.div`
  /* gira o campo */
  transform: rotate(-90deg) scale(1.05);
  transform-origin: center;

  /* como girou, precisamos “trocar” largura/altura internas */
  width: 100%;
  height: 100%;
`;


const PitchWrap = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const Pitch = styled.div`
  position: relative;
  height: 520px;
  background: linear-gradient(180deg, #1f8a4c 0%, #167a40 100%);
  border-radius: 18px;

  @media (max-width: 560px) {
    height: 460px;
  }
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

const PlayerDot = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 60%;

  /* ✅ Como o campo gira -90°, a gente gira o jogador +90° pra ficar “reto” */
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center;
`;


const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 999px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.18);
  flex: 0 0 auto;
`;

const NamePill = styled.div`
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 1000;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px; /* ✅ evita quebrar/estourar */
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

function hasPos(p, key) {
  const arr = Array.isArray(p?.positions) ? p.positions : [];
  return arr.includes(key);
}

function orderForPitch(p) {
  // Prioridade de linhas no campo
  if (hasPos(p, "ZG")) return 0;
  if (hasPos(p, "MC") || hasPos(p, "MEI")) return 1;
  if (hasPos(p, "ATA")) return 2;
  return 3;
}

function makeRows(players) {
  const list = [...(players || [])];
  list.sort((a, b) => orderForPitch(a) - orderForPitch(b));
  const rows = [[], [], [], []];
  for (const p of list) rows[orderForPitch(p)].push(p);
  return rows;
}

function normalizeMatch(m) {
  // Match docs guard: some old matches may not have the new stats.
  const normPlayer = (x) => ({
    ...x,
    goals: Number(x?.goals || 0),
    assists: Number(x?.assists || 0),
    shotsOnTarget: Number(x?.shotsOnTarget || 0),
    shots: Number(x?.shots || 0),
    passesAccurate: Number(x?.passesAccurate || 0),
    passes: Number(x?.passes || 0),
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

  const scoreLine = useMemo(() => {
    if (!match) return "";
    const a = Number(match?.scoreA || 0);
    const b = Number(match?.scoreB || 0);
    return `${a} x ${b}`;
  }, [match]);

  const rowsA = useMemo(() => makeRows(match?.teamA || []), [match?.teamA]);
  const rowsB = useMemo(() => makeRows(match?.teamB || []), [match?.teamB]);

  function renderSide(playersRows, side) {
    // side: "left" (A) or "right" (B)
    const xBase = side === "left" ? 8 : 52;
    const xDir = side === "left" ? 1 : -1;
    const colW = 40; // percentage range inside half
    const lineY = [
      74, // ZG
      52, // MC/MEI
      30, // ATA
      14, // outros
    ];

    return playersRows.flatMap((row, rowIdx) => {
      const n = row.length || 1;
      return row.map((p, i) => {
        const y = lineY[rowIdx] - (n > 1 ? (i - (n - 1) / 2) * 9 : 0);
        const x = xBase + xDir * (colW * (rowIdx / 3));
        const style = {
          left: side === "left" ? `${x}%` : undefined,
          right: side === "right" ? `${100 - x}%` : undefined,
          top: `${y}%`,
          
          justifyContent: side === "left" ? "flex-start" : "flex-end",
          flexDirection: side === "left" ? "row" : "row-reverse",
        };

        return (
          <PlayerDot key={`${side}-${p.playerId || p.id || p.name}-${i}`} style={style}>
            <Avatar>
              {p.photoURL ? (
                <img
                  src={p.photoURL}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </Avatar>
            <NamePill title={p.name}>{p.name}</NamePill>
          </PlayerDot>
        );
      });
    });
  }

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
<PitchRotateWrap>
  <PitchRotate>
    <Pitch>
      <SideLabel style={{ left: 10 }}>{teamLabelA}</SideLabel>
      <SideLabel style={{ right: 10 }}>{teamLabelB}</SideLabel>
      <MidLine />

      {renderSide(rowsA, "left")}
      {renderSide(rowsB, "right")}
    </Pitch>
  </PitchRotate>
</PitchRotateWrap>

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
                      <th>Passes</th>
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
                        <td>{p.passesAccurate}</td>
                        <td>{p.passes}</td>
                        <td style={{ fontWeight: 1000 }}>{p.rating ? p.rating.toFixed(2) : "—"}</td>
                      </>
                    ) : null}

                    {tab === "defesa" ? (
                      <>
                        <td>{p.tackles}</td>
                        <td>{p.possessionLost}</td>
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
