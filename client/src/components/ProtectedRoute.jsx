import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (user?.role === "TRAINER") {
      return <Navigate to="/trainer" replace />;
    }

    if (user?.role === "CANDIDATE") {
      return <Navigate to="/candidate" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;