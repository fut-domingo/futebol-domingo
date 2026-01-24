import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { usePlayers } from "../../hooks/usePlayers";
import {
  Card, Title, Sub, List, Row, Avatar, NameInput,
  FixedBox, Actions, Button, FileInput
} from "./styles";

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function ManagePlayers() {
  const players = usePlayers();

  const playersSorted = useMemo(() => {
    return [...players].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")
    );
  }, [players]);

  const [draft, setDraft] = useState({});
  const [loadingId, setLoadingId] = useState(null);

 function getDraft(p) {
  const base = {
    name: p.name ?? "",
    isFixed: Boolean(p.isFixed),
    isStar: Boolean(p.isStar),                 // ✅
    positions: Array.isArray(p.positions) ? p.positions : [], // ✅
    photoURL: p.photoURL ?? "",
  };

  return { ...base, ...(draft[p.id] ?? {}) };
}

  function togglePosition(id, pos) {
  setDraft((prev) => {
    const current = prev[id] ?? {};
    const currentPositions = Array.isArray(current.positions)
      ? current.positions
      : [];

    const next = currentPositions.includes(pos)
      ? currentPositions.filter((p) => p !== pos)
      : [...currentPositions, pos];

    return {
      ...prev,
      [id]: { ...current, positions: next },
    };
  });
}


  function setField(id, field, value) {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [field]: value },
    }));
  }

  async function handleSave(p) {
  const d = getDraft(p); // <- agora vem mesclado (sempre tem name)
  const newName = (d.name ?? "").trim();
  if (!newName) return alert("Nome não pode ficar vazio.");

  const photoURL = (d.photoURL ?? "").trim();

  try {
    setLoadingId(p.id);

    await updateDoc(doc(db, "players", p.id), {
      name: newName,
      isFixed: Boolean(d.isFixed),
      isStar: Boolean(d.isStar),
positions: Array.isArray(d.positions) ? d.positions : [],
      photoURL,
    });

    setDraft((prev) => {
      const copy = { ...prev };
      delete copy[p.id];
      return copy;
    });

    alert("Jogador atualizado!");
  } catch (e) {
    console.error(e);
    alert("Erro ao salvar jogador. Veja o console.");
  } finally {
    setLoadingId(null);
  }
}


  return (
    <Card>
      <Title>Gerenciar Jogadores</Title>
      <Sub>Edite nome, marque FIXO e envie foto para jogadores antigos.</Sub>

      <List>
        {playersSorted.map((p) => {
          const d = getDraft(p);
          const busy = loadingId === p.id;

          return (
            <Row key={p.id}>
              <Avatar>
                {p.photoURL ? (
                  <img
                    src={p.photoURL}
                    alt={p.name}
                    onLoad={() => console.log("Imagem OK:", p.name)}
                    onError={() => console.log("Imagem ERRO:", p.name, p.photoURL)}
                  />
        ) : (
  initials(p.name)
  )}

              </Avatar>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <NameInput
                  value={d.name ?? ""}   // <- importante
                  onChange={(e) => setField(p.id, "name", e.target.value)}
                />


                <NameInput
                  value={d.photoURL ?? ""}  // <- importante
                  onChange={(e) => setField(p.id, "photoURL", e.target.value)}
                  placeholder="Foto URL (https://...)"
                />


              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["ZG", "MC", "ATA"].map((pos) => (
                <label key={pos} style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 800, color: "#2a004f" }}>
                <input
                  type="checkbox"
                checked={(d.positions ?? []).includes(pos)}
              onChange={() => togglePosition(p.id, pos)}
               />
              {pos}
              </label>
              ))}
              </div>


              <FixedBox>
                <input
                  type="checkbox"
                  checked={!!d.isFixed}
                  onChange={(e) => setField(p.id, "isFixed", e.target.checked)}
                />
                FIXO
              </FixedBox>
              
              <FixedBox>
                <input
                  type="checkbox"
                  checked={Boolean(d.isStar)}
                  onChange={(e) => setField(p.id, "isStar", e.target.checked)}
                />
                CRAQUE
              </FixedBox>


              <Actions>
                <Button type="button" onClick={() => handleSave(p)} disabled={busy}>
                  {busy ? "Salvando..." : "Salvar"}
                </Button>
              </Actions>
            </Row>
          );
        })}
      </List>
    </Card>
  );
}
