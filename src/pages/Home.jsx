import styled from "styled-components";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Classification from "../components/Classification";
import Matches from "../components/Matches";
import TopScorers from "../components/TopScorers";
import AuthButtons from "../components/AuthButtons";

import MvpModal from "../components/MvpModal";
import { useMatches } from "../hooks/useMatches";

const Page = styled.div`
  padding: 18px;
  background: #f6f6fb;
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const AdminBtn = styled(Link)`
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #ffffff;
  color: #5b2cff;
  font-weight: 900;
`;

const Hero = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 14px;

  @media (max-width: 980px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeroTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 1000;
  color: #2a004f;
  letter-spacing: -0.4px;
`;

const Sub = styled.div`
  font-size: 13px;
  color: rgba(42, 0, 79, 0.65);
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 18px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const BottomGrid = styled.div`
  margin-top: 18px;
`;

/** ✅ MVP Modal: aparece uma vez por partida nova */
const STORAGE_KEY = "lastSeenMvpMatchId";

function matchSortKey(m) {
  if (m?.matchDate) return new Date(m.matchDate + "T12:00:00").getTime();
  if (m?.createdAt?.seconds) return m.createdAt.seconds * 1000;
  if (m?.createdAt) return new Date(m.createdAt).getTime();
  return 0;
}

export default function Home() {
  const matches = useMatches();

  // pega a última partida JOGADA (played / processedAt)
  const latestPlayed = useMemo(() => {
    const played = (matches ?? []).filter((m) => m.status === "played" || m.processedAt);
    played.sort((a, b) => matchSortKey(a) - matchSortKey(b));
    return played[played.length - 1] || null;
  }, [matches]);

  const [mvpOpen, setMvpOpen] = useState(false);

  useEffect(() => {
    if (!latestPlayed?.id) return;
    if (!latestPlayed?.mvp) return;

    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== latestPlayed.id) setMvpOpen(true);
  }, [latestPlayed?.id, latestPlayed?.mvp]);

  function closeMvp() {
    if (latestPlayed?.id) localStorage.setItem(STORAGE_KEY, latestPlayed.id);
    setMvpOpen(false);
  }

  return (
    <Page>
      {/* ✅ Modal MVP */}
      <MvpModal
        open={mvpOpen}
        mvp={latestPlayed?.mvp}
        matchLabel={
          latestPlayed?.matchDate
            ? `Partida de ${latestPlayed.matchDate.split("-").reverse().join("/")}`
            : "Última partida"
        }
        onClose={closeMvp}
      />

      <Hero>
        <HeroTitle>
          <H1>Futebol de Domingo</H1>
          <Sub>Classificação, partidas, gols e assistências</Sub>
        </HeroTitle>

        <TopBar>
          <AdminBtn to="/admin">Painel Admin</AdminBtn>
          <AdminBtn to="/sorteio">Sorteio</AdminBtn>
          <AuthButtons />
        </TopBar>
      </Hero>

      <TopGrid>
        <Classification />
        <Matches />
      </TopGrid>

      <BottomGrid>
        <TopScorers />
      </BottomGrid>
    </Page>
  );
}
