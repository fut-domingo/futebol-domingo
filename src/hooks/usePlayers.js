import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export function usePlayers() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "players"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(list);
    });

    return () => unsub();
  }, []);

  return players;
}
