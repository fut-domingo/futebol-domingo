import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

export function useMatches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // ✅ sempre pela data do jogo
    const q = query(collection(db, "matches"), orderBy("matchDateTS", "asc"));
    return onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return matches;
}
