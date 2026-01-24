import styled from "styled-components";
import AddPlayer from "../components/AddPlayer";
import CreateMatch from "../components/CreateMatch";
import { Link } from "react-router-dom";
import ManagePlayers from "../components/ManagePlayers";

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

const Back = styled(Link)`
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
`;

export default function Admin() {
  return (
    <Page>
      <Top>
        <div>
          <Title>Painel Administrativo</Title>
          <Sub>Cadastrar jogadores e lançar partidas</Sub>
        </div>
<Link to="/admin/partidas">Gerenciar Partidas</Link>
        <Back to="/">Voltar</Back>
        <Back to="/sorteio">Sorteio</Back>
      </Top>

      <AddPlayer />
      <ManagePlayers />
      <CreateMatch />
    </Page>
  );
}
