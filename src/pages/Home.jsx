import styled from "styled-components";
import { Link } from "react-router-dom";
import Classification from "../components/Classification";
import Matches from "../components/Matches";
import TopScorers from "../components/TopScorers";
import AuthButtons from "../components/AuthButtons";
import { useAuth } from "../hooks/useAuth";

const Page = styled.div`
  padding: 18px;
  background: #f6f6fb;
  min-height: 100vh;

  @media (max-width: 520px) {
    padding: 14px;
  }
`;

const Hero = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 14px;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
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

  @media (max-width: 520px) {
    font-size: 32px;
    line-height: 1.05;
  }
`;

const Sub = styled.div`
  font-size: 13px;
  color: rgba(42, 0, 79, 0.65);
  font-weight: 700;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    justify-content: flex-start;
    gap: 10px;
  }
`;

const PillBtn = styled(Link)`
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #ffffff;
  color: #5b2cff;
  font-weight: 900;
  white-space: nowrap;
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 8px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const BottomGrid = styled.div`
  margin-top: 18px;
`;



const ADMIN_EMAILS = ["bolinhafutebol@gmail.com"]; // <- coloque o seu aqui (pode ter mais de 1)

export default function Home() {
  const { user } = useAuth();
  
  const isAdmin = user?.email === "SEU_EMAIL@gmail.com";

  return (
    <Page>
      <Hero>
        <HeroTitle>
          <H1>Futebol de Domingo</H1>
          <Sub>Classificação, partidas, gols e assistências</Sub>
        </HeroTitle>

        <TopBar>
          {isAdmin && <AdminBtn to="/admin">Painel Admin</AdminBtn>}
          <PillBtn to="/sorteio">Sorteio</PillBtn>
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
