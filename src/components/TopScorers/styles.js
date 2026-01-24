import styled from "styled-components";

export const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
  overflow: hidden;
`;

export const Head = styled.div`
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center; /* ✅ centraliza o título */
  border-bottom: 1px solid rgba(240,240,245,0.9);
`;

export const HeadTitle = styled.h3`
  margin: 0;
  font-size: 28px;
  font-weight: 1000;
  color: #2a004f;
  letter-spacing: -0.5px;
`;

export const List = styled.div`
  padding: 8px 12px 14px 12px;
`;

export const Item = styled.div`
  display: grid;
  grid-template-columns: 26px 46px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-top: 1px solid rgba(240,240,245,0.9);
  border-radius: 14px;

  &:first-child {
    border-top: 0;
  }

  &:hover {
    background: rgba(123,97,255,0.06);
  }
`;

export const Rank = styled.div`
  font-weight: 1000;
  color: rgba(42, 0, 79, 0.6);
  font-size: 13px;
`;

export const Avatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 999px; /* ✅ círculo */
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
    object-fit: cover; /* ✅ não deforma */
    display: block;
  }
`;

export const NameBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const Name = styled.div`
  font-weight: 1000;
  color: #2a004f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Sub = styled.div`
  font-size: 12px;
  color: rgba(42, 0, 79, 0.55);
`;

export const Value = styled.div`
  font-weight: 1000;
  color: #2a004f;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(224,216,255,0.9);
  background: rgba(251,248,255,0.9);
  min-width: 44px;
  text-align: center;
`;
