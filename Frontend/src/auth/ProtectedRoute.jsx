import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Wraps protected routes.
 * - Not logged in  → /login (remembers intended path)
 * - Wrong role     → their own dashboard
 * - Correct role   → renders the child route
 */
const ProtectedRoute = ({ allowedRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;