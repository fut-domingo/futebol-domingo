import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";

export default function AuthButtons() {
  const { user, loading } = useAuth();

  async function login() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  if (loading) return null;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {user ? (
        <>
          <span style={{ fontWeight: 900, color: "rgba(42,0,79,0.7)", fontSize: 12 }}>
            {user.email}
          </span>
          <button
            onClick={logout}
            style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #efe6ff", background: "#fff", fontWeight: 1000, cursor: "pointer" }}
          >
            Sair
          </button>
        </>
      ) : (
        <button
          onClick={login}
          style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #efe6ff", background: "#fff", fontWeight: 1000, cursor: "pointer" }}
        >
          Entrar (Google)
        </button>
      )}
    </div>
  );
}
