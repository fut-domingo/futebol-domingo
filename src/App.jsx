import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Sorteio from "./pages/Sorteio";
import PartidasAdmin from "./pages/PartidasAdmin";
import EditarPartida from "./pages/EditarPartida";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sorteio" element={<Sorteio />} />

        <Route path="/admin/partidas" element={
  <ProtectedRoute><PartidasAdmin /></ProtectedRoute>
} />

<Route path="/admin/partidas/:id" element={
  <ProtectedRoute><EditarPartida /></ProtectedRoute>
} />


        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partidas"
          element={
            <ProtectedRoute>
              <PartidasAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partidas/:id"
          element={
            <ProtectedRoute>
              <EditarPartida />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
