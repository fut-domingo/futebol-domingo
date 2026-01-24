import { useEffect, useMemo, useState } from "react";
import { useMatches } from "../../hooks/useMatches";
import {
  Card,
  Header,
  NavBtn,
  HeaderTop,
  HeaderMid,
  RoundTitle,
  DateRange,
  VersusRow,
  TeamNameBlue,
  TeamNameRed,
  ScorePill,
  WinnerBadge,
  TeamsCard,
  TeamsGrid,
  TeamCol,
  TeamColTitleBlue,
  TeamColTitleRed,
  PlayerRow,
  Avatar,
  PlayerName,
  Chips,
  ChipGoal,
  ChipAssist,
  FooterNote,
} from "./styles";

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function fmtDateBR(d) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getWeekRangeISO(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T12:00:00");
  const start = new Date(d);
  const end = new Date(d);
  end.setDate(end.getDate() + 2); // Sáb -> Seg
  return { start, end };
}

function formatDateFallback(m) {
  if (m?.matchDate) return m.matchDate.split("-").reverse().join("/");
  if (!m?.createdAt) return "—";
  const d = m.createdAt?.seconds
    ? new Date(m.createdAt.seconds * 1000)
    : new Date(m.createdAt);
  return d.toLocaleDateString("pt-BR");
}

function sortKey(m) {
  if (m?.matchDate) return new Date(m.matchDate + "T12:00:00").getTime();
  if (m?.createdAt?.seconds) return m.createdAt.seconds * 1000;
  if (m?.createdAt) return new Date(m.createdAt).getTime();
  return 0;
}

export default function Matches() {
  const rawMatches = useMatches();

  // mais antigo -> mais novo
  const matches = useMemo(() => {
    return [...rawMatches].sort((a, b) => sortKey(a) - sortKey(b));
  }, [rawMatches]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (matches.length > 0) setIdx(matches.length - 1);
  }, [matches.length]);

  const current = matches[idx];
  const range = current?.matchDate ? getWeekRangeISO(current.matchDate) : null;

  const a = current?.scoreA ?? 0;
  const b = current?.scoreB ?? 0;

  const winner =
    !current ? "none" : a === b ? "draw" : a > b ? "blue" : "red";

  const winnerText =
    winner === "draw"
      ? "Empate"
      : winner === "blue"
      ? "Time Azul venceu"
      : winner === "red"
      ? "Time Vermelho venceu"
      : "";

  function prev() {
    setIdx((v) => Math.max(v - 1, 0));
  }
  function next() {
    setIdx((v) => Math.min(v + 1, Math.max(matches.length - 1, 0)));
  }

  return (
    <Card>
      {!current ? (
        <div style={{ padding: 16, color: "#6b7280" }}>Sem partidas ainda.</div>
      ) : (
        <>
          {/* ✅ Cabeçalho (mantém o lindo) */}
          <Header>
            <NavBtn onClick={prev} disabled={idx <= 0} aria-label="Rodada anterior">
              {"<"}
            </NavBtn>

            <HeaderTop>
              <RoundTitle>Rodada {idx + 1}</RoundTitle>

              <DateRange>
                {range
                  ? `${fmtDateBR(range.start)} a ${fmtDateBR(range.end)}`
                  : formatDateFallback(current)}
              </DateRange>

              <HeaderMid>
                <VersusRow>
                  <TeamNameBlue>Time Azul</TeamNameBlue>
                  <ScorePill>
                    <strong>{a}</strong>
                    <span>×</span>
                    <strong>{b}</strong>
                  </ScorePill>
                  <TeamNameRed>Time Vermelho</TeamNameRed>
                </VersusRow>

                <WinnerBadge $type={winner}>🏆 {winnerText}</WinnerBadge>
              </HeaderMid>
            </HeaderTop>

            <NavBtn
              onClick={next}
              disabled={idx >= matches.length - 1}
              aria-label="Próxima rodada"
            >
              {">"}
            </NavBtn>
          </Header>

          {/* ✅ Sem "◆ Times" */}
          <TeamsCard>
            <TeamsGrid>
              {/* Time Azul */}
              <TeamCol>
                <TeamColTitleBlue>Time Azul</TeamColTitleBlue>

                {(current.teamA ?? []).map((p, i) => (
                  <PlayerRow key={p.playerId ?? i}>
                    <Avatar>
                      {p.photoURL ? (
                        <img src={p.photoURL} alt={p.name} />
                      ) : (
                        initials(p.name)
                      )}
                    </Avatar>

                    {/* ✅ Nome com muito mais espaço */}
                    <PlayerName title={p.name}>{p.name}</PlayerName>

                    {/* ✅ Chips claros (gol/assist diferentes) */}
                    <Chips>
                      {p.goals ? <ChipGoal>⚽ {p.goals}</ChipGoal> : null}
                      {p.assists ? <ChipAssist> 🅰️ {p.assists}</ChipAssist> : null}
                    </Chips>
                  </PlayerRow>
                ))}
              </TeamCol>

              {/* Time Vermelho */}
              <TeamCol>
                <TeamColTitleRed>Time Vermelho</TeamColTitleRed>

                {(current.teamB ?? []).map((p, i) => (
                  <PlayerRow key={p.playerId ?? i}>
                    <Avatar>
                      {p.photoURL ? (
                        <img src={p.photoURL} alt={p.name} />
                      ) : (
                        initials(p.name)
                      )}
                    </Avatar>

                    <PlayerName title={p.name}>{p.name}</PlayerName>

                    <Chips>
                      {p.goals ? <ChipGoal>⚽ {p.goals}</ChipGoal> : null}
                      {p.assists ? <ChipAssist>🅰️ {p.assists}</ChipAssist> : null}
                    </Chips>
                  </PlayerRow>
                ))}
              </TeamCol>
            </TeamsGrid>

            <FooterNote>
              Partida {idx + 1} de {matches.length}
            </FooterNote>
          </TeamsCard>
        </>
      )}
    </Card>
  );
}
