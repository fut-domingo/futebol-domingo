import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Card, Title, Row, Input, Button, Label, CheckRow } from "./styles";

export default function AddPlayer() {
  const [name, setName] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [isStar, setIsStar] = useState(false);
  const [positions, setPositions] = useState([]);

  function togglePosition(pos) {
  setPositions((prev) =>
    prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
  );
}


  async function handleAddPlayer(e) {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(collection(db, "players"), {
      name: name.trim(),
      isStar,
      positions,
      isFixed,
      photoURL: photoURL.trim(), // ✅ agora é URL
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      goals: 0,
      assists: 0,
      games: 0,
      form: []
    });

    setName("");
    setIsFixed(false);
    setIsStar(false);
    setPositions([]);
    setPhotoURL("");
    alert("Jogador cadastrado!");
  }

  return (
    <Card>
      <Title>Adicionar Jogador</Title>

      <form onSubmit={handleAddPlayer}>
        <Row>
          <Label>Nome</Label>
          <Input
            placeholder="Nome do jogador"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Row>

        <CheckRow>
          <input
            id="fixed"
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
          />
          <label htmlFor="fixed">FIXO (cadeira cativa)</label>
        </CheckRow>

        <Row>
          <Label>Foto URL (opcional)</Label>
          <Input
            placeholder="Cole aqui o link da foto (https://...)"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </Row>

        <CheckRow>
  <input
    id="star"
    type="checkbox"
    checked={isStar}
    onChange={(e) => setIsStar(e.target.checked)}
  />
  <label htmlFor="star">CRAQUE</label>
</CheckRow>

      <Row>
        <Label>Posições</Label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["ZG", "MC", "ATA"].map((pos) => (
            <label key={pos} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 800, color: "#2a004f" }}>
              <input
                type="checkbox"
                checked={positions.includes(pos)}
                onChange={() => togglePosition(pos)}
              />
              {pos}
            </label>
          ))}
        </div>
      </Row>


        <Button type="submit">Adicionar</Button>
      </form>
    </Card>
  );
}
