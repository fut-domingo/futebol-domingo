import styled from "styled-components";

export const Card = styled.section`
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
  overflow: hidden;
`;

/* HEADER */
export const Header = styled.div`
  padding: 16px 14px;
  background: radial-gradient(700px 140px at 50% 0%, rgba(123,97,255,0.18), transparent 60%),
              radial-gradient(700px 180px at 100% 0%, rgba(40,210,255,0.14), transparent 60%);
  border-bottom: 1px solid rgba(240,240,245,0.9);

  display: grid;
  grid-template-columns: 42px 1fr 42px;
  align-items: center;
  gap: 10px;
`;

export const NavBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: rgba(255,255,255,0.92);
  color: #5b2cff;
  font-weight: 1000;
  cursor: pointer;

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

export const HeaderTop = styled.div`
  text-align: center;
`;

export const RoundTitle = styled.div`
  font-weight: 1000;
  color: #2a004f;
  font-size: 18px;
`;

export const DateRange = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: rgba(42,0,79,0.6);
`;

export const HeaderMid = styled.div`
  margin-top: 10px;
  display: grid;
  justify-items: center;
  gap: 10px;
`;

export const VersusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const TeamNameBlue = styled.div`
  font-weight: 1000;
  color: #1d4ed8;
`;

export const TeamNameRed = styled.div`
  font-weight: 1000;
  color: #b91c1c;
`;

export const ScorePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(224,216,255,0.9);
  color: #2a004f;
  font-weight: 1000;

  span { opacity: 0.7; }
`;

export const WinnerBadge = styled.div`
  font-size: 12px;
  font-weight: 1000;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(224,216,255,0.9);

  color: ${({ $type }) => {
    if ($type === "blue") return "#1d4ed8";
    if ($type === "red") return "#b91c1c";
    return "rgba(42,0,79,0.75)";
  }};
`;

/* LISTA DOS TIMES */
export const TeamsCard = styled.div`
  padding: 14px;
`;

export const TeamsGrid = styled.div`
  background: rgba(245,245,255,0.55);
  border: 1px solid rgba(224,216,255,0.7);
  border-radius: 16px;
  padding: 12px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const TeamCol = styled.div`
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(224,216,255,0.7);
  border-radius: 14px;
  padding: 10px;
`;

export const TeamColTitleBlue = styled.div`
  font-weight: 1000;
  color: #1d4ed8;
  text-align: center;
  margin-bottom: 10px;
`;

export const TeamColTitleRed = styled.div`
  font-weight: 1000;
  color: #b91c1c;
  text-align: center;
  margin-bottom: 10px;
`;

/* ✅ Aqui está a correção principal:
   - não usamos grid com 4 colunas
   - avatar + nome + chips
   - nome ganha o máximo de espaço possível */
export const PlayerRow = styled.div`
  // display: ;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(224,216,255,0.7);

  & + & { margin-top: 8px; }
`;

export const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(224,216,255,0.9);
  background: #efeaff;
  display: grid;
  place-items: center;
  font-weight: 1000;
  color: #3a2cff;
  flex: 0 0 34px;
  

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

/* ✅ Nome tem muito mais espaço agora */
export const PlayerName = styled.div`
  font-weight: 1000;
  color: #2a004f;
  flex: 1;
  min-width: 0;              /* ESSENCIAL pro ellipsis funcionar certo */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Chips ficam no final, sem esmagar o nome */
export const Chips = styled.div`
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
`;

export const ChipGoal = styled.div`
  font-size: 11px;
  font-weight: 1000;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.9);
  border: 1px solid rgba(147, 197, 253, 0.9);
  color: #1d4ed8;
`;

export const ChipAssist = styled.div`
  font-size: 11px;
  font-weight: 1000;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(237, 233, 254, 0.92);
  border: 1px solid rgba(196, 181, 253, 0.9);
  color: red;
`;

export const FooterNote = styled.div`
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: rgba(42,0,79,0.6);
`;
