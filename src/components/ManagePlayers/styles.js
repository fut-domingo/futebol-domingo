import styled from "styled-components";

export const Card = styled.div`
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.6);
  padding: 16px;
  margin-bottom: 14px;
`;

export const Title = styled.h2`
  margin: 0 0 12px 0;
  color: #2a004f;
  font-weight: 1000;
  font-size: 18px;
`;

export const Sub = styled.div`
  margin: -6px 0 12px 0;
  font-size: 12px;
  color: rgba(42,0,79,0.6);
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr 140px 160px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: rgba(245,245,255,0.65);
  border: 1px solid rgba(224,216,255,0.7);

  @media (max-width: 900px) {
    grid-template-columns: 56px 1fr;
    grid-auto-rows: auto;
  }
`;

export const Avatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e0d8ff;
  background: #efeaff;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #3a2cff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NameInput = styled.input`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #efe6ff;
  outline: none;
`;

export const FixedBox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2a004f;
  font-weight: 900;
  font-size: 13px;

  input {
    width: 18px;
    height: 18px;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: flex-start;
  }
`;

export const Button = styled.button`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FileInput = styled.input`
  width: 100%;
`;
