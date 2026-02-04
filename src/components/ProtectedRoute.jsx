import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ALLOWED_EMAILS = ["boliinhafutebol@gmail.com"]; // seu email aqui

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const email = (user?.email || "").toLowerCase();
  const isAllowed = user && ALLOWED_EMAILS.includes(email);

  if (!isAllowed) return <Navigate to="/" replace />;

  return children;
}
