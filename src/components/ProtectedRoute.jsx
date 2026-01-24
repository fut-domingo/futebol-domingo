import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ALLOWED_EMAILS = [
  "boliinhafutebol@gmail.com", // ✅ coloque seu email aqui
];

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!ALLOWED_EMAILS.includes(user.email)) return <Navigate to="/" replace />;

  return children;
}
