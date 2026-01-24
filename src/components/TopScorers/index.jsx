import { usePlayers } from "../../hooks/usePlayers";
import {
  Grid, Card, Head, HeadTitle, List, Item, Rank, Avatar, NameBox, Name, Sub, Value
} from "./styles";

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function TopScorers() {
  const players = usePlayers();

  const topGoals = [...players]
    .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
    .slice(0, 5);

  const topAssists = [...players]
    .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
    .slice(0, 5);

  return (
    <Grid>
      <Card>
        <Head>
          <HeadTitle>GOLS</HeadTitle>
        </Head>

        <List>
          {topGoals.map((p, i) => (
            <Item key={p.id}>
              <Rank>{i + 1}</Rank>
              <Avatar>
                  {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
              </Avatar>

              <NameBox>
                <Name>{p.name}</Name>
                <Sub>—</Sub>
              </NameBox>

              <Value>{p.goals ?? 0}</Value>
            </Item>
          ))}
        </List>
      </Card>

      <Card>
        <Head>
          <HeadTitle>ASSISTÊNCIAS</HeadTitle>
        </Head>

        <List>
          {topAssists.map((p, i) => (
            <Item key={p.id}>
              <Rank>{i + 1}</Rank>
              <Avatar>
                {p.photoURL ? <img src={p.photoURL} alt={p.name} /> : initials(p.name)}
              </Avatar>

              <NameBox>
                <Name>{p.name}</Name>
                <Sub>—</Sub>
              </NameBox>

              <Value>{p.assists ?? 0}</Value>
            </Item>
          ))}
        </List>
      </Card>
    </Grid>
  );
}
