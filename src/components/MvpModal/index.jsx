import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 10, 40, 0.55);
  display: grid;
  place-items: center;
  z-index: 9999;
`;

const Box = styled.div`
  width: min(520px, calc(100vw - 28px));
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(224,216,255,0.9);
  border-radius: 20px;
  box-shadow: 0 22px 80px rgba(0,0,0,0.22);
  padding: 18px;
`;

const Title = styled.div`
  font-weight: 1000;
  color: #2a004f;
  font-size: 18px;
`;

const Sub = styled.div`
  margin-top: 4px;
  color: rgba(42,0,79,0.65);
  font-size: 12px;
  font-weight: 800;
`;

const Row = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 14px;
  align-items: center;
`;

const Photo = styled.div`
  width: 74px;
  height: 74px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(224,216,255,0.9);
  background: #efeaff;
  display: grid;
  place-items: center;
  font-weight: 1000;
  color: #3a2cff;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Name = styled.div`
  font-weight: 1000;
  color: #2a004f;
  font-size: 18px;
`;

const Chips = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.div`
  font-size: 12px;
  font-weight: 1000;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(245,245,255,0.9);
  border: 1px solid rgba(224,216,255,0.9);
  color: #2a004f;
`;

const BtnRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const Btn = styled.button`
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
  cursor: pointer;
`;

function initials(name="") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function MvpModal({ open, mvp, onClose, matchLabel }) {
  if (!open || !mvp) return null;

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <Title>🏅 Melhor do Jogo</Title>
        <Sub>{matchLabel || "Destaque da última partida"}</Sub>

        <Row>
          <Photo>
            {mvp.photoURL ? <img src={mvp.photoURL} alt={mvp.name} /> : initials(mvp.name)}
          </Photo>

          <div>
            <Name>{mvp.name}</Name>
            <Chips>
              <Chip>⚽ Gols: {mvp.goals}</Chip>
              <Chip>🅰️ Assist: {mvp.assists}</Chip>
              <Chip>⭐ Pontuação: {mvp.mvpScore}</Chip>
            </Chips>
          </div>
        </Row>

        <BtnRow>
          <Btn onClick={onClose}>Entendi</Btn>
        </BtnRow>
      </Box>
    </Overlay>
  );
}
