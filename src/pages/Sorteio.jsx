import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { usePlayers } from "../hooks/usePlayers";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const MIN = { ZG: 2, MC: 3, ATA: 2 }; // ✅ regras novas por time

const Page = styled.div`
  padding: 18px;
  min-height: 100vh;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 26px;
  font-weight: 1000;
  color: #2a004f;
`;

const Sub = styled.div`
  font-size: 13px;
  color: rgba(42,0,79,0.65);
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const BtnLink = styled(Link)`
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
  padding: 16px;
  margin-bottom: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlayerRow = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: rgba(245,245,255,0.65);
  border: 1px solid rgba(224,216,255,0.7);
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0d8ff;
  background: #efeaff;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #3a2cff;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Name = styled.div`
  font-weight: 900;
  color: #2a004f;
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
`;

const NameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Tag = styled.span`
  font-size: 11px;
  font-weight: 900;
  color: #5b2cff;
  background: #fbf8ff;
  border: 1px solid #efe6ff;
  padding: 4px 8px;
  border-radius: 999px;
`;

const TagRed = styled(Tag)`
  color: #b91c1c;
  background: rgba(255,255,255,0.9);
  border-color: rgba(255, 203, 203, 0.9);
`;

const Small = styled.div`
  font-size: 12px;
  color: rgba(42,0,79,0.65);
  margin-top: 6px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
  cursor: pointer;
`;

const TeamsWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const TeamCard = styled.div`
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
  padding: 16px;
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`;

const TeamTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 1000;
  color: #2a004f;
`;

const TeamScore = styled.div`
  font-size: 12px;
  color: rgba(42,0,79,0.65);
  font-weight: 900;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TeamItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(245,245,255,0.65);
  border: 1px solid rgba(224,216,255,0.7);
`;

const Inline = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  border: 1px solid #efe6ff;
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.9);
  font-weight: 900;
  color: #2a004f;
