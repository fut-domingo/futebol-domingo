import { usePlayers } from "../../hooks/usePlayers";
import { useMemo, useRef, useState, useEffect } from "react";

import {
  Wrapper, Header, Title, Filters, Pill, TableWrap, Table, Th, Td, Row,
  Pos, PosWrap, Arrow, PlayerCell, Avatar, PlayerName, Pts, Form, Bubble, NameBlock, Badges, Tag
} from "./styles";

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function Classification() {
  const players = usePlayers();
  const wrapRef = useRef(null);

  // ✅ default correto: rank ASC (1,2,3...)
  const [sortKey, setSortKey] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");

  function toggleSort(key) {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        return prevKey;
      }
      // ✅ ao trocar coluna: padrão DESC (exceto rank e name)
      setSortDir(key === "rank" || key === "name" ? "asc" : "desc");
      return key;
    });
  }

  function resetSort() {
    setSortKey("rank");
    setSortDir("asc");
    if (wrapRef.current) wrapRef.current.scrollLeft = 0;
  }

  // volta scroll pro início quando ordenar
  useEffect(() => {
    if (wrapRef.current) wrapRef.current.scrollLeft = 0;
  }, [sortKey, sortDir]);

  const ordered = useMemo(() => {
    const list = [...players];

    const get = (p, key) => {
      switch (key) {
        case "rank": return typeof p.rank === "number" ? p.rank : 9999;
        case "prevRank": return typeof p.prevRank === "number" ? p.prevRank : 9999;
        case "games": return p.games ?? 0;
        case "wins": return p.wins ?? 0;
        case "draws": return p.draws ?? 0;
        case "losses": return p.losses ?? 0;
        case "goals": return p.goals ?? 0;
        case "assists": return p.assists ?? 0;
        case "points": return p.points ?? 0;
        case "name": return (p.name ?? "").toLowerCase();
        default: return 0;
      }
    };

    list.sort((a, b) => {
      const av = get(a, sortKey);
      const bv = get(b, sortKey);

      // string
      if (typeof av === "string" || typeof bv === "string") {
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv), "pt-BR")
          : String(bv).localeCompare(String(av), "pt-BR");
      }

      // number
      return sortDir === "asc" ? (av - bv) : (bv - av);
    });

    return list;
  }, [players, sortKey, sortDir]);

  return (
    <Wrapper>
      <Header>
        <Title>CLASSIFICAÇÃO 2026</Title>
      </Header>

      {/* <Filters>
        <Pill style={{ opacity: 0.9, cursor: "pointer" }} onClick={resetSort}>
          Reset
        </Pill>
      </Filters> */}

      <TableWrap ref={wrapRef}>
        <Table>
          <thead>
            <tr>
              <Th $w="64px">Pos</Th>
              <Th $w="150px" onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                Jogador
              </Th>

              <Th $align="center" $w="44px" onClick={() => toggleSort("games")} style={{ cursor: "pointer" }}>J</Th>
              <Th $align="center" $w="44px" onClick={() => toggleSort("wins")} style={{ cursor: "pointer" }}>V</Th>
              <Th $align="center" $w="44px" onClick={() => toggleSort("draws")} style={{ cursor: "pointer" }}>E</Th>
              <Th $align="center" $w="44px" onClick={() => toggleSort("losses")} style={{ cursor: "pointer" }}>D</Th>
              <Th $align="center" $w="52px" onClick={() => toggleSort("goals")} style={{ cursor: "pointer" }}>GF</Th>
              <Th $align="center" $w="52px" onClick={() => toggleSort("assists")} style={{ cursor: "pointer" }}>A</Th>
              <Th $align="center" $w="56px" onClick={() => toggleSort("points")} style={{ cursor: "pointer" }}>Pts</Th>

              <Th $align="center" $w="100px">Ult 5</Th>
            </tr>
          </thead>

          <tbody>
            {ordered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: 18, color: "#777" }}>
                  Nenhum jogador cadastrado ainda. Vá em <b>/admin</b> e adicione.
                </td>
              </tr>
            ) : (
              ordered.map((p, idx) => {
                // ✅ POSIÇÃO OFICIAL (não muda quando você ordena por outra coluna)
                const currentRank = typeof p.rank === "number" ? p.rank : idx + 1;
                const prevRank = typeof p.prevRank === "number" ? p.prevRank : null;

                let dir = null;
                let delta = 0;

                if (prevRank !== null && typeof prevRank === "number") {
                  if (currentRank < prevRank) {
                    dir = "up";
                    delta = prevRank - currentRank;
                  } else if (currentRank > prevRank) {
                    dir = "down";
                    delta = currentRank - prevRank;
                  }
                }

                return (
                  <Row key={p.id}>
                    <Td $w="64px">
                      <PosWrap>
                        <Pos>{currentRank}</Pos>
                        {dir && (
                          <Arrow dir={dir}>
                            {dir === "up" ? "▲" : "▼"} {delta}
                          </Arrow>
                        )}
                      </PosWrap>
                    </Td>

                    <Td $w="300px">
                      <PlayerCell>
                        <Avatar>
                          {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
                        </Avatar>

                        <NameBlock>
                          <PlayerName>{p.name}</PlayerName>
                          <Badges>
                            {p.isFixed ? <Tag>📌 FIXO</Tag> : null}
                          </Badges>
                        </NameBlock>
                      </PlayerCell>
                    </Td>

                    <Td $align="center" $w="44px">{p.games ?? 0}</Td>
                    <Td $align="center" $w="44px">{p.wins ?? 0}</Td>
                    <Td $align="center" $w="44px">{p.draws ?? 0}</Td>
                    <Td $align="center" $w="44px">{p.losses ?? 0}</Td>
                    <Td $align="center" $w="52px">{p.goals ?? 0}</Td>
                    <Td $align="center" $w="52px">{p.assists ?? 0}</Td>
                    <Td $align="center" $w="56px"><Pts>{p.points ?? 0}</Pts></Td>

                    <Td $align="center" $w="110px">
                      <Form>
                        {(p.form ?? []).slice(0, 5).map((r, i) => (
                          <Bubble key={i} value={r}>{r}</Bubble>
                        ))}
                      </Form>
                    </Td>
                  </Row>
                );
              })
            )}
          </tbody>
        </Table>
      </TableWrap>
    </Wrapper>
  );
}
