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

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
`;

export const Label = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: rgba(42,0,79,0.65);
`;

export const Input = styled.input`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #efe6ff;
  outline: none;
`;

export const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0 12px 0;
  color: #2a004f;
  font-weight: 800;

  input {
    width: 18px;
    height: 18px;
  }
`;

export const Button = styled.button`
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #efe6ff;
  background: #fff;
  color: #5b2cff;
  font-weight: 1000;
  cursor: pointer;
`;