`;

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * ✅ FORÇA: somente pontos, gols e assistências
 * (sem CRAQUE, sem FIXO)
 * pesos ajustáveis:
 */
function power(p) {
  const pts = Number(p.points ?? 0);
  const g = Number(p.goals ?? 0);
  const a = Number(p.assists ?? 0);

  // você pode mexer nos pesos se quiser:
  return pts * 3 + g * 2 + a * 1;
}

function hasPos(p, pos) {
  const arr = Array.isArray(p.positions) ? p.positions : [];
  return arr.includes(pos);
}

function countPos(list) {
  return {
    ZG: list.filter(p => hasPos(p, "ZG")).length,
    MC: list.filter(p => hasPos(p, "MC")).length,
    ATA: list.filter(p => hasPos(p, "ATA")).length,
  };
}

function meetsMinPos(team) {
  const c = countPos(team);
  return c.ZG >= MIN.ZG && c.MC >= MIN.MC && c.ATA >= MIN.ATA;
}

function countStars(team) {
  return team.filter(p => Boolean(p.isStar)).length;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sumPower(team) {
  return Math.round(team.reduce((s, p) => s + power(p), 0));
}

async function saveScheduledMatch(matchDate, teamAzul, teamVermelho) {
  if (!matchDate) {
    alert("Escolha a data da partida.");
    return;
  }
  if (teamAzul.length !== 8 || teamVermelho.length !== 8) {
    alert(`Precisa ser 8 x 8. Azul: ${teamAzul.length} | Vermelho: ${teamVermelho.length}`);
    return;
  }

  await addDoc(collection(db, "matches"), {
    status: "scheduled",
    matchDate,
    createdAt: serverTimestamp(),
    processedAt: null, // quando finalizar

    teamAName: "Time Azul",
    teamBName: "Time Vermelho",

    scoreA: null,
    scoreB: null,

    teamA: teamAzul.map(p => ({
      playerId: p.id,
      name: p.name,
      photoURL: p.photoURL || "",
      goals: 0,
      assists: 0
    })),
    teamB: teamVermelho.map(p => ({
      playerId: p.id,
      name: p.name,
      photoURL: p.photoURL || "",
      goals: 0,
      assists: 0
    })),
  });

  alert("Sorteio salvo como partida agendada! Depois é só abrir e lançar gols/assist.");
}

export default function Sorteio() {
  const players = usePlayers();

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")
    );
  }, [players]);

  // selecionados: por padrão, marca FIXOS
  const [selected, setSelected] = useState({});
  // ✅ “separados” por jogador (regra: não cair no mesmo time)
  const [separated, setSeparated] = useState({});

  const [teams, setTeams] = useState(null);

  const [matchDate, setMatchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  // inicializa seleção quando carregar jogadores
  useEffect(() => {
    if (sortedPlayers.length === 0) return;

    setSelected((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const init = {};
      sortedPlayers.forEach((p) => { init[p.id] = Boolean(p.isFixed); });
      return init;
    });
  }, [sortedPlayers]);

  const selectedPlayers = useMemo(() => {
    return sortedPlayers.filter((p) => selected[p.id]);
  }, [sortedPlayers, selected]);

  const separatedSelected = useMemo(() => {
    return selectedPlayers.filter((p) => separated[p.id]);
  }, [selectedPlayers, separated]);

  function toggleSelect(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSeparated(id) {
    setSeparated((prev) => {
      const next = { ...prev, [id]: !prev[id] };

      // ✅ limita: “não cair no mesmo time” só é possível com até 2 marcados
      const ids = selectedPlayers
        .filter(p => next[p.id])
        .map(p => p.id);

      if (ids.length > 2) {
        alert("A regra 'Separados' (não cair no mesmo time) só permite marcar no máximo 2 jogadores.");
        return prev;
      }
      return next;
    });
  }

  function selectAll() {
    const m = {};
    sortedPlayers.forEach((p) => (m[p.id] = true));
    setSelected(m);
  }

  function selectOnlyFixed() {
    const m = {};
    sortedPlayers.forEach((p) => (m[p.id] = Boolean(p.isFixed)));
    setSelected(m);
  }

  function clearAll() {
    const m = {};
    sortedPlayers.forEach((p) => (m[p.id] = false));
    setSelected(m);
    setSeparated({});
    setTeams(null);
  }

  function validateTotals(list) {
    const total = countPos(list);
    if (total.ZG < MIN.ZG * 2 || total.MC < MIN.MC * 2 || total.ATA < MIN.ATA * 2) {
      return `Impossível cumprir posições.\nSelecionados: ZG=${total.ZG}, MC=${total.MC}, ATA=${total.ATA}\nPrecisa no mínimo: ZG=${MIN.ZG*2}, MC=${MIN.MC*2}, ATA=${MIN.ATA*2}`;
    }
    return null;
  }

  function generateTeams() {
    const list = [...selectedPlayers];

    if (list.length !== 16) {
      alert(`Selecione exatamente 16 jogadores para gerar 8 x 8.\nAtualmente: ${list.length}`);
      return;
    }

    const totalsErr = validateTotals(list);
    if (totalsErr) {
      alert(totalsErr);
      return;
    }

    // ✅ Regra “Separados” (até 2)
    if (separatedSelected.length > 2) {
      alert("A regra 'Separados' permite no máximo 2 jogadores marcados.");
      return;
    }

    // ✅ Monte Carlo: tenta muitas combinações e escolhe a melhor
    const starsTotal = list.filter(p => Boolean(p.isStar)).length;

    const MAX_TRIES = 6000;
    let best = null;
    let bestScore = Infinity;

    const sepIds = separatedSelected.map(p => p.id);

    for (let t = 0; t < MAX_TRIES; t++) {
      const sh = shuffle(list);
      const teamAzul = sh.slice(0, 8);
      const teamVermelho = sh.slice(8, 16);

      // ✅ regras duras de posição
      if (!meetsMinPos(teamAzul) || !meetsMinPos(teamVermelho)) continue;

      // ✅ CRAQUES separados: diferença <= 1 e se for par, igual
      const sA = countStars(teamAzul);
      const sB = countStars(teamVermelho);
      const diffStars = Math.abs(sA - sB);
      if (diffStars > 1) continue;
      if (starsTotal % 2 === 0 && sA !== sB) continue;

      // ✅ Separados: se 2 marcados, não podem ficar juntos
      if (sepIds.length === 2) {
        const inAzul = teamAzul.some(p => p.id === sepIds[0]) && teamAzul.some(p => p.id === sepIds[1]);
        const inVerm = teamVermelho.some(p => p.id === sepIds[0]) && teamVermelho.some(p => p.id === sepIds[1]);
        if (inAzul || inVerm) continue;
      }

      // ✅ balanceamento por força (pontos/gols/assist)
      const fa = sumPower(teamAzul);
      const fb = sumPower(teamVermelho);
      const diffForce = Math.abs(fa - fb);

      // ✅ balanceamento extra de posições (além do mínimo)
      const ca = countPos(teamAzul);
      const cb = countPos(teamVermelho);

      const diffPos =
        Math.abs(ca.ZG - cb.ZG) * 40 +
        Math.abs(ca.MC - cb.MC) * 25 +
        Math.abs(ca.ATA - cb.ATA) * 25;

      // ✅ score final (quanto menor melhor)
      const score = diffForce * 10 + diffPos;

      if (score < bestScore) {
        bestScore = score;
        best = {
          azul: teamAzul,
          vermelho: teamVermelho,
          fa,
          fb,
          ca,
          cb,
          sA,
          sB,
          diffForce,
        };

        // perfeito o bastante
        if (diffForce <= 1 && diffPos === 0) break;
      }
    }

    if (!best) {
      alert("Não encontrei times que cumpram as regras. Tente mudar os selecionados (posições/craques) ou desmarcar 'Separados'.");
      return;
    }

    setTeams(best);
  }

  return (
    <Page>
      <Top>
        <div>
          <Title>Sorteio</Title>
          <Sub>
            Regras: 8x8 • por time ≥ {MIN.ZG} ZG, ≥ {MIN.MC} MC, ≥ {MIN.ATA} ATA • CRAQUES separados • “Separados” não caem no mesmo time.
          </Sub>
        </div>

        <Buttons>
          <BtnLink to="/">Home</BtnLink>
          <BtnLink to="/admin">Admin</BtnLink>
        </Buttons>
      </Top>

      <Grid>
        <Card>
          <h2 style={{ margin: 0, color: "#2a004f", fontWeight: 1000, fontSize: 18 }}>
            Selecionar Jogadores
          </h2>
          <Small>
            Dica: FIXO já vem marcado. <b>CRAQUE</b> será distribuído entre os times. <b>Separados</b> (no máximo 2) não caem no mesmo time.
          </Small>

          <Actions style={{ margin: "12px 0" }}>
            <Button type="button" onClick={selectOnlyFixed}>Só FIXOS</Button>
            <Button type="button" onClick={selectAll}>Selecionar todos</Button>
            <Button type="button" onClick={clearAll}>Limpar</Button>
            <Button type="button" onClick={generateTeams}>Gerar times</Button>
          </Actions>

          <Small style={{ marginBottom: 10 }}>
            Selecionados: <b>{selectedPlayers.length}</b>/16 • Separados: <b>{separatedSelected.length}</b>/2 • Craques selecionados: <b>{selectedPlayers.filter(p => p.isStar).length}</b>
          </Small>

          <List>
            {sortedPlayers.map((p) => {
              const isOn = Boolean(selected[p.id]);
              const sepOn = Boolean(separated[p.id]) && isOn; // só faz sentido se estiver selecionado

              return (
                <PlayerRow key={p.id}>
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggleSelect(p.id)}
                    style={{ width: 18, height: 18 }}
                  />

                  <div>
                    <Name>
                      <Avatar>
                        {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
                      </Avatar>

                      <NameText>{p.name}</NameText>

                      {p.isFixed ? <Tag>FIXO</Tag> : null}
                      {p.isStar ? <Tag>CRAQUE</Tag> : null}
                      {sepOn ? <TagRed>SEPARADO</TagRed> : null}
                    </Name>

                    <Small>
                      Pos: {(Array.isArray(p.positions) && p.positions.length > 0) ? p.positions.join(", ") : "—"} •
                      Força: <b>{power(p)}</b> (Pts/G/A)
                    </Small>
                  </div>

                  <Inline>
                    {/* ✅ checkbox "Separados" */}
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 1000, color: "#2a004f" }}>
                      <input
                        type="checkbox"
                        checked={sepOn}
                        disabled={!isOn} // só permite separar quem está selecionado
                        onChange={() => toggleSeparated(p.id)}
                      />
                      Separados
                    </label>

                    <div style={{ fontWeight: 900, color: "#2a004f", fontSize: 12, minWidth: 72, textAlign: "right" }}>
                      Pts: {p.points ?? 0}
                    </div>
                  </Inline>
                </PlayerRow>
              );
            })}
          </List>
        </Card>

        <div>
          {!teams ? (
            <TeamCard>
              <TeamHeader>
                <TeamTitle>Times</TeamTitle>
                <TeamScore>—</TeamScore>
              </TeamHeader>
              <Small>
                Clique em <b>Gerar times</b>. O algoritmo garante:
                <br />• por time: <b>≥ {MIN.ZG} ZG</b>, <b>≥ {MIN.MC} MC</b>, <b>≥ {MIN.ATA} ATA</b>
                <br />• <b>CRAQUES separados</b> (diferença no máximo 1)
                <br />• equilibrar por <b>força</b> (somente pontos/gols/assist)
                <br />• se marcar <b>Separados</b>, eles não caem no mesmo time (máx. 2)
              </Small>
            </TeamCard>
          ) : (
            <>
              <TeamCard style={{ marginBottom: 14 }}>
                <TeamHeader>
                  <TeamTitle>Salvar sorteio</TeamTitle>
                  <TeamScore>Dif. força: {teams.diffForce}</TeamScore>
                </TeamHeader>

                <Inline>
                  <div style={{ fontWeight: 1000, color: "#2a004f" }}>Data:</div>
                  <DateInput type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                  <Button
                    type="button"
                    onClick={() => saveScheduledMatch(matchDate, teams.azul, teams.vermelho)}
                  >
                    Salvar como partida agendada
                  </Button>
                </Inline>

                <Small style={{ marginTop: 10 }}>
                  Depois do jogo: abra a partida agendada no Admin e lance gols/assistências para “transformar” em partida jogada.
                </Small>
              </TeamCard>

              <TeamsWrap>
                <TeamCard>
                  <TeamHeader>
                    <TeamTitle>Time Azul</TeamTitle>
                    <TeamScore>
                      Força total: {teams.fa} • Craques: {teams.sA} • Pos: ZG {teams.ca.ZG} / MC {teams.ca.MC} / ATA {teams.ca.ATA}
                    </TeamScore>
                  </TeamHeader>

                  <TeamList>
                    {teams.azul.map((p) => (
                      <TeamItem key={p.id}>
                        <Avatar>
                          {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
                        </Avatar>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <div style={{ fontWeight: 1000, color: "#2a004f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name} {p.isStar ? "⭐" : ""}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(42,0,79,0.65)" }}>
                            Pos: {(Array.isArray(p.positions) && p.positions.length > 0) ? p.positions.join(", ") : "—"} • Pts: {p.points ?? 0}
                          </div>
                        </div>

                        <div style={{ marginLeft: "auto", fontWeight: 1000, color: "#2a004f", fontSize: 12 }}>
                          Força {power(p)}
                        </div>
                      </TeamItem>
                    ))}
                  </TeamList>
                </TeamCard>

                <TeamCard>
                  <TeamHeader>
                    <TeamTitle>Time Vermelho</TeamTitle>
                    <TeamScore>
                      Força total: {teams.fb} • Craques: {teams.sB} • Pos: ZG {teams.cb.ZG} / MC {teams.cb.MC} / ATA {teams.cb.ATA}
                    </TeamScore>
                  </TeamHeader>

                  <TeamList>
                    {teams.vermelho.map((p) => (
                      <TeamItem key={p.id}>
                        <Avatar>
                          {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
                        </Avatar>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <div style={{ fontWeight: 1000, color: "#2a004f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name} {p.isStar ? "⭐" : ""}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(42,0,79,0.65)" }}>
                            Pos: {(Array.isArray(p.positions) && p.positions.length > 0) ? p.positions.join(", ") : "—"} • Pts: {p.points ?? 0}
                          </div>
                        </div>

                        <div style={{ marginLeft: "auto", fontWeight: 1000, color: "#2a004f", fontSize: 12 }}>
                          Força {power(p)}
                        </div>
                      </TeamItem>
                    ))}
                  </TeamList>
                </TeamCard>
              </TeamsWrap>
            </>
          )}
        </div>
      </Grid>
    </Page>
  );
}
