import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  // No token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Invalid JWT format check
  if (token.split(".").length !== 3) {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
