import styled from "styled-components";

export const Wrapper = styled.section`
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
`;


export const Header = styled.div`
  padding: 22px 20px;
  background: linear-gradient(90deg, #7b61ff 0%, #43d3ff 100%);
  color: #fff;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

export const Filters = styled.div`
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid #eee;
`;

export const Pill = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e5d8ff;
  background: #fbf8ff;
  color: #5b2cff;
  border-radius: 999px;
  font-size: 13px;
  user-select: none;
`;

export const TableWrap = styled.div`
  overflow: auto;
  border-radius: 18px;

  /* ✅ limita altura pra mostrar mais ou menos ~10 linhas */
  max-height: 1085px;

  /* deixa o scroll mais suave no mobile */
  -webkit-overflow-scrolling: touch;

  /* opcional: barra mais discreta */
  scrollbar-width: thin;
`;


export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  /* ✅ isso faz as larguras ($w) serem respeitadas */
  table-layout: fixed;

  /* pode manter, mas se quiser reduzir o "tamanho mínimo" da tabela: */
  min-width: 680px;
`;

export const Th = styled.th`
  /* ✅ agora o $w funciona */
  width: ${(p) => p.$w || "auto"};
  max-width: ${(p) => p.$w || "none"};
  text-align: ${(p) => p.$align || "left"};

  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(6px);

  padding: 10px 12px;
  font-size: 11px;
  font-weight: 800;
  color: #7a7a7a;
  white-space: nowrap;

  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eee;
`;

export const Td = styled.td`
  /* ✅ agora o $w funciona */
  width: ${(p) => p.$w || "auto"};
  max-width: ${(p) => p.$w || "none"};
  text-align: ${(p) => p.$align || "left"};

  padding: 10px 12px;
  border-bottom: 1px solid #f2f2f2;
  font-size: 15px;
  white-space: nowrap;
`;



export const Row = styled.tr`
  transition: 0.15s ease;

  &:hover {
    background: rgba(123, 97, 255, 0.06);
  }
`;




export const Pos = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 1000;
  color: #2b2b2b;
  background: #f2f2ff;
  border: 1px solid rgba(224,216,255,0.7);
`;


export const PlayerCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* ✅ importantíssimo pra não "empurrar" a tabela */
  min-width: 0;
  width: 100%;
`;



export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #e0d8ff;
  background: #efeaff;
  display: grid;
  place-items: center;
  font-weight: 1000;
  color: #3a2cff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;


export const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const PlayerName = styled.div`
  font-weight: 1000;
  color: #2a004f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


export const Badges = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  font-size: 11px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #efe6ff;
  background: #fbf8ff;
  color: #5b2cff;
`;


export const Pts = styled.span`
  font-weight: 1000;
  color: #2b2b2b;
`;

export const Form = styled.div`
  display: flex;
  gap: 6px;
`;

export const Bubble = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  background: ${(p) =>
    p.value === "W" ? "#18a34a" : p.value === "D" ? "#9ca3af" : "#ef4444"};
`;

export const PosWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Arrow = styled.span`
  font-weight: 1000;
  font-size: 12px;
  color: ${(p) => (p.dir === "up" ? "#16a34a" : "#ef4444")};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

