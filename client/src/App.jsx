import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MfaVerify from "./pages/MfaVerify";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UserGeoMap from "./pages/UserGeoMap";   // ✅ NEW IMPORT

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/mfa-verify" element={<MfaVerify />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW ROUTE FOR GEO MAP */}
      <Route
        path="/user/:entityId/map"
        element={
          <ProtectedRoute>
            <UserGeoMap />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
